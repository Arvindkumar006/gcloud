import { GoogleGenAI } from "@google/genai";
import { DEMO_CONFIG } from "./config";

export class ResearchAgent {
  constructor(private ai: GoogleGenAI, private onUpdate: (type: string, payload: any) => void) {}

  async executeFreeSearch(prompt: string) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "task-1", status: "running" });
    this.onUpdate("timeline", { id: "research-start", label: "Searching free sources...", status: "running" });

    this.onUpdate("reasoning", "Invoking Gemini to formulate free-tier search strategy...");
    
    let sufficient = false;
    let data: any[] = [];
    
    try {
      if (DEMO_CONFIG.TRIGGER_RESEARCH_FAILURE) {
        throw new Error("Demo trigger: Research failure");
      }

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Evaluate the user prompt: "${prompt}". 
Determine if free, public web sources (like Yahoo Finance, Google News) are sufficient to fulfill the prompt entirely.
Return ONLY valid JSON: {"sufficient": boolean, "reasoning": "string"}.`
      });

      let text = response.text || "{}";
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(text);
      
      sufficient = parsed.sufficient || false;
      this.onUpdate("reasoning", `Gemini Research Evaluation: ${parsed.reasoning}`);
      
      data = ["Simulated free search snippet"];

    } catch (e) {
      this.onUpdate("reasoning", "Free search encountered connectivity failure or demo failure trigger.");
      throw new Error("Research Failure");
    }
    
    if (!sufficient) {
      this.onUpdate("communication", { sender: "Research", receiver: "Cost Optimization", message: "Free sources insufficient. Premium market intelligence required." });
      this.onUpdate("graph_update", { id: "decision-1", status: "completed" });
    }
    
    this.onUpdate("timeline", { id: "research-start", label: "Free search completed", status: "completed" });
    this.onUpdate("graph_update", { id: "task-1", status: "completed" });
    this.updateAgentState("completed");

    return { sufficient, data };
  }

  private updateAgentState(state: string) {
    this.onUpdate("agent_update", { id: "research", state });
  }
}
