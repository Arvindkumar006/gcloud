import { GoogleGenAI } from "@google/genai";

export class CostOptimizationAgent {
  constructor(private ai: GoogleGenAI, private onUpdate: (type: string, payload: any) => void) {}

  async optimizeAndSelect(providers: any[]) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "cost-1", status: "running" });
    this.onUpdate("timeline", { id: "cost", label: "Optimizing provider selection...", status: "running" });

    this.onUpdate("reasoning", "Asking Gemini to evaluate the API options based on price, latency, and reliability...");
    await new Promise(r => setTimeout(r, 1000));
    
    // Fallback best choice in case Gemini fails
    let bestProvider = providers.sort((a, b) => a.cost - b.cost)[0];

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Evaluate the following API providers: ${JSON.stringify(providers)}. 
Select the single best provider balancing cost, latency, and reliability.
Return ONLY valid JSON with the selected provider object.`
      });

      let text = response.text || "{}";
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(text);
      if (parsed.provider) {
        bestProvider = parsed;
        this.onUpdate("reasoning", `Gemini selected provider: ${bestProvider.provider} at $${bestProvider.cost}.`);
      }
    } catch (e) {
      this.onUpdate("reasoning", "Gemini selection failed. Defaulting to lowest cost provider: " + bestProvider.provider);
    }

    this.onUpdate("communication", { sender: "Cost Optimization", receiver: "Payment Execution", message: `Selected ${bestProvider.provider} for $${bestProvider.cost}. Proceed with Lend402 JIT payment.` });
    
    this.onUpdate("timeline", { id: "cost", label: "Optimal provider selected", status: "completed" });
    this.onUpdate("graph_update", { id: "cost-1", status: "completed" });
    this.updateAgentState("completed");

    return bestProvider;
  }

  private updateAgentState(state: string) {
    this.onUpdate("agent_update", { id: "cost", state });
  }
}
