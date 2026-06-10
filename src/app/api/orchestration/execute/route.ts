import { NextResponse } from "next/server";
import { ExecutiveOrchestrator } from "@/lib/agents/ExecutiveOrchestrator";
import globalEmitter from "@/lib/agents/EventEmitter";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    // We run this asynchronously and return immediately so the client can connect to SSE.
    setTimeout(() => {
      const orchestrator = new ExecutiveOrchestrator();
      orchestrator.execute(prompt, (type, payload) => {
        globalEmitter.emit("orchestration_update", { type, payload });
      });
    }, 500);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
