import { GoogleGenAI } from "@google/genai";

export class CostOptimizationAgent {
  constructor(private ai: GoogleGenAI, private onUpdate: (type: string, payload: any) => void) {}

  async optimizeAndSelect(providers: any[]) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "cost-1", status: "running" });
    this.onUpdate("timeline", { id: "cost", label: "Optimizing provider selection...", status: "running" });

    this.onUpdate("reasoning", "Asking Gemini to evaluate the API options based on price, latency, and reliability...");
    await new Promise(r => setTimeout(r, 1000));
    
    // Fallback sorted array in case Gemini fails
    let sortedProviders = [...providers].sort((a, b) => a.cost - b.cost);

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Evaluate the following API providers: ${JSON.stringify(providers)}. 
Sort them from best to worst balancing cost, latency, and reliability.
Return ONLY valid JSON with an array of the sorted provider objects.`
      });

      let text = response.text || "[]";
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].provider) {
        sortedProviders = parsed;
        this.onUpdate("reasoning", `Gemini sorted providers. Top choice: ${sortedProviders[0].provider} at $${sortedProviders[0].cost}.`);
      } else {
        throw new Error("Invalid Gemini response format");
      }
    } catch (e) {
      this.onUpdate("reasoning", "Gemini sorting failed. Defaulting to lowest cost sort. Top choice: " + sortedProviders[0].provider);
    }

    this.onUpdate("communication", { sender: "Cost Optimization", receiver: "Payment Execution", message: `Selected ${sortedProviders[0].provider} as primary. Passing alternatives to payment execution.` });
    
    this.onUpdate("timeline", { id: "cost", label: "Optimal providers sorted", status: "completed" });
    this.onUpdate("graph_update", { id: "cost-1", status: "completed" });
    this.updateAgentState("completed");

    return sortedProviders;
  }

  private updateAgentState(state: string) {
    this.onUpdate("agent_update", { id: "cost", state });
  }
}
