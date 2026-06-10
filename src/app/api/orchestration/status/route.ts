import globalEmitter from "@/lib/agents/EventEmitter";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      const listener = (data: any) => {
        const msg = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(msg));
      };

      globalEmitter.on("orchestration_update", listener);

      // Clean up when the client disconnects
      req.signal.addEventListener("abort", () => {
        globalEmitter.off("orchestration_update", listener);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}
