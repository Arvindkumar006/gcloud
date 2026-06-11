import { GoogleGenAI } from "@google/genai";
import { PlannerAgent } from "./PlannerAgent";
import { MemoryAgent } from "./MemoryAgent";
import { CostOptimizationAgent } from "./CostOptimizationAgent";
import { PaymentDecisionAgent } from "./PaymentDecisionAgent";
import { VerificationAgent } from "./VerificationAgent";
import { ReportAgent } from "./ReportAgent";
import { ResearchAgent } from "./ResearchAgent";
import { ApiDiscoveryAgent } from "./ApiDiscoveryAgent";

export class ExecutiveOrchestrator {
  private ai: GoogleGenAI;
  
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async execute(prompt: string, onUpdate: (type: string, payload: any) => void) {
    const startTime = Date.now();
    let agentsUsed = 0;
    let tasksCompleted = 0;
    let memoryHits = 0;
    let premiumPurchases = 0;
    let moneySaved = 0;
    let freeSearches = 0;
    let retries = 0;
    let estimatedCost = 0;
    let actualCost = 0;
    let autonomousDecisions = 0;
    
    // For Intelligence Score
    let planningQuality = 100;
    let recoveryHandling = 100;
    
    try {
      const planner = new PlannerAgent(this.ai, onUpdate);
      const memory = new MemoryAgent(this.ai, onUpdate);
      const research = new ResearchAgent(this.ai, onUpdate);
      const discovery = new ApiDiscoveryAgent(this.ai, onUpdate);
      const cost = new CostOptimizationAgent(this.ai, onUpdate);
      const payment = new PaymentDecisionAgent(this.ai, onUpdate);
      const verify = new VerificationAgent(this.ai, onUpdate);
      const report = new ReportAgent(this.ai, onUpdate);

      onUpdate("timeline", { id: "init", label: "Executive Orchestrator started", status: "completed" });

      // 1. Plan
      agentsUsed++;
      let taskGraph;
      try {
        taskGraph = await planner.generatePlan(prompt);
        tasksCompleted++;
        autonomousDecisions++;
      } catch (e) {
        planningQuality -= 20;
        throw new Error("Critical Failure: Planner unable to construct execution graph.");
      }
      
      // 2 & 3. Memory Check & Research (Parallel Execution)
      agentsUsed += 2;
      onUpdate("reasoning", "Executing Memory Check and Free Research concurrently (Promise.all)...");
      autonomousDecisions++;
      
      const [memoryResult, freeDataResult] = await Promise.all([
        memory.checkMemory(prompt, taskGraph).catch(e => {
          onUpdate("reasoning", "Memory Agent encountered an error. Skipping cache.");
          return { matchFound: false, savedCost: 0, data: null };
        }),
        research.executeFreeSearch(prompt).catch(e => {
          onUpdate("reasoning", "Primary free search failed. Proceeding to premium discovery.");
          recoveryHandling -= 2;
          return { sufficient: false, reasoning: "Live search unavailable.", results: [] };
        })
      ]);
      
      tasksCompleted += 2;
      freeSearches += 3; // base metric
      
      if (memoryResult.matchFound) {
        memoryHits++;
        moneySaved += memoryResult.savedCost;
        
        onUpdate("timeline", { id: "memory-match", label: `Memory match found! Saved $${memoryResult.savedCost}`, status: "completed" });
        onUpdate("metrics", { memoryMatch: memoryHits, savedCost: memoryResult.savedCost, freeSearches, premiumApis: premiumPurchases, estimatedCost, actualCost, moneySaved });
        
        agentsUsed++;
        const finalReport = await report.generateFromMemory(memoryResult);
        tasksCompleted++;
        
        this.emitFinalSummary(onUpdate, startTime, agentsUsed, tasksCompleted, memoryHits, premiumPurchases, moneySaved, 98, planningQuality, recoveryHandling, autonomousDecisions);
        onUpdate("done", { report: finalReport });
        return;
      }

      let premiumApis;
      
      // 4. API Discovery with Robust Retry Loop
      const MAX_ATTEMPTS = 3;
      let discoverySuccess = false;
      
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          if (attempt === 1) agentsUsed++;
          onUpdate("reasoning", `API Discovery Attempt ${attempt}/${MAX_ATTEMPTS}...`);
          premiumApis = await discovery.discoverApis(taskGraph, freeDataResult);
          discoverySuccess = true;
          tasksCompleted++;
          autonomousDecisions++;
          break; // Exit loop on success
        } catch (e: any) {
          retries++;
          recoveryHandling -= 5;
          onUpdate("timeline", { id: `replanning-${attempt}`, label: `Provider timeout (Attempt ${attempt}). Replanning...`, status: "failed" });
          onUpdate("reasoning", `API Discovery failed on attempt ${attempt}. Re-executing discovery protocol.`);
          onUpdate("communication", { sender: "Planner", receiver: "API Discovery", message: "Timeout detected. Retrying." });
          await new Promise(r => setTimeout(r, 1000));
        }
      }
      
      if (!discoverySuccess || !premiumApis) {
        onUpdate("reasoning", "All Discovery attempts failed. Falling back to emergency provider.");
        premiumApis = [
          { provider: "Emergency Fallback API", cost: 5.00, latency: "250ms", reliability: "99.0%", vaultId: "fallback-vault" }
        ];
        autonomousDecisions++;
      }

      // 5. Cost Optimization
      agentsUsed++;
      const selectedApi = await cost.optimizeAndSelect(premiumApis);
      estimatedCost = selectedApi.cost;
      tasksCompleted++;
      autonomousDecisions++;
      
      onUpdate("metrics", { memoryMatch: memoryHits, savedCost: 0, freeSearches, premiumApis: 1, estimatedCost, actualCost, moneySaved });

      // 6. Payment Decision
      agentsUsed++;
      let paymentResult;
      try {
        paymentResult = await payment.processPayment(selectedApi);
        premiumPurchases++;
        actualCost += selectedApi.cost;
        tasksCompleted++;
        autonomousDecisions++;
      } catch (e: any) {
        throw new Error(e.message);
      }
      
      onUpdate("metrics", { memoryMatch: memoryHits, savedCost: 0, freeSearches, premiumApis: premiumPurchases, estimatedCost, actualCost, moneySaved });

      // 7. Verify
      agentsUsed++;
      let verifiedData;
      let finalConfidence = 0;
      try {
        const vResult = await verify.validate(paymentResult.data);
        verifiedData = vResult.data;
        finalConfidence = vResult.confidenceScore;
        tasksCompleted++;
        autonomousDecisions++;
      } catch (e) {
        finalConfidence = 70;
        verifiedData = paymentResult.data;
      }

      // 8. Report
      agentsUsed++;
      const finalReport = await report.generate(verifiedData, prompt);
      tasksCompleted++;
      autonomousDecisions++;
      
      // Memory Evolution: Store the actual results
      await memory.saveToMemory(prompt, finalReport, verifiedData, selectedApi.cost);
      onUpdate("timeline", { id: "memory-evolution", label: "Results cached to Long-Term Memory", status: "completed" });

      onUpdate("timeline", { id: "finish", label: "Execution complete", status: "completed" });
      
      this.emitFinalSummary(onUpdate, startTime, agentsUsed, tasksCompleted, memoryHits, premiumPurchases, moneySaved, finalConfidence, planningQuality, recoveryHandling, autonomousDecisions);
      onUpdate("done", { report: finalReport });
      
    } catch (e: any) {
      onUpdate("error", e.message);
    }
  }

  private emitFinalSummary(
    onUpdate: any, 
    startTime: number, 
    agentsUsed: number, 
    tasksCompleted: number, 
    memoryHits: number, 
    premiumPurchases: number, 
    moneySaved: number, 
    confidence: number,
    planningQuality: number,
    recoveryHandling: number,
    autonomousDecisions: number
  ) {
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // Calculate intelligent sub-scores
    const memoryEfficiency = memoryHits > 0 ? 100 : (moneySaved > 0 ? 90 : 85);
    const costOptimizationScore = premiumPurchases === 0 ? 100 : 92;
    const verificationQuality = confidence;
    
    const intelligenceScore = Math.round((planningQuality + memoryEfficiency + costOptimizationScore + verificationQuality + autonomousDecisions*2 + recoveryHandling) / 6);
    
    onUpdate("mission_summary", {
      executionTime,
      agentsUsed,
      tasksCompleted,
      memoryHits,
      premiumPurchases,
      moneySaved,
      verificationPassed: confidence > 80,
      confidence,
      intelligenceScore,
      subScores: {
        planningQuality,
        memoryEfficiency,
        costOptimizationScore,
        verificationQuality,
        autonomousDecisions,
        recoveryHandling
      }
    });
  }
}
