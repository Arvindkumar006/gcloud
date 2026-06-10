import { NextResponse } from "next/server";
import globalEmitter from "@/lib/agents/EventEmitter";

export async function POST(req: Request) {
  try {
    const { approved } = await req.json();
    
    // Emit an internal event to resume the PaymentDecisionAgent
    globalEmitter.emit("human_approval_response", approved);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
