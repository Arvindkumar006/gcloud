"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, ShieldCheck } from "lucide-react";
import ExecutionTimeline, { TimelineEvent } from "./components/ExecutionTimeline";
import TaskGraph, { TaskNode } from "./components/TaskGraph";
import AgentStatusCards, { AgentInfo, AgentState } from "./components/AgentStatusCards";
import CostAnalysisWidget, { CostMetrics } from "./components/CostAnalysisWidget";
import CommunicationLog, { CommMessage } from "./components/CommunicationLog";
import ThinkingStream, { ReasoningLog } from "./components/ThinkingStream";
import ToolRegistry from "./components/ToolRegistry";
import MissionSummary, { MissionSummaryProps } from "./components/MissionSummary";

export default function AgentsDashboard() {
  const [prompt, setPrompt] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [graphNodes, setGraphNodes] = useState<TaskNode[]>([]);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [commLogs, setCommLogs] = useState<CommMessage[]>([]);
  const [reasoningLogs, setReasoningLogs] = useState<ReasoningLog[]>([]);
  const [missionSummary, setMissionSummary] = useState<MissionSummaryProps | null>(null);
  
  const [metrics, setMetrics] = useState<CostMetrics>({
    freeSearches: 0,
    premiumApis: 0,
    estimatedCost: 0,
    actualCost: 0,
    memoryMatch: 0,
    savedCost: 0,
    moneySaved: 0
  });

  const [approvalRequest, setApprovalRequest] = useState<{ amount: number } | null>(null);

  const startExecution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isExecuting) return;

    setIsExecuting(true);
    setTimeline([]);
    setGraphNodes([]);
    setCommLogs([]);
    setReasoningLogs([]);
    setMissionSummary(null);
    setApprovalRequest(null);
    setAgents([]); // Reset to default
    
    // reset metrics
    setMetrics({
      freeSearches: 0,
      premiumApis: 0,
      estimatedCost: 0,
      actualCost: 0,
      memoryMatch: 0,
      savedCost: 0,
      moneySaved: 0
    });

    try {
      const res = await fetch("/api/orchestration/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      
      if (!res.ok) throw new Error("Failed to start execution");
      
      const eventSource = new EventSource("/api/orchestration/status");
      
      eventSource.onmessage = (e) => {
        const data = JSON.parse(e.data);
        
        if (data.type === "timeline") {
          setTimeline(prev => [...prev, data.payload]);
        } else if (data.type === "graph") {
          setGraphNodes(data.payload);
        } else if (data.type === "graph_update") {
          setGraphNodes(prev => prev.map(n => n.id === data.payload.id ? { ...n, status: data.payload.status } : n));
        } else if (data.type === "agent_update") {
          setAgents(prev => prev.map(a => a.id === data.payload.id ? { ...a, state: data.payload.state as AgentState } : a));
        } else if (data.type === "agents") {
          setAgents(data.payload);
        } else if (data.type === "metrics") {
          setMetrics(prev => ({ ...prev, ...data.payload }));
        } else if (data.type === "communication") {
          setCommLogs(prev => [...prev, { id: Math.random().toString(), ...data.payload }]);
        } else if (data.type === "reasoning") {
          setReasoningLogs(prev => [...prev, { id: Math.random().toString(), text: data.payload }]);
        } else if (data.type === "approval") {
          setApprovalRequest({ amount: data.payload.amount });
        } else if (data.type === "mission_summary") {
          setMissionSummary(data.payload);
        } else if (data.type === "done") {
          setIsExecuting(false);
          eventSource.close();
        } else if (data.type === "error") {
          setIsExecuting(false);
          eventSource.close();
          console.error("Execution Error:", data.payload);
        }
      };

      eventSource.onerror = () => {
        setIsExecuting(false);
        eventSource.close();
      };
    } catch (err) {
      console.error(err);
      setIsExecuting(false);
    }
  };

  const handleApproval = async (approved: boolean) => {
    setApprovalRequest(null);
    await fetch("/api/orchestration/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold tracking-tight uppercase">Mission Control Center</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-[#1C1C1C] border border-[#2E2E2E] px-4 py-2 rounded-lg">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Mission Status</span>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isExecuting ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <span className="text-sm font-medium">{isExecuting ? 'ACTIVE' : 'STANDBY'}</span>
            </div>
          </div>
        </div>
      </div>

      <AgentStatusCards agents={agents.length > 0 ? agents : undefined} />

      <form onSubmit={startExecution} className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Bot className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isExecuting}
          placeholder="e.g. Generate a competitive analysis of NVIDIA and AMD using premium market intelligence"
          className="w-full bg-[#1C1C1C] border border-[#2E2E2E] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-4 pl-12 pr-12 text-gray-100 placeholder-gray-500 shadow-sm transition-all outline-none"
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isExecuting}
          className="absolute inset-y-0 right-2 my-auto h-10 w-10 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
        {/* Left Column: Logic & Flow */}
        <div className="lg:col-span-1 space-y-6">
          <ToolRegistry />
          <div className="h-[400px]">
            <TaskGraph nodes={graphNodes} />
          </div>
        </div>

        {/* Center Column: Live Data Streams */}
        <div className="lg:col-span-2 grid grid-rows-2 gap-6">
          <CommunicationLog logs={commLogs} />
          <ThinkingStream logs={reasoningLogs} />
        </div>

        {/* Right Column: Analytics & Timeline */}
        <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
          <CostAnalysisWidget metrics={metrics} />
          <div className="flex-1 min-h-[300px]">
            <ExecutionTimeline events={timeline} />
          </div>
        </div>
      </div>

      {approvalRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#1C1C1C] border border-[#2E2E2E] p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center space-y-6">
            <h2 className="text-xl font-semibold text-white">Approval Required</h2>
            <p className="text-gray-400">
              The Payment Decision Agent has determined that premium data is necessary to complete the goal.
            </p>
            <div className="bg-[#242424] p-4 rounded-lg border border-[#2E2E2E]">
              <div className="text-sm text-gray-500 uppercase mb-1">Premium API Cost</div>
              <div className="text-3xl font-mono text-emerald-400">${approvalRequest.amount.toFixed(2)}</div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleApproval(false)}
                className="flex-1 px-4 py-2 border border-[#3E3E3E] text-gray-300 rounded-lg hover:bg-[#2A2A2A] transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => handleApproval(true)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {missionSummary && (
        <MissionSummary summary={missionSummary} onClose={() => setMissionSummary(null)} />
      )}
    </div>
  );
}
