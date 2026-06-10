import { EventEmitter } from "events";

// Global singleton for the hackathon demo to bridge the /execute POST and /status GET SSE stream.
// In a real serverless app, we'd use Redis Pub/Sub or a proper queue.
const globalEmitter = new EventEmitter();

export default globalEmitter;
