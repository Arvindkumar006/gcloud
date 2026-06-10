import { GoogleGenAI } from "@google/genai";

export class ResearchAgent {
  constructor(private ai: GoogleGenAI, private onUpdate: (type: string, payload: any) => void) {}

  async executeFreeSearch(taskGraph: any) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "task-1", status: "running" });
    this.onUpdate("timeline", { id: "research-start", label: "Searching free sources...", status: "running" });

    this.onUpdate("reasoning", "Querying Yahoo Finance, Google News, and standard SEC filings...");
    await new Promise(r => setTimeout(r, 2000));
    
    this.onUpdate("reasoning", "Free sources lack deep institutional analyst sentiment needed to satisfy the goal.");
    this.onUpdate("communication", { sender: "Research", receiver: "Cost Optimization", message: "Free sources insufficient. Premium market intelligence required." });
    
    this.onUpdate("timeline", { id: "research-start", label: "Free search completed", status: "completed" });
    this.onUpdate("graph_update", { id: "task-1", status: "completed" });
    
    // Also mark decision node as completed
    this.onUpdate("graph_update", { id: "decision-1", status: "completed" });

    this.updateAgentState("completed");

    return { sufficient: false, data: ["Free News Snippet 1", "Free Stock Price"] };
  }

  private updateAgentState(state: string) {
    this.onUpdate("agent_update", { id: "research", state });
  }
}
