"use client";

import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";
import { useEffect, useRef } from "react";

export type ReasoningLog = {
  id: string;
  text: string;
};

export default function ThinkingStream({ logs }: { logs: ReasoningLog[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl p-4 flex flex-col h-full overflow-hidden">
      <div className="flex items-center space-x-2 mb-4">
        <BrainCircuit className="w-4 h-4 text-blue-400" />
        <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Internal Reasoning</h3>
      </div>
      
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-3 text-[12px] pr-2 text-gray-300 custom-scrollbar"
      >
        {logs.length === 0 ? (
          <div className="text-gray-600 italic">Awaiting reasoning stream...</div>
        ) : (
          logs.map((log, i) => (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              key={log.id}
              className="border-l-2 border-[#3E3E3E] pl-3 py-1"
            >
              <div className="whitespace-pre-wrap">{log.text}</div>
            </motion.div>
          ))
        )}
        
        {logs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-gray-600 italic pl-3"
          >
            Thinking...
          </motion.div>
        )}
      </div>
    </div>
  );
}
