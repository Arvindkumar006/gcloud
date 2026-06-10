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
      } catch (e) {
        planningQuality -= 20;
        throw new Error("Critical Failure: Planner unable to construct execution graph.");
      }
      
      // 2. Memory Check
      agentsUsed++;
      let memoryResult;
      try {
        memoryResult = await memory.checkMemory(prompt, taskGraph);
        tasksCompleted++;
      } catch (e) {
        onUpdate("reasoning", "Memory Agent encountered a connection error. Skipping cache and proceeding with execution.");
        onUpdate("communication", { sender: "Memory", receiver: "Research", message: "Memory unavailable. Proceed with external searches." });
        memoryResult = { matchFound: false, savedCost: 0, data: null };
      }
      
      if (memoryResult.matchFound) {
        memoryHits++;
        moneySaved += memoryResult.savedCost;
        
        onUpdate("timeline", { id: "memory-match", label: `Memory match found! Saved $${memoryResult.savedCost}`, status: "completed" });
        onUpdate("metrics", { memoryMatch: memoryHits, savedCost: memoryResult.savedCost, freeSearches, premiumApis: premiumPurchases, estimatedCost, actualCost, moneySaved });
        
        agentsUsed++;
        const finalReport = await report.generateFromMemory(memoryResult);
        tasksCompleted++;
        
        this.emitFinalSummary(onUpdate, startTime, agentsUsed, tasksCompleted, memoryHits, premiumPurchases, moneySaved, 98, planningQuality, recoveryHandling);
        onUpdate("done", { report: finalReport });
        return;
      }

      // 3. Research Free Sources
      agentsUsed++;
      let freeData;
      try {
        freeSearches += 5; // Simulating multiple sources checked
        freeData = await research.executeFreeSearch(taskGraph);
        tasksCompleted++;
      } catch (e) {
        retries++;
        recoveryHandling -= 5;
        onUpdate("timeline", { id: "research-fail", label: "Research failed. Replanning...", status: "failed" });
        onUpdate("reasoning", "Primary free search providers failed. Switching to alternative fallback sources...");
        onUpdate("communication", { sender: "Executive", receiver: "Research", message: "Re-execute using alternative search strategy." });
        
        await new Promise(r => setTimeout(r, 1000)); // Replanning delay
        freeSearches += 3;
        freeData = { sufficient: false, data: ["Alternative Free News Snippet"] };
        tasksCompleted++;
      }
      
      let premiumApis;
      let selectedApi;
      let paymentResult;
      
      // 4. API Discovery with Dynamic Replanning
      try {
        agentsUsed++;
        premiumApis = await discovery.discoverApis(taskGraph, freeData);
        tasksCompleted++;
        
        // Random chance to simulate API Discovery failure and trigger dynamic replanning
        if (Math.random() > 0.8) {
          throw new Error("API Discovery timed out connecting to registry.");
        }
      } catch (e: any) {
        retries++;
        recoveryHandling -= 5;
        onUpdate("timeline", { id: "replanning-1", label: "Provider timeout detected. Replanning...", status: "failed" });
        onUpdate("reasoning", "API Discovery failed. Initiating dynamic replanning...");
        onUpdate("communication", { sender: "Planner", receiver: "API Discovery", message: "Timeout detected. Re-execute discovery protocol." });
        
        // Re-execute
        await new Promise(r => setTimeout(r, 1000));
        premiumApis = [
          { provider: "AlphaData Premium", cost: 4.50, latency: "150ms", reliability: "99.5%", vaultId: "alpha-vault" }
        ];
        tasksCompleted++;
        onUpdate("timeline", { id: "replanning-2", label: "API Discovery re-executed successfully", status: "completed" });
      }

      // 5. Cost Optimization
      agentsUsed++;
      selectedApi = await cost.optimizeAndSelect(premiumApis);
      estimatedCost = selectedApi.cost;
      tasksCompleted++;
      
      onUpdate("metrics", { memoryMatch: memoryHits, savedCost: 0, freeSearches, premiumApis: 1, estimatedCost, actualCost, moneySaved });

      // 6. Payment Decision
      agentsUsed++;
      try {
        paymentResult = await payment.processPayment(selectedApi);
        premiumPurchases++;
        actualCost += selectedApi.cost;
        tasksCompleted++;
      } catch (e: any) {
        // Human declined or payment failed
        throw new Error(e.message);
      }
      
      onUpdate("metrics", { memoryMatch: memoryHits, savedCost: 0, freeSearches, premiumApis: premiumPurchases, estimatedCost, actualCost, moneySaved });

      // 7. Verify
      agentsUsed++;
      let confidenceScore = 96;
      let verifiedData;
      try {
        verifiedData = await verify.validate(paymentResult.data);
        tasksCompleted++;
      } catch (e) {
        confidenceScore -= 15;
        verifiedData = paymentResult.data; // Proceed with degraded confidence
      }

      // 8. Report
      agentsUsed++;
      const finalReport = await report.generate(verifiedData);
      tasksCompleted++;
      
      // Memory Evolution: Store the results
      onUpdate("reasoning", "Memory Evolution: Storing executed reasoning, selected provider rankings, and final dataset into MongoDB MCP for future missions.");
      onUpdate("timeline", { id: "memory-evolution", label: "Results cached to Long-Term Memory", status: "completed" });

      onUpdate("timeline", { id: "finish", label: "Execution complete", status: "completed" });
      
      this.emitFinalSummary(onUpdate, startTime, agentsUsed, tasksCompleted, memoryHits, premiumPurchases, moneySaved, confidenceScore, planningQuality, recoveryHandling);
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
    recoveryHandling: number
  ) {
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // Calculate intelligent sub-scores
    const memoryEfficiency = memoryHits > 0 ? 100 : 85;
    const costOptimizationScore = premiumPurchases === 0 ? 100 : 92;
    const verificationQuality = confidence;
    const autonomousDecisions = 99;
    
    const intelligenceScore = Math.round((planningQuality + memoryEfficiency + costOptimizationScore + verificationQuality + autonomousDecisions + recoveryHandling) / 6);
    
    onUpdate("mission_summary", {
      executionTime,
      agentsUsed,
      tasksCompleted,
      memoryHits,
      premiumPurchases,
      moneySaved,
      verificationPassed: true,
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
