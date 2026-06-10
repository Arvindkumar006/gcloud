"use client";

import { Tool, CheckSquare } from "lucide-react";

export default function ToolRegistry() {
  const tools = [
    { name: "Long-Term Memory Retrieval" },
    { name: "Free Web & Market Search" },
    { name: "Premium API Discovery" },
    { name: "Lend402 Payment Engine (Stacks JIT)" },
    { name: "Cost & Provider Optimization" },
    { name: "Verification & Fact-Checking" },
    { name: "Report Synthesis" }
  ];

  return (
    <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl p-4 flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-4">
        <Tool className="w-4 h-4 text-orange-400" />
        <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Available Tools</h3>
      </div>
      
      <div className="space-y-2 text-xs text-gray-300">
        {tools.map((tool, i) => (
          <div key={i} className="flex items-center space-x-2 bg-[#242424] px-3 py-2 rounded border border-[#2E2E2E]">
            <CheckSquare className="w-3 h-3 text-emerald-500" />
            <span>{tool.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
