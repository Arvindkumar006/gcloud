import { GoogleGenAI } from "@google/genai";

export interface SafeParseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export function parseJsonSafely<T = any>(text: string): SafeParseResult<T> {
  if (!text) return { success: false, error: "Empty response" };
  
  try {
    // Remove markdown code fences and trim whitespace
    let cleanText = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    
    // Find first { or [ to avoid leading conversational text
    const startObj = cleanText.indexOf('{');
    const startArr = cleanText.indexOf('[');
    let startIndex = -1;
    if (startObj !== -1 && startArr !== -1) {
      startIndex = Math.min(startObj, startArr);
    } else if (startObj !== -1) {
      startIndex = startObj;
    } else if (startArr !== -1) {
      startIndex = startArr;
    }
    
    if (startIndex !== -1) {
      cleanText = cleanText.substring(startIndex);
    }
    
    // Find last } or ]
    const endObj = cleanText.lastIndexOf('}');
    const endArr = cleanText.lastIndexOf(']');
    let endIndex = -1;
    if (endObj !== -1 && endArr !== -1) {
      endIndex = Math.max(endObj, endArr);
    } else if (endObj !== -1) {
      endIndex = endObj;
    } else if (endArr !== -1) {
      endIndex = endArr;
    }

    if (endIndex !== -1) {
      cleanText = cleanText.substring(0, endIndex + 1);
    }

    const data = JSON.parse(cleanText);
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: any,
  onUpdate?: (type: string, payload: any) => void,
  maxRetries = 3
): Promise<any> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    const currentAttempt = attempt + 1;
    const maxAttempts = maxRetries + 1;
    
    console.log(`[Gemini Retry] Attempt ${currentAttempt}/${maxAttempts}`);
    onUpdate?.("reasoning", `[Gemini Retry] Attempt ${currentAttempt}/${maxAttempts}`);

    try {
      return await ai.models.generateContent(params);
    } catch (e: any) {
      console.error("[Gemini Retry] Raw exception:", e);
      console.error(`[Gemini Retry] Attempt ${currentAttempt}/${maxAttempts} failed`);
      console.error(`status: ${e?.status || 'N/A'}`);
      console.error(`code: ${e?.code || e?.error?.code || 'N/A'}`);
      console.error(`message: ${e?.message || 'N/A'}`);
      
      const errorStr = String(e?.message ?? "");
      const isUnavailable = 
        e?.status === 503 ||
        e?.code === 503 ||
        e?.error?.code === 503 ||
        errorStr.includes("503") ||
        errorStr.includes("UNAVAILABLE") ||
        errorStr.includes("RESOURCE_EXHAUSTED") ||
        errorStr.includes("429");
      
      if (isUnavailable && attempt < maxRetries) {
        attempt++;
        const backoffMs = Math.pow(2, attempt - 1) * 1000;
        console.error(`waiting ${backoffMs} ms before retry`);
        
        console.log(`Waiting ${backoffMs}ms...`);
        onUpdate?.("reasoning", `Gemini unavailable. Waiting ${backoffMs}ms before retry...`);
        
        await new Promise(r => setTimeout(r, backoffMs));
        
        console.log("Retrying...");
        onUpdate?.("reasoning", "Retrying Gemini request...");
      } else {
        throw new Error("Gemini AI Service unavailable or experienced an error.");
      }
    }
  }
}
