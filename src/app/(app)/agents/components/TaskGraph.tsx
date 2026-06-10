"use client";

import { motion } from "framer-motion";
import { ArrowDown, Network, CheckCircle2, Loader2, Clock, AlertCircle } from "lucide-react";

export type TaskNode = {
  id: string;
  label: string;
  type: "goal" | "task" | "decision" | "api" | "payment" | "result";
  status?: "waiting" | "running" | "completed" | "failed";
};

export default function TaskGraph({ nodes }: { nodes: TaskNode[] }) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl p-4 h-full flex flex-col items-center justify-center text-gray-500">
        <Network className="w-8 h-8 mb-4 opacity-50" />
        <p className="text-sm">Task graph will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl p-4 h-full flex flex-col overflow-hidden">
      <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-4">Reasoning Graph</h3>
      <div className="flex-1 overflow-y-auto flex flex-col items-center space-y-1 pb-4 custom-scrollbar">
        {nodes.map((node, i) => {
          const isCompleted = node.status === "completed" || node.type === "goal";
          const isRunning = node.status === "running";
          const isFailed = node.status === "failed";
          
          return (
            <div key={node.id} className="flex flex-col items-center w-full">
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`relative w-full max-w-sm p-2 text-center rounded-lg border text-xs shadow-sm flex items-center justify-between transition-colors ${
                  isCompleted ? "bg-blue-900/20 border-blue-800 text-blue-200" :
                  isRunning ? "bg-purple-900/20 border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)]" :
                  isFailed ? "bg-red-900/20 border-red-800 text-red-200" :
                  "bg-[#242424] border-[#3E3E3E] text-gray-400 opacity-60"
                }`}
              >
                <div className="flex-1 text-left font-medium truncate pr-2">{node.label}</div>
                <div>
                  {isCompleted && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  {isRunning && <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />}
                  {isFailed && <AlertCircle className="w-4 h-4 text-red-500" />}
                  {!isCompleted && !isRunning && !isFailed && <Clock className="w-4 h-4 text-gray-600" />}
                </div>
              </motion.div>
              {i < nodes.length - 1 && (
                <div className="py-1">
                  <ArrowDown className={`w-3 h-3 ${isCompleted ? "text-blue-500" : "text-gray-700"}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
