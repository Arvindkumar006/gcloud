"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export type TimelineEvent = {
  id: string;
  label: string;
  status: "pending" | "running" | "completed" | "failed";
};

export default function ExecutionTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-white/80 mb-6 uppercase tracking-wider">Execution Timeline</h3>
      <div className="flex-1 overflow-y-auto pr-4">
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#3E3E3E] before:to-transparent">
          {events.map((event, index) => (
            <motion.div 
              key={`${event.id}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-transparent bg-[#1C1C1C] z-10">
                {event.status === "completed" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {event.status === "running" && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
                {event.status === "pending" && <Circle className="w-5 h-5 text-gray-600" />}
                {event.status === "failed" && <Circle className="w-5 h-5 text-red-500 fill-red-500/20" />}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-[#2E2E2E] bg-[#242424] shadow">
                <span className={`text-sm ${event.status === "pending" ? "text-gray-500" : "text-gray-200"}`}>
                  {event.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
