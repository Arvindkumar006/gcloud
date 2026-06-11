import { GoogleGenAI } from "@google/genai";
import { PROVIDER_REGISTRY } from "./ProviderRegistry";

export class ApiDiscoveryAgent {
  constructor(private ai: GoogleGenAI, private onUpdate: (type: string, payload: any) => void) {}

  async discoverApis(prompt: string, taskGraph: any, freeData: any) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "api-1", status: "running" });
    this.onUpdate("timeline", { id: "discovery-start", label: "Comparing premium providers...", status: "running" });

    // Step 6: Use freeData short-circuit
    if (freeData && freeData.sufficient) {
      this.onUpdate("reasoning", "Free data was sufficient. Skipping premium API discovery.");
      this.onUpdate("timeline", { id: "discovery-start", label: "Premium APIs not required", status: "completed" });
      this.onUpdate("graph_update", { id: "api-1", status: "completed" });
      this.updateAgentState("completed");
      return [];
    }

    this.onUpdate("reasoning", "Analyzing prompt and research output to infer required API capabilities...");
    
    let requiredCapabilities: string[] = [];
    let reasoning = "";

    try {
      // Step 2: Use Gemini to Infer Required Capabilities
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
      // Step 8: Fallback to keyword extraction
      this.onUpdate("reasoning", `Gemini inference failed (${e.message}). Falling back to keyword extraction.`);
      
      const lowerPrompt = prompt.toLowerCase();
      const keywords: Record<string, string[]> = {
        "market-data": ["price", "market", "trading", "volume", "chart"],
        "analyst-ratings": ["analyst", "rating", "upgrade", "downgrade", "target"],
        "institutional-sentiment": ["sentiment", "institution", "hedge fund", "whale", "smart money"],
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
        // Broad fallback
        requiredCapabilities = ["market-data", "financial-news"];
      }
      this.onUpdate("reasoning", `Fallback keyword extractor inferred required capabilities: ${requiredCapabilities.join(", ")}.`);
    }

    // Step 3: Dynamically Match Providers
    if (PROVIDER_REGISTRY.length === 0) {
      this.onUpdate("reasoning", "Provider registry is empty.");
      this.finalizeDiscovery();
      return [];
    }

    let matchedProviders = PROVIDER_REGISTRY.map(provider => {
      let matches = 0;
      for (const cap of requiredCapabilities) {
        if (provider.capabilities.includes(cap)) {
          matches++;
        }
      }
      const score = requiredCapabilities.length > 0 ? matches / requiredCapabilities.length : 0;
      return { provider, score, matches };
    });

    // Sort descending by score
    matchedProviders.sort((a, b) => b.score - a.score);

    // Filter score > 0
    const selectedProviders = matchedProviders
      .filter(p => p.score > 0)
      .map(p => p.provider);

    if (selectedProviders.length === 0) {
      this.onUpdate("reasoning", "No providers matched the required capabilities.");
      this.finalizeDiscovery();
      return [];
    }

    this.onUpdate("reasoning", `Matched ${selectedProviders.length} providers from registry. Selected highest coverage providers.`);
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
