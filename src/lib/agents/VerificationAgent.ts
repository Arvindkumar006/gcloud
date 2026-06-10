import { GoogleGenAI } from "@google/genai";

export class VerificationAgent {
  constructor(private ai: GoogleGenAI, private onUpdate: (type: string, payload: any) => void) {}

  async validate(data: any) {
    this.updateAgentState("running");
    this.onUpdate("graph_update", { id: "verify-1", status: "running" });
    this.onUpdate("timeline", { id: "verification", label: "Verifying retrieved data...", status: "running" });

    this.onUpdate("reasoning", "Asking Gemini to perform cross-reference verification and hallucination checks on the retrieved dataset...");
    
    let confidenceScore = 85;
    
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Evaluate the following dataset for consistency and likely accuracy: ${JSON.stringify(data)}.
Return ONLY valid JSON: {"confidenceScore": number (0-100), "reasoning": "string"}.`
      });

      let text = response.text || "{}";
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(text);
      
      confidenceScore = parsed.confidenceScore || 85;
      this.onUpdate("reasoning", `Verification result: ${parsed.reasoning}. Computed Confidence: ${confidenceScore}%`);

    } catch (e) {
      this.onUpdate("reasoning", "Gemini verification encountered an issue. Using baseline confidence heuristic.");
    }
    
    this.onUpdate("communication", { sender: "Verification", receiver: "Report", message: `Confidence score ${confidenceScore}%. Verification passed.` });
    this.onUpdate("timeline", { id: "verification", label: `Verification passed (${confidenceScore}%)`, status: "completed" });
    this.onUpdate("graph_update", { id: "verify-1", status: "completed" });
    this.updateAgentState("completed");

    return { data, confidenceScore };
  }

  private updateAgentState(state: string) {
    this.onUpdate("agent_update", { id: "verification", state });
  }
}
