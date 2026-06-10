"use client";

import { useState } from "react";
import { History, FileText, ArrowRightLeft, Database } from "lucide-react";

export default function SessionHistory() {
  const [history] = useState([
    {
      id: "run-1",
      prompt: "Generate a competitive analysis of NVIDIA and AMD using premium market intelligence.",
      date: "2026-06-10 10:45 AM",
      status: "completed",
      savedCost: 0,
      actualCost: 3.40,
      txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      report: "Executive Summary: NVIDIA maintains dominant market share in data center AI chips, while AMD is aggressively capturing edge compute..."
    },
    {
      id: "run-2",
      prompt: "Generate a competitive analysis of NVIDIA and AMD using premium market intelligence.",
      date: "2026-06-10 11:30 AM",
      status: "completed (memory reused)",
      savedCost: 3.40,
      actualCost: 0,
      txHash: null,
      report: "Executive Summary: NVIDIA maintains dominant market share in data center AI chips, while AMD is aggressively capturing edge compute..."
    }
  ]);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <History className="w-8 h-8 text-blue-400" />
        <h1 className="text-2xl font-semibold tracking-tight">Session History</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {history.map((run) => (
          <div key={run.id} className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl p-6 flex flex-col space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-200">"{run.prompt}"</h3>
                <p className="text-sm text-gray-500 mt-1">{run.date} — <span className="uppercase tracking-wider">{run.status}</span></p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Actual Cost</div>
                <div className="text-xl font-mono text-white">${run.actualCost.toFixed(2)}</div>
              </div>
            </div>

            {run.savedCost > 0 && (
              <div className="flex items-center space-x-2 text-sm text-yellow-400 bg-[#2D2A1C] border border-[#4A4526] p-2 rounded-lg w-fit">
                <Database className="w-4 h-4" />
                <span>Memory reused. Saved ${run.savedCost.toFixed(2)}</span>
              </div>
            )}

            {run.txHash && (
              <div className="flex items-center space-x-2 text-sm text-blue-400">
                <ArrowRightLeft className="w-4 h-4" />
                <a href={`https://explorer.hiro.so/txid/${run.txHash}?chain=mainnet`} target="_blank" rel="noreferrer" className="hover:underline font-mono">
                  {run.txHash}
                </a>
              </div>
            )}

            <div className="bg-[#242424] p-4 rounded-lg border border-[#2E2E2E] text-sm text-gray-300">
              <div className="flex items-center space-x-2 mb-2 text-white">
                <FileText className="w-4 h-4" />
                <span className="font-medium">Generated Report Snippet</span>
              </div>
              <p className="line-clamp-3">{run.report}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
