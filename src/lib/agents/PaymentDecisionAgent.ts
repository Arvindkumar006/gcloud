import { GoogleGenAI } from "@google/genai";

export class PaymentDecisionAgent {
  constructor(private ai: GoogleGenAI, private onUpdate: (type: string, payload: any) => void) {}

  async processPayment(apiDetails: any) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "payment-1", status: "running" });
    this.onUpdate("timeline", { id: "payment", label: "Processing Lend402 JIT payment...", status: "running" });

    this.onUpdate("reasoning", `Evaluating cost threshold for ${apiDetails.provider} ($${apiDetails.cost}).`);
    await new Promise(r => setTimeout(r, 1000));
    
    if (apiDetails.cost > 3.00) {
      this.onUpdate("reasoning", "Cost exceeds autonomous threshold. Emitting manual approval request.");
      this.onUpdate("communication", { sender: "Payment Decision", receiver: "User", message: `Require human approval for $${apiDetails.cost} payment to ${apiDetails.provider}.` });
      
      const approved = await this.requestApproval(apiDetails.cost);
      if (!approved) {
        this.onUpdate("reasoning", "Human supervisor declined the transaction.");
        this.updateAgentState("failed");
        this.onUpdate("graph_update", { id: "payment-1", status: "failed" });
        throw new Error("Payment declined by user.");
      }
      this.onUpdate("reasoning", "Human supervisor approved the transaction.");
    } else {
      this.onUpdate("reasoning", "Cost is within autonomous limit. Executing Stacks JIT zero-latency borrow-and-pay sequence...");
      await new Promise(r => setTimeout(r, 2000)); // Simulate Stacks contract interaction
    }

    this.onUpdate("communication", { sender: "Payment Decision", receiver: "Verification", message: "Payment settled via Lend402. Initiating data retrieval." });
    
    this.onUpdate("timeline", { id: "payment", label: "Payment & API Retrieval complete", status: "completed" });
    this.onUpdate("graph_update", { id: "payment-1", status: "completed" });
    this.updateAgentState("completed");

    return { success: true, data: { source: apiDetails.provider, rawData: "Premium intelligence data block: AMD Edge compute growth at 18%." } };
  }

  private async requestApproval(amount: number): Promise<boolean> {
    return new Promise((resolve) => {
      this.onUpdate("approval", { amount });
      
      const handleApproval = (e: any) => {
        const payload = JSON.parse(e.data);
        if (payload.type === "approval_response") {
          resolve(payload.approved);
        }
      };

      // In a real setup, we'd hook this via WebSocket/SSE back-channel.
      // For this demo structure, the front-end will POST to /api/orchestration/approve
      // We simulate waiting via an interval polling the global node process or just resolving true after 5s if testing
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        // Check a global variable for approval (set by the /approve route)
        if (global.approvalResponse !== undefined) {
          clearInterval(interval);
          const res = global.approvalResponse;
          global.approvalResponse = undefined; // reset
          resolve(res);
        } else if (attempts > 300) { // 30 sec timeout
          clearInterval(interval);
          resolve(false);
        }
      }, 100);
    });
  }

  private updateAgentState(state: string) {
    this.onUpdate("agent_update", { id: "payment", state });
  }
}
