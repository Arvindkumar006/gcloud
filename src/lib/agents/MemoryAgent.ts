import { GoogleGenAI } from "@google/genai";
import { MemoryStore } from "./MemoryStore";

export class MemoryAgent {
  constructor(private ai: GoogleGenAI, private onUpdate: (type: string, payload: any) => void) {}

  async checkMemory(prompt: string, taskGraph: any) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "task-2", status: "running" });
    this.onUpdate("timeline", { id: "memory-start", label: "Checking long-term memory...", status: "running" });

    this.onUpdate("reasoning", "Querying in-memory MCP for historical cached datasets...");
    
    const cachedRecord = MemoryStore.get(prompt);

    if (cachedRecord) {
      this.onUpdate("reasoning", "Found exact match for prompt in caching layer.");
      this.onUpdate("communication", { sender: "Memory", receiver: "Orchestrator", message: "Matching dataset found. Proceed directly to reporting." });
      
      this.onUpdate("timeline", { id: "memory-start", label: "Memory match found!", status: "completed" });
      this.onUpdate("graph_update", { id: "task-2", status: "completed" });
      this.updateAgentState("completed");

      return {
        matchFound: true,
        savedCost: cachedRecord.savings || 4.50,
        data: cachedRecord
      };
    } else {
      this.onUpdate("reasoning", "No matching dataset found. Proceeding with external API queries.");
      this.onUpdate("communication", { sender: "Memory", receiver: "Research", message: "No match found. Proceed with search." });
      
      this.onUpdate("timeline", { id: "memory-start", label: "Memory checked", status: "completed" });
      this.onUpdate("graph_update", { id: "task-2", status: "completed" });
      this.updateAgentState("completed");

      return {
        matchFound: false,
        savedCost: 0,
        data: null
      };
    }
  }

  async saveToMemory(prompt: string, report: string, dataset: any, savings: number) {
    MemoryStore.set(prompt, { prompt, report, dataset, savings });
    this.onUpdate("reasoning", "Memory Evolution: Saved final report, reasoning path, and dataset to MCP.");
  }

  private updateAgentState(state: string) {
    this.onUpdate("agent_update", { id: "memory", state });
  }
}
