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
  maxRetries = 3
): Promise<any> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await ai.models.generateContent(params);
    } catch (e: any) {
      // Log complete backend exception using console.error
      console.error(`[Gemini SDK Error] Attempt ${attempt + 1}/${maxRetries + 1}`);
      console.error(`Status: ${e.status || 'N/A'}`);
      console.error(`Message: ${e.message || 'N/A'}`);
      console.error(e);

      const isUnavailable = e.status === 503 || (e.message && e.message.includes('503'));
      
      if (isUnavailable && attempt < maxRetries) {
        attempt++;
        // Exponential backoff: 1s, 2s, 4s
        const backoffMs = Math.pow(2, attempt - 1) * 1000;
        console.error(`[Gemini SDK] 503 UNAVAILABLE. Retrying in ${backoffMs}ms...`);
        await new Promise(r => setTimeout(r, backoffMs));
      } else {
        // Mask raw errors for UI and SSE
        throw new Error("Gemini AI Service unavailable or experienced an error.");
      }
    }
  }
}
