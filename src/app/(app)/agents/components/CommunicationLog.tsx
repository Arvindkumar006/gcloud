"use client";

import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { useEffect, useRef } from "react";

export type CommMessage = {
  id: string;
  sender: string;
  receiver: string;
  message: string;
};

export default function CommunicationLog({ logs }: { logs: CommMessage[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl p-4 flex flex-col h-full overflow-hidden">
      <div className="flex items-center space-x-2 mb-4">
        <Terminal className="w-4 h-4 text-emerald-500" />
        <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Agent Comm Log</h3>
      </div>
      
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-3 font-mono text-[11px] pr-2 custom-scrollbar"
      >
        {logs.length === 0 ? (
          <div className="text-gray-600 italic">Waiting for agent activity...</div>
        ) : (
          logs.map((log) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={log.id}
              className="p-2 rounded bg-[#242424] border border-[#2E2E2E]"
            >
              <div className="text-gray-400 mb-1">
                <span className="text-blue-400">{log.sender}</span> → <span className="text-purple-400">{log.receiver}</span>
              </div>
              <div className="text-gray-200">"{log.message}"</div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
