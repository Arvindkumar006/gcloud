import { GoogleGenAI } from "@google/genai";

export class PlannerAgent {
  constructor(private ai: GoogleGenAI, private onUpdate: (type: string, payload: any) => void) {}

  async generatePlan(prompt: string) {
    this.updateAgentState("running");
    this.onUpdate("timeline", { id: "planner-start", label: "Planning started", status: "running" });

    this.onUpdate("reasoning", "Breaking goal into subtasks...");
    await new Promise(r => setTimeout(r, 1000));
    
    const taskGraph = [
      { id: "goal", label: "Analyze NVIDIA & AMD", type: "goal", status: "completed" },
      { id: "task-1", label: "Research Free Sources", type: "task", status: "waiting" },
      { id: "task-2", label: "Memory Check", type: "task", status: "waiting" },
      { id: "decision-1", label: "Need Premium?", type: "decision", status: "waiting" },
      { id: "api-1", label: "API Discovery", type: "api", status: "waiting" },
      { id: "cost-1", label: "Cost Optimization", type: "decision", status: "waiting" },
      { id: "payment-1", label: "Payment Execution", type: "payment", status: "waiting" },
      { id: "verify-1", label: "Verification", type: "task", status: "waiting" },
      { id: "result-1", label: "Generate Final Report", type: "result", status: "waiting" }
    ];

    this.onUpdate("graph", taskGraph);
    this.onUpdate("timeline", { id: "planner-start", label: "Task graph created", status: "completed" });
    
    this.onUpdate("communication", { sender: "Planner", receiver: "Research", message: "Find free sources for the prompt." });
    
    this.updateAgentState("completed");
    return taskGraph;
  }

  private updateAgentState(state: string) {
    this.onUpdate("agent_update", { id: "planner", state });
  }
}
