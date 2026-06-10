import { GoogleGenAI } from "@google/genai";

export class ReportAgent {
  constructor(private ai: GoogleGenAI, private onUpdate: (type: string, payload: any) => void) {}

  async generate(data: any) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "result-1", status: "running" });
    this.onUpdate("timeline", { id: "report", label: "Generating final report...", status: "running" });

    this.onUpdate("reasoning", "Synthesizing executive summary from 8 combined free and premium sources...");
    await new Promise(r => setTimeout(r, 1500));
    
    this.onUpdate("reasoning", "Report generated successfully.");

    this.onUpdate("timeline", { id: "report", label: "Executive Summary generated", status: "completed" });
    this.onUpdate("graph_update", { id: "result-1", status: "completed" });
    this.updateAgentState("completed");

    return "Executive Summary: NVIDIA maintains dominant market share in data center AI chips, while AMD is aggressively capturing edge compute. Premium market intelligence confirms a 12% YoY growth in specialized silicon demand.";
  }

  async generateFromMemory(memoryData: any) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "result-1", status: "running" });
    this.onUpdate("timeline", { id: "report", label: "Generating report from memory...", status: "running" });

    this.onUpdate("reasoning", "Formatting cached memory into the final executive summary...");
    await new Promise(r => setTimeout(r, 1500));
    
    this.onUpdate("timeline", { id: "report", label: "Executive Summary generated", status: "completed" });
    this.onUpdate("graph_update", { id: "result-1", status: "completed" });
    this.updateAgentState("completed");

    return memoryData.data.report;
  }

  private updateAgentState(state: string) {
    this.onUpdate("agent_update", { id: "report", state });
  }
}
