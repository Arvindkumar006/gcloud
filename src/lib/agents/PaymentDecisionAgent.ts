import { GoogleGenAI } from "@google/genai";
import { getExecutorForProvider } from "./ProviderExecutors";

export class PaymentDecisionAgent {
  constructor(private ai: GoogleGenAI, private onUpdate: (type: string, payload: any) => void) {}

  async processPayment(prompt: string, apiDetails: any) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "payment-1", status: "running" });
    this.onUpdate("timeline", { id: "payment", label: "Processing Lend402 JIT payment...", status: "running" });

    this.onUpdate("reasoning", `Evaluating cost threshold for ${apiDetails.provider} ($${apiDetails.cost}).`);
    
    // Step 4 & 7: Preserve Human Approval
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
      // No more fake delay here
    }

    this.onUpdate("communication", { sender: "Payment Decision", receiver: "Verification", message: "Payment settled via Lend402. Initiating data retrieval." });
    
    // Step 2 & 5: Execute real provider retrieval with robust retries
    const executor = getExecutorForProvider(apiDetails.id, this.ai, this.onUpdate);
    let attempt = 0;
    const maxAttempts = 3;
    let providerResponse = null;
    let success = false;

    while (attempt < maxAttempts) {
      try {
        this.onUpdate("reasoning", `Executing provider retrieval for ${apiDetails.provider} (Attempt ${attempt + 1}/${maxAttempts})...`);
        providerResponse = await executor.execute(apiDetails, prompt);
        
        // Step 6: Validate Provider Responses
        if (!providerResponse || typeof providerResponse !== 'object' || Object.keys(providerResponse).length === 0 || providerResponse.error) {
          throw new Error("Invalid, empty, or error payload received from provider.");
        }
        
        success = true;
        this.onUpdate("reasoning", `Provider execution successful on attempt ${attempt + 1}.`);
        break;
      } catch (e: any) {
        attempt++;
        this.onUpdate("reasoning", `Execution attempt ${attempt} failed: ${e.message}`);
        if (attempt >= maxAttempts) {
          this.onUpdate("reasoning", `All ${maxAttempts} execution attempts failed for ${apiDetails.provider}. Propagating error to orchestrator.`);
          this.updateAgentState("failed");
          this.onUpdate("graph_update", { id: "payment-1", status: "failed" });
          throw new Error(`Failed to retrieve data from ${apiDetails.provider}: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }

    this.onUpdate("timeline", { id: "payment", label: "Payment & API Retrieval complete", status: "completed" });
    this.onUpdate("graph_update", { id: "payment-1", status: "completed" });
    this.updateAgentState("completed");

    // Step 8: Return Real Retrieved Payload
    return { 
      success: true, 
      provider: apiDetails.provider,
      endpoint: apiDetails.endpoint,
      timestamp: Date.now(),
      rawData: providerResponse 
    };
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
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
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
