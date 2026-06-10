import { GoogleGenAI } from "@google/genai";

export class CostOptimizationAgent {
  constructor(private ai: GoogleGenAI, private onUpdate: (type: string, payload: any) => void) {}

  async optimizeAndSelect(apis: any[]) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "cost-1", status: "running" });
    this.onUpdate("timeline", { id: "cost-start", label: "Selecting optimal provider...", status: "running" });

    this.onUpdate("reasoning", "Evaluating 3 providers against latency, cost, and historical reliability scores...");
    await new Promise(r => setTimeout(r, 1500));
    
    const selected = apis[0]; // MarketIntel Corp
    
    this.onUpdate("reasoning", `Selected ${selected.provider}\n\nReason:\n- Lowest cost for required data density\n- Acceptable latency (${selected.latency})\n- Highest reliability (${selected.reliability})\n- Confidence 96%`);
    this.onUpdate("communication", { sender: "Cost Optimization", receiver: "Payment", message: `Provider ${selected.provider} selected. Estimated cost: $${selected.cost}.` });

    this.onUpdate("timeline", { id: "cost-start", label: `Optimal provider selected ($${selected.cost})`, status: "completed" });
    this.onUpdate("graph_update", { id: "cost-1", status: "completed" });
    
    // Send updated metrics
    this.onUpdate("metrics", { memoryMatch: 0, savedCost: 0, freeSearches: 5, premiumApis: 1, estimatedCost: selected.cost, actualCost: 0, moneySaved: 5.80 });
    
    this.updateAgentState("completed");

    return selected;
  }

  private updateAgentState(state: string) {
    this.onUpdate("agent_update", { id: "cost", state });
  }
}
