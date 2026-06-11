import { GoogleGenAI } from "@google/genai";
import { getExecutorForProvider } from "./ProviderExecutors";

export class PaymentDecisionAgent {
  constructor(private ai: GoogleGenAI, private onUpdate: (type: string, payload: any) => void) {}

  async processPayment(prompt: string, apiDetailsList: any[]) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "payment-1", status: "running" });
    this.onUpdate("timeline", { id: "payment", label: "Processing Lend402 JIT payment...", status: "running" });

    for (let i = 0; i < apiDetailsList.length; i++) {
      const apiDetails = apiDetailsList[i];
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
      }

      this.onUpdate("communication", { sender: "Payment Decision", receiver: "Verification", message: `Payment settled via Lend402. Initiating data retrieval from ${apiDetails.provider}.` });
      
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
          if (e.message && e.message.startsWith("Configuration Error:")) {
            this.onUpdate("reasoning", `${e.message} Falling back to alternative execution strategy.`);
            break; // Stop retrying this provider
          }
          attempt++;
          this.onUpdate("reasoning", `Execution attempt ${attempt} failed: ${e.message}`);
          if (attempt >= maxAttempts) {
            this.onUpdate("reasoning", `All ${maxAttempts} execution attempts failed for ${apiDetails.provider}.`);
          } else {
            await new Promise(r => setTimeout(r, 1000 * attempt));
          }
        }
      }

      if (success && providerResponse) {
        this.onUpdate("timeline", { id: "payment", label: "Payment & API Retrieval complete", status: "completed" });
        this.onUpdate("graph_update", { id: "payment-1", status: "completed" });
        this.updateAgentState("completed");

        return { 
          success: true, 
          provider: apiDetails.provider,
          endpoint: apiDetails.endpoint,
          timestamp: Date.now(),
          cost: apiDetails.cost,
          rawData: providerResponse 
        };
      } else {
        if (i < apiDetailsList.length - 1) {
           this.onUpdate("reasoning", `${apiDetails.provider} failed or unavailable. Moving to next best provider...`);
        }
      }
    }

    this.updateAgentState("failed");
    this.onUpdate("graph_update", { id: "payment-1", status: "failed" });
    throw new Error("All alternative API providers failed or were unavailable due to missing configurations.");
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
        if ((global as any).approvalResponse !== undefined) {
          clearInterval(interval);
          const res = (global as any).approvalResponse;
          (global as any).approvalResponse = undefined; // reset
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
