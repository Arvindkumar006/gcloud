import { NextResponse } from "next/server";
import { ExecutiveOrchestrator } from "@/lib/agents/ExecutiveOrchestrator";
import globalEmitter from "@/lib/agents/EventEmitter";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    // We run this asynchronously and return immediately so the client can connect to SSE.
    setTimeout(async () => {
      try {
        globalEmitter.clearBuffer();
        console.log("[Orchestrator API] Instantiating ExecutiveOrchestrator...");
        const geminiKey = process.env.GEMINI_API_KEY || "";
        if (!geminiKey || geminiKey.includes("your_")) {
          throw new Error("Configuration Error: GEMINI_API_KEY is not configured.");
        }
        const orchestrator = new ExecutiveOrchestrator();
        console.log("[Orchestrator API] Executing prompt...");
        await orchestrator.execute(prompt, (type, payload) => {
          globalEmitter.emit("orchestration_update", { type, payload });
        });
        console.log("[Orchestrator API] Execution finished.");
      } catch (err: any) {
        console.error("[Orchestrator API] Caught unhandled exception:", err.message);
        globalEmitter.emit("orchestration_update", { type: "error", payload: err.message });
      }
    }, 500);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
