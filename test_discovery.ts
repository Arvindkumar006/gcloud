
import { GoogleGenAI } from "@google/genai";
import { ApiDiscoveryAgent } from "./src/lib/agents/ApiDiscoveryAgent.ts";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const dummyOnUpdate = (type: string, payload: any) => {
  if (type === "reasoning") {
    console.log(`[Reasoning] ${payload}`);
  }
};

const agent = new ApiDiscoveryAgent(ai, dummyOnUpdate);

async function run() {
  const prompts = [
    "Find SEC filing analysis for Tesla",
    "Analyze crypto market sentiment",
    "Generate semiconductor competitive analysis"
  ];

  for (const prompt of prompts) {
    console.log(`\n==================================================`);
    console.log(`Prompt: "${prompt}"`);
    console.log(`==================================================`);
    
    const providers = await agent.discoverApis(prompt, {}, { sufficient: false });
    
    console.log(`\nSelected Providers:`);
    providers.forEach((p, i) => {
      console.log(`${i + 1}. ${p.provider} (Cost: $${p.cost})`);
    });
  }
}

run().catch(console.error);
