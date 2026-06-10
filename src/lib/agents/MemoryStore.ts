// In-memory MCP simulation for hackathon
export interface MemoryRecord {
  prompt: string;
  report: string;
  dataset: any;
  savings: number;
}

class MemoryStoreClass {
  private cache = new Map<string, MemoryRecord>();

  get(prompt: string): MemoryRecord | undefined {
    const normalizedPrompt = prompt.toLowerCase().trim();
    // Also support keyword matching to easily demo memory hits
    for (const [key, record] of this.cache.entries()) {
      if (normalizedPrompt === key || (normalizedPrompt.includes("memory") && key.includes("memory"))) {
        return record;
      }
    }
    return undefined;
  }

  set(prompt: string, record: MemoryRecord) {
    this.cache.set(prompt.toLowerCase().trim(), record);
  }
  
  clear() {
    this.cache.clear();
  }
}

export const MemoryStore = new MemoryStoreClass();
