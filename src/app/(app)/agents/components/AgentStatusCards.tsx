"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Clock, BrainCircuit, Search, Database, Globe, Calculator, CreditCard, ShieldCheck, FileText } from "lucide-react";

export type AgentState = "waiting" | "running" | "completed" | "failed";

export type AgentInfo = {
  id: string;
  name: string;
  state: AgentState;
  icon: any;
};

const defaultAgents: AgentInfo[] = [
  { id: "planner", name: "Planner", state: "waiting", icon: BrainCircuit },
  { id: "research", name: "Research", state: "waiting", icon: Search },
  { id: "memory", name: "Memory", state: "waiting", icon: Database },
  { id: "discovery", name: "API Discovery", state: "waiting", icon: Globe },
  { id: "cost", name: "Cost Optimization", state: "waiting", icon: Calculator },
  { id: "payment", name: "Payment", state: "waiting", icon: CreditCard },
  { id: "verification", name: "Verification", state: "waiting", icon: ShieldCheck },
  { id: "report", name: "Reporting", state: "waiting", icon: FileText },
];

export default function AgentStatusCards({ agents = defaultAgents }: { agents?: AgentInfo[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {agents.map((agent) => (
        <motion.div
          key={agent.id}
          className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-3 transition-colors ${
            agent.state === "running" ? "bg-[#1A2332] border-[#2D4566]" :
            agent.state === "completed" ? "bg-[#182620] border-[#294B3C]" :
            "bg-[#1C1C1C] border-[#2E2E2E]"
          }`}
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative">
            <agent.icon className={`w-8 h-8 ${
              agent.state === "running" ? "text-blue-400" :
              agent.state === "completed" ? "text-emerald-500" :
              "text-gray-500"
            }`} />
            {agent.state === "running" && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-200">{agent.name}</p>
            <div className="flex items-center justify-center mt-1 space-x-1">
              {agent.state === "completed" && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
              {agent.state === "running" && <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />}
              {agent.state === "waiting" && <Clock className="w-3 h-3 text-gray-500" />}
              <span className="text-xs uppercase tracking-wider text-gray-400">
                {agent.state}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
