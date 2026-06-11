"use client";

import { motion } from "framer-motion";
import { DollarSign, Database, ArrowRightLeft, ShieldAlert } from "lucide-react";

export type CostMetrics = {
  freeSearches: number;
  premiumApis: number;
  estimatedCost: number;
  actualCost: number;
  memoryMatch: number;
  savedCost: number;
  moneySaved: number;
  txHash?: string;
};

export default function CostAnalysisWidget({ metrics }: { metrics: CostMetrics }) {
  return (
    <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl p-4 flex flex-col space-y-4">
      <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Analytics & Savings</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-[#242424] border border-[#2E2E2E]">
          <div className="text-gray-500 text-[10px] uppercase mb-1">Free APIs Used</div>
          <div className="text-xl font-bold text-white">{metrics.freeSearches}</div>
        </div>
        <div className="p-3 rounded-lg bg-[#242424] border border-[#2E2E2E]">
          <div className="text-gray-500 text-[10px] uppercase mb-1">Premium APIs</div>
          <div className="text-xl font-bold text-emerald-400">{metrics.premiumApis}</div>
        </div>
      </div>

      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between p-2 rounded bg-[#182620] border border-[#294B3C]">
          <div className="flex items-center space-x-2">
            <Database className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-emerald-100">Memory Hits</span>
          </div>
          <span className="font-mono text-sm text-emerald-400">{metrics.memoryMatch > 0 ? 1 : 0}</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded bg-[#2D2A1C] border border-[#4A4526]">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-yellow-100">Duplicate Payments Prevented</span>
          </div>
          <span className="font-mono text-sm text-yellow-400">{metrics.memoryMatch > 0 ? 1 : 0}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded bg-yellow-900/20 border border-yellow-700/50 mt-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-100">Estimated Money Saved</span>
          </div>
          <span className="font-mono font-bold text-yellow-400">${(metrics.moneySaved || metrics.savedCost || 0).toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between p-2 mt-2 border-t border-[#2E2E2E]">
          <span className="text-xs text-gray-400">Actual Spend (Lend402)</span>
          <span className="font-mono text-sm text-white">${metrics.actualCost.toFixed(2)}</span>
        </div>
      </div>

      {metrics.txHash && (
        <div className="pt-2 border-t border-[#2E2E2E]">
          <div className="text-[10px] text-gray-500 uppercase mb-1">Settlement Tx</div>
          <a 
            href={`https://explorer.hiro.so/txid/${metrics.txHash}?chain=mainnet`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 text-[11px] font-mono text-blue-400 hover:text-blue-300 truncate"
          >
            <ArrowRightLeft className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{metrics.txHash}</span>
          </a>
        </div>
      )}
    </div>
  );
}
