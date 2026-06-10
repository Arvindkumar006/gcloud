import { GoogleGenAI } from "@google/genai";

export class PaymentDecisionAgent {
  constructor(private ai: GoogleGenAI, private onUpdate: (type: string, payload: any) => void) {}

  async processPayment(api: any) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "payment-1", status: "running" });
    
    // Request human approval
    this.onUpdate("timeline", { id: "payment-approval", label: "Waiting for approval...", status: "running" });
    this.onUpdate("reasoning", `Premium data from ${api.provider} is required. Halting execution for human oversight. Recommended action: APPROVE.`);
    this.onUpdate("approval", { amount: api.cost });

    const approved = await new Promise((resolve) => {
      const handler = (res: boolean) => {
        resolve(res);
      };
      const globalEmitter = require("./EventEmitter").default;
      globalEmitter.once("human_approval_response", handler);
    });

    if (!approved) {
      this.onUpdate("reasoning", "Human oversight REJECTED the payment request. Execution halted.");
      this.onUpdate("timeline", { id: "payment-approval", label: "Payment declined by user", status: "failed" });
      this.onUpdate("graph_update", { id: "payment-1", status: "failed" });
      this.updateAgentState("failed");
      throw new Error("Execution halted: User declined payment.");
    }
    
    this.onUpdate("timeline", { id: "payment-approval", label: "Payment approved", status: "completed" });
    this.onUpdate("timeline", { id: "payment-lend402", label: "Executing payment...", status: "running" });
    this.onUpdate("reasoning", `Invoking internal Lend402 SDK to perform simulateBorrow and JIT payment via Stacks.`);
    
    // Simulate Lend402 SDK call
    await new Promise(r => setTimeout(r, 2000));

    this.onUpdate("reasoning", `Lend402 payment settled. TxHash: 0x8f3cae2354...`);
    this.onUpdate("communication", { sender: "Payment", receiver: "Verification", message: "Premium data retrieved successfully." });

    this.onUpdate("timeline", { id: "payment-lend402", label: "Payment executed (Tx: 0x8f3c...)", status: "completed" });
    this.onUpdate("graph_update", { id: "payment-1", status: "completed" });
    
    this.onUpdate("metrics", { 
      memoryMatch: 0, 
      savedCost: 0, 
      freeSearches: 5, 
      premiumApis: 1, 
      estimatedCost: api.cost, 
      actualCost: api.cost,
      moneySaved: 5.80,
      txHash: "0x8f3cae2354... (Stacks Mainnet)"
    });

    this.updateAgentState("completed");

    return { success: true, data: { raw: "Premium NVIDIA/AMD data from MarketIntel" } };
  }

  private updateAgentState(state: string) {
    this.onUpdate("agent_update", { id: "payment", state });
  }
}
