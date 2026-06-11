import { GoogleGenAI } from "@google/genai";
import { generateContentWithRetry } from "./utils";

export class ReportAgent {
  constructor(private ai: GoogleGenAI, private onUpdate: (type: string, payload: any) => void) {}

  async generate(verifiedDataObj: any, prompt: string) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "result-1", status: "running" });
    this.onUpdate("timeline", { id: "report", label: "Generating final report...", status: "running" });

    this.onUpdate("reasoning", "Asking Gemini to synthesize executive summary from verified datasets...");
    
    let reportText = "Executive Summary synthesized successfully.";
    try {
      const response = await generateContentWithRetry(this.ai, {
        model: "gemini-2.5-flash",
        contents: `Given the user prompt "${prompt}" and the following verified data payload: ${JSON.stringify(verifiedDataObj)}, write a 2-3 sentence executive summary that strictly relies on the provided data.`
      }, this.onUpdate);
      reportText = response.text || reportText;
    } catch (e) {
      this.onUpdate("reasoning", "Gemini synthesis failed, returning raw verified data payload.");
      reportText = JSON.stringify(verifiedDataObj);
    }
    
    this.onUpdate("reasoning", "Report generated successfully.");

    this.onUpdate("timeline", { id: "report", label: "Executive Summary generated", status: "completed" });
    this.onUpdate("graph_update", { id: "result-1", status: "completed" });
    this.updateAgentState("completed");

    return reportText;
  }

  async generateFromMemory(memoryData: any) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "result-1", status: "running" });
    this.onUpdate("timeline", { id: "report", label: "Generating report from memory...", status: "running" });

    this.onUpdate("reasoning", "Formatting cached memory into the final executive summary...");
    
    this.onUpdate("timeline", { id: "report", label: "Executive Summary generated", status: "completed" });
    this.onUpdate("graph_update", { id: "result-1", status: "completed" });
    this.updateAgentState("completed");

    return memoryData.data.report;
  }

  private updateAgentState(state: string) {
    this.onUpdate("agent_update", { id: "report", state });
  }
}
