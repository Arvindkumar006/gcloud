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
