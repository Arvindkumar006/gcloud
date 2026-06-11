import { GoogleGenAI } from "@google/genai";
import { PROVIDER_REGISTRY } from "./ProviderRegistry";

export class ApiDiscoveryAgent {
  constructor(private ai: GoogleGenAI, private onUpdate: (type: string, payload: any) => void) {}

  async discoverApis(prompt: string, taskGraph: any, freeData: any) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "api-1", status: "running" });
    this.onUpdate("timeline", { id: "discovery-start", label: "Comparing premium providers...", status: "running" });

    // Step 5: Proper Premium Skip Logic
    if (freeData && freeData.sufficient) {
      this.onUpdate("reasoning", "Free sources fully satisfy this request. Premium discovery skipped.");
      this.onUpdate("communication", { 
        sender: "API Discovery", 
        receiver: "Cost Optimization", 
        message: "Premium APIs not required. Passing control back to orchestrator." 
      });
      this.onUpdate("timeline", { id: "discovery-start", label: "Premium APIs not required", status: "completed" });
      this.onUpdate("graph_update", { id: "api-1", status: "completed" });
      this.updateAgentState("completed");
      return [];
    }

    this.onUpdate("reasoning", "Analyzing prompt and research output to infer required API capabilities...");
    
    let requiredCapabilities: string[] = [];
    let reasoning = "";

    try {
      // Step 3: Gemini + Deterministic Fallback
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the following user prompt: "${prompt}".
Also consider that free web search was insufficient.
Determine which premium API capabilities are required to fulfill the prompt.
Valid capabilities are: "market-data", "analyst-ratings", "institutional-sentiment", "earnings", "sec-filings", "semiconductor-industry", "financial-news", "macroeconomics", "crypto", "forex".
Return ONLY valid JSON in the format: {"requiredCapabilities": ["cap1", "cap2"], "reasoning": "string"}. Do not allow markdown formatting.`
      });

      let text = response.text || "{}";
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(text);
      
      requiredCapabilities = parsed.requiredCapabilities || [];
      reasoning = parsed.reasoning || "Capabilities inferred.";
      
      if (requiredCapabilities.length > 0) {
        this.onUpdate("reasoning", `Gemini inferred required capabilities: ${requiredCapabilities.join(", ")}.\nReasoning: ${reasoning}`);
      } else {
        throw new Error("Empty capabilities returned from Gemini");
      }
    } catch (e: any) {
      this.onUpdate("reasoning", `Gemini inference failed (${e.message}). Falling back to keyword extraction.`);
      
      const lowerPrompt = prompt.toLowerCase();
      const keywords: Record<string, string[]> = {
        "market-data": ["price", "market", "trading", "volume", "chart"],
        "analyst-ratings": ["analyst", "rating", "upgrade", "downgrade", "target"],
        "institutional-sentiment": ["sentiment", "institution", "hedge fund", "whale", "smart money", "market sentiment"],
        "earnings": ["earnings", "revenue", "q1", "q2", "q3", "q4", "eps"],
        "sec-filings": ["sec", "filing", "10-k", "10-q", "8-k", "disclosure"],
        "semiconductor-industry": ["semiconductor", "chip", "nvidia", "amd", "intel", "tsmc"],
        "financial-news": ["news", "headline", "announcement", "press release"],
        "macroeconomics": ["macro", "inflation", "cpi", "fed", "interest rate", "gdp"],
        "crypto": ["crypto", "bitcoin", "ethereum", "blockchain", "token", "coin"],
        "forex": ["forex", "fx", "currency", "exchange rate", "usd", "eur", "gbp"]
      };

      for (const [cap, words] of Object.entries(keywords)) {
        if (words.some(w => lowerPrompt.includes(w))) {
          requiredCapabilities.push(cap);
        }
      }
      
      if (requiredCapabilities.length === 0) {
        requiredCapabilities = ["market-data", "financial-news"];
      }
      this.onUpdate("reasoning", `Fallback keyword extractor inferred required capabilities: ${requiredCapabilities.join(", ")}.`);
    }

    if (PROVIDER_REGISTRY.length === 0) {
      this.onUpdate("reasoning", "Provider registry is empty.");
      this.finalizeDiscovery();
      return [];
    }

    // Step 4: Improve Provider Ranking
    let matchedProviders = PROVIDER_REGISTRY.map(provider => {
      let matches = 0;
      for (const cap of requiredCapabilities) {
        if (provider.capabilities.includes(cap)) {
          matches++;
        }
      }
      
      const capabilityCoverage = requiredCapabilities.length > 0 ? matches / requiredCapabilities.length : 0;
      
      // Do not rank providers with 0 capability overlap
      if (capabilityCoverage === 0) {
        return { provider, score: 0 };
      }
      
      const reliabilityScore = parseFloat(provider.reliability.replace('%', '')) / 100;
      const inverseCost = 1 / (provider.cost + 1);
      
      const score = (0.7 * capabilityCoverage) + (0.2 * reliabilityScore) + (0.1 * inverseCost);
      
      return { provider, score };
    });

    // Sort descending by score
    matchedProviders.sort((a, b) => b.score - a.score);

    // Return only meaningful matches (score > 0)
    const selectedProviders = matchedProviders
      .filter(p => p.score > 0)
      .map(p => p.provider);

    if (selectedProviders.length === 0) {
      this.onUpdate("reasoning", "No providers meaningfully matched the required capabilities.");
      this.finalizeDiscovery();
      return [];
    }

    this.onUpdate("reasoning", `Matched ${selectedProviders.length} providers. Scored by coverage, reliability, and cost.`);
    this.onUpdate("communication", { 
      sender: "API Discovery", 
      receiver: "Cost Optimization", 
      message: `Identified ${selectedProviders.length} candidate premium providers based on required capabilities.` 
    });
    
    this.finalizeDiscovery();
    return selectedProviders;
  }

  private finalizeDiscovery() {
    this.onUpdate("timeline", { id: "discovery-start", label: "Candidate APIs selected", status: "completed" });
    this.onUpdate("graph_update", { id: "api-1", status: "completed" });
    this.updateAgentState("completed");
  }

  private updateAgentState(state: string) {
    this.onUpdate("agent_update", { id: "discovery", state });
  }
}
