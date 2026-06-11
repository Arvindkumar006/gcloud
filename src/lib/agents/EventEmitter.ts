import { EventEmitter } from "events";

class BufferedEmitter extends EventEmitter {
  private buffer: any[] = [];

  emit(eventName: string | symbol, ...args: any[]): boolean {
    if (eventName === "orchestration_update") {
      this.buffer.push(args[0]);
    }
    return super.emit(eventName, ...args);
  }

  // When a new execution starts, we clear the buffer
  clearBuffer() {
    this.buffer = [];
  }

  // When a new client connects, we replay the buffer
  replayBuffer(listener: (data: any) => void) {
    this.buffer.forEach(data => listener(data));
  }
}

const globalEmitter = new BufferedEmitter();

export default globalEmitter;
