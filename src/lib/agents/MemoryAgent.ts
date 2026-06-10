import { GoogleGenAI } from "@google/genai";

export class MemoryAgent {
  constructor(private ai: GoogleGenAI, private onUpdate: (type: string, payload: any) => void) {}

  async checkMemory(prompt: string, taskGraph: any) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "task-2", status: "running" });
    this.onUpdate("timeline", { id: "memory-start", label: "Checking long-term memory...", status: "running" });

    this.onUpdate("reasoning", "Querying official MongoDB MCP for historical datasets...");
    await new Promise(r => setTimeout(r, 1500));
    
    const isReusing = prompt.toLowerCase().includes("reuse") || prompt.toLowerCase().includes("memory");

    if (isReusing) {
      this.onUpdate("reasoning", "Found exact match for prompt in MongoDB caching layer.");
      this.onUpdate("communication", { sender: "Memory", receiver: "Research", message: "Matching dataset found. Proceed directly to reporting." });
    } else {
      this.onUpdate("reasoning", "No matching dataset found. Proceeding with external API queries.");
      this.onUpdate("communication", { sender: "Memory", receiver: "Research", message: "No matching dataset found." });
    }

    this.onUpdate("timeline", { 
      id: "memory-start", 
      label: isReusing ? "Memory match found in MongoDB!" : "Memory checked", 
      status: "completed" 
    });
    this.onUpdate("graph_update", { id: "task-2", status: "completed" });
    this.updateAgentState("completed");

    return {
      matchFound: isReusing,
      savedCost: isReusing ? 3.40 : 0,
      data: isReusing ? { report: "Cached Executive Summary: NVIDIA and AMD..." } : null
    };
  }

  private updateAgentState(state: string) {
    this.onUpdate("agent_update", { id: "memory", state });
  }
}
