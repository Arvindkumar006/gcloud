import { GoogleGenAI } from "@google/genai";
import { DEMO_CONFIG } from "./config";
import { SearchProvider, TavilySearchProvider, SearchResult } from "./SearchProviders";
import { parseJsonSafely, generateContentWithRetry } from "./utils";

export class ResearchAgent {
  private queryCache: Map<string, SearchResult[]> = new Map();

  constructor(private ai: GoogleGenAI, private onUpdate: (type: string, payload: any) => void) {}

  async executeFreeSearch(prompt: string) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "task-1", status: "running" });
    this.onUpdate("timeline", { id: "research-start", label: "Searching free sources...", status: "running" });

    this.onUpdate("reasoning", "Invoking Gemini to formulate free-tier search strategy...");
    
    let sufficient = false;
    let reasoning = "";
    let results: SearchResult[] = [];
    
    try {
      if (DEMO_CONFIG.TRIGGER_RESEARCH_FAILURE) {
        throw new Error("Demo trigger: Research failure");
      }

      // 1. Generate optimized search query
      const queryResponse = await generateContentWithRetry(this.ai, {
        model: "gemini-2.5-flash",
        contents: `Given the user prompt: "${prompt}", generate an optimized web search query. Return ONLY the search string, nothing else.`
      });
      const query = queryResponse.text ? queryResponse.text.trim() : prompt;
      
      // 2. Execute search with a Provider
      const provider: SearchProvider = new TavilySearchProvider();
      this.onUpdate("reasoning", `Executing search query: "${query}" via ${provider.name}...`);

      if (this.queryCache.has(query)) {
        this.onUpdate("reasoning", `Cache hit for query: "${query}". Returning cached results.`);
        results = this.queryCache.get(query)!;
      } else {
        let attempt = 0;
        let maxAttempts = 3;
        let success = false;
        
        while (attempt < maxAttempts) {
          try {
            results = await provider.search(query);
            success = true;
            this.queryCache.set(query, results);
            break;
          } catch (err: any) {
            attempt++;
            if (attempt >= maxAttempts) {
              throw new Error(`Search API failed after 3 attempts: ${err.message}`);
            }
            const delay = attempt === 1 ? 1000 : 2000;
            this.onUpdate("reasoning", `Search API attempt ${attempt} failed. Retrying in ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
          }
        }

        if (!success) {
          throw new Error("Live search unavailable.");
        }
      }

      // 3. Evaluate sufficiency using Gemini
      this.onUpdate("reasoning", "Evaluating retrieved results for sufficiency...");
      const evalResponse = await generateContentWithRetry(this.ai, {
        model: "gemini-2.5-flash",
        contents: `Evaluate if the following search results are sufficient to entirely fulfill the user prompt: "${prompt}".
Search Results: ${JSON.stringify(results.slice(0, 5))}
Return ONLY valid JSON in this format: {"sufficient": boolean, "reasoning": "string"}.`
      });

      const parseRes = parseJsonSafely(evalResponse.text || "{}");
      if (parseRes.success && parseRes.data) {
        sufficient = parseRes.data.sufficient || false;
        reasoning = parseRes.data.reasoning || "Evaluation completed.";
      } else {
        sufficient = false;
        reasoning = `Gemini evaluation parsing failed: ${parseRes.error}. Defaulting to insufficient.`;
      }
      this.onUpdate("reasoning", `Gemini Research Evaluation: ${reasoning}`);

    } catch (e: any) {
      this.onUpdate("reasoning", `Free search failed: ${e.message}`);
      sufficient = false;
      reasoning = "Live search unavailable.";
      results = []; // Never fabricate data
    }
    
    if (!sufficient) {
      this.onUpdate("communication", { sender: "Research", receiver: "Cost Optimization", message: "Free sources insufficient. Premium market intelligence required." });
      this.onUpdate("graph_update", { id: "decision-1", status: "completed" });
    }
    
    this.onUpdate("timeline", { id: "research-start", label: "Free search completed", status: "completed" });
    this.onUpdate("graph_update", { id: "task-1", status: "completed" });
    this.updateAgentState("completed");

    return { sufficient, reasoning, results };
  }

  private updateAgentState(state: string) {
    this.onUpdate("agent_update", { id: "research", state });
  }
}
