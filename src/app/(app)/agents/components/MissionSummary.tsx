"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Zap, DollarSign, Database, Download, Brain } from "lucide-react";

export type MissionSummaryProps = {
  executionTime: string;
  agentsUsed: number;
  tasksCompleted: number;
  memoryHits: number;
  premiumPurchases: number;
  moneySaved: number;
  verificationPassed: boolean;
  confidence: number;
  intelligenceScore: number;
  subScores: {
    planningQuality: number;
    memoryEfficiency: number;
    costOptimizationScore: number;
    verificationQuality: number;
    autonomousDecisions: number;
    recoveryHandling: number;
  };
};

export default function MissionSummary({ summary, onClose }: { summary: MissionSummaryProps; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="bg-[#242424] px-6 py-4 border-b border-[#2E2E2E] flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h2 className="font-bold tracking-widest uppercase">Mission Complete</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          {/* Main Stats */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase">Execution Time</div>
                <div className="text-xl font-mono text-white flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>{summary.executionTime} sec</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase">Confidence</div>
                <div className="text-xl font-mono text-emerald-400">{summary.confidence}%</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase">Agents Used</div>
                <div className="text-lg font-medium text-gray-200">{summary.agentsUsed}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase">Tasks Completed</div>
                <div className="text-lg font-medium text-gray-200">{summary.tasksCompleted}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase">Memory Hits</div>
                <div className="text-lg font-medium text-gray-200 flex items-center space-x-2">
                  <Database className="w-4 h-4 text-yellow-500" />
                  <span>{summary.memoryHits}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase">Premium APIs</div>
                <div className="text-lg font-medium text-gray-200">{summary.premiumPurchases}</div>
              </div>
            </div>

            <div className="bg-[#2D2A1C] border border-[#4A4526] p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-100 font-medium">Money Saved</span>
              </div>
              <span className="text-xl font-mono text-yellow-400">${summary.moneySaved.toFixed(2)}</span>
            </div>
          </div>

          {/* Intelligence Score */}
          <div className="bg-[#242424] border border-[#2E2E2E] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#3E3E3E]">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span className="font-semibold text-gray-200 uppercase tracking-wider text-sm">Intelligence Score</span>
              </div>
              <span className="text-2xl font-bold text-purple-400">{summary.intelligenceScore}<span className="text-sm text-gray-500 font-normal">/100</span></span>
            </div>

            <div className="space-y-3 text-sm">
              <ScoreRow label="Planning Quality" score={summary.subScores.planningQuality} />
              <ScoreRow label="Memory Efficiency" score={summary.subScores.memoryEfficiency} />
              <ScoreRow label="Cost Optimization" score={summary.subScores.costOptimizationScore} />
              <ScoreRow label="Verification Quality" score={summary.subScores.verificationQuality} />
              <ScoreRow label="Autonomous Decisions" score={summary.subScores.autonomousDecisions} />
              <ScoreRow label="Recovery Handling" score={summary.subScores.recoveryHandling} />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-[#181818] border-t border-[#2E2E2E] flex justify-end space-x-3 shrink-0">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors text-sm font-medium"
          >
            Acknowledge
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ScoreRow({ label, score }: { label: string, score: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{label}</span>
      <div className="flex items-center space-x-3">
        <div className="w-24 h-1.5 bg-[#1C1C1C] rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${score >= 95 ? "bg-emerald-500" : score >= 80 ? "bg-yellow-500" : "bg-red-500"}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-gray-200 font-mono w-6 text-right">{score}</span>
      </div>
    </div>
  );
}
