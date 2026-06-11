import { GoogleGenAI } from "@google/genai";
import { parseJsonSafely } from "./utils";

export function isInvalidKey(key: string | undefined): boolean {
  if (!key) return true;
  const lower = key.toLowerCase();
  if (lower.includes("your_") || lower.includes("replace_") || lower === "") return true;
  return false;
}

const CIK_MAP: Record<string, string> = {
  "apple": "0000320193",
  "aapl": "0000320193",
  "nvidia": "0001045810",
  "nvda": "0001045810",
  "amd": "0000002488",
  "tesla": "0001318605",
  "tsla": "0001318605",
  "microsoft": "0000789019",
  "msft": "0000789019",
  "intel": "0000050863",
  "intc": "0000050863",
  "bitcoin": "crypto",
  "btc": "crypto"
};

const extractionCache: Record<string, any> = {};

async function getExtractedEntities(prompt: string, ai: GoogleGenAI, onUpdate: Function) {
  if (extractionCache[prompt]) {
    return extractionCache[prompt];
  }

  let extracted = {
    query: prompt,
    tickers: [] as string[],
    companies: [] as string[],
    cik: null as string | null
  };

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract the core search query, stock tickers, and company names from this prompt: "${prompt}".
      Return ONLY JSON: {"query": "string", "tickers": ["AAPL"], "companies": ["Apple"]}`
    });
    
    const parseRes = parseJsonSafely(res.text || "{}");
    if (!parseRes.success || !parseRes.data) {
      throw new Error(`Parsing failed: ${parseRes.error}`);
    }
    const parsed = parseRes.data;
    
    extracted.query = parsed.query || prompt;
    extracted.tickers = parsed.tickers || [];
    extracted.companies = parsed.companies || [];

    // Local CIK Resolution
    for (const company of extracted.companies) {
      const lower = company.toLowerCase();
      if (CIK_MAP[lower] && CIK_MAP[lower] !== "crypto") {
        extracted.cik = CIK_MAP[lower];
        break;
      }
    }
    if (!extracted.cik) {
      for (const ticker of extracted.tickers) {
        const lower = ticker.toLowerCase();
        if (CIK_MAP[lower] && CIK_MAP[lower] !== "crypto") {
          extracted.cik = CIK_MAP[lower];
          break;
        }
      }
    }
  } catch (e) {
    // Fallback logic
  }

  extractionCache[prompt] = extracted;
  
  onUpdate("reasoning", `Extracted entities:\nQuery: ${extracted.query}\nTickers: ${extracted.tickers.join(", ")}\nCompanies: ${extracted.companies.join(", ")}\nCIK: ${extracted.cik}`);
  
  return extracted;
}

export interface ProviderExecutor {
  execute(provider: any, prompt: string): Promise<any>;
}

export class AlphaVantageExecutor implements ProviderExecutor {
  constructor(private ai: GoogleGenAI, private onUpdate: Function) {}
  async execute(provider: any, prompt: string): Promise<any> {
    const apiKey = process.env.ALPHAVANTAGE_API_KEY;
    if (isInvalidKey(apiKey)) throw new Error("Configuration Error: ALPHAVANTAGE_API_KEY is missing.");
    const entities = await getExtractedEntities(prompt, this.ai, this.onUpdate);
    const topics = entities.tickers.length > 0 ? entities.tickers.join(",") : encodeURIComponent(entities.query);
    this.onUpdate("reasoning", `Constructed Alpha Vantage query: "topics=${topics}"\nExecuting provider request...`);
    const res = await fetch(`https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=${topics}&apikey=${apiKey}`);
    if (!res.ok) throw new Error(`Alpha Vantage API error: ${res.status}`);
    return await res.json();
  }
}

export class FinnhubExecutor implements ProviderExecutor {
  constructor(private ai: GoogleGenAI, private onUpdate: Function) {}
  async execute(provider: any, prompt: string): Promise<any> {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (isInvalidKey(apiKey)) throw new Error("Configuration Error: FINNHUB_API_KEY is missing.");
    const entities = await getExtractedEntities(prompt, this.ai, this.onUpdate);
    
    let url = "";
    if (entities.tickers.length > 0) {
      const ticker = entities.tickers[0];
      url = `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=2023-01-01&to=2023-12-31&token=${apiKey}`;
      this.onUpdate("reasoning", `Constructed Finnhub query for symbol: ${ticker}\nExecuting provider request...`);
    } else {
      url = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(entities.query)}&token=${apiKey}`;
      this.onUpdate("reasoning", `Constructed Finnhub search query: "${entities.query}"\nExecuting provider request...`);
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Finnhub API error: ${res.status}`);
    return await res.json();
  }
}

export class PolygonExecutor implements ProviderExecutor {
  constructor(private ai: GoogleGenAI, private onUpdate: Function) {}
  async execute(provider: any, prompt: string): Promise<any> {
    const apiKey = process.env.POLYGON_API_KEY;
    if (isInvalidKey(apiKey)) throw new Error("Configuration Error: POLYGON_API_KEY is missing.");
    const entities = await getExtractedEntities(prompt, this.ai, this.onUpdate);
    
    const searchParam = entities.tickers.length > 0 ? `ticker=${entities.tickers[0]}` : `search=${encodeURIComponent(entities.query)}`;
    this.onUpdate("reasoning", `Constructed Polygon query: "${searchParam}"\nExecuting provider request...`);
    const res = await fetch(`https://api.polygon.io/v3/reference/tickers?active=true&${searchParam}&limit=10&apiKey=${apiKey}`);
    if (!res.ok) throw new Error(`Polygon API error: ${res.status}`);
    return await res.json();
  }
}

export class NewsApiExecutor implements ProviderExecutor {
  constructor(private ai: GoogleGenAI, private onUpdate: Function) {}
  async execute(provider: any, prompt: string): Promise<any> {
    const apiKey = process.env.NEWSAPI_API_KEY;
    if (isInvalidKey(apiKey)) throw new Error("Configuration Error: NEWSAPI_API_KEY is missing.");
    const entities = await getExtractedEntities(prompt, this.ai, this.onUpdate);
    const q = encodeURIComponent(entities.query);
    this.onUpdate("reasoning", `Constructed NewsAPI query: "${entities.query}"\nExecuting provider request...`);
    const res = await fetch(`https://newsapi.org/v2/everything?q=${q}&apiKey=${apiKey}`);
    if (!res.ok) throw new Error(`NewsAPI error: ${res.status}`);
    return await res.json();
  }
}

export class TavilyExecutor implements ProviderExecutor {
  constructor(private ai: GoogleGenAI, private onUpdate: Function) {}
  async execute(provider: any, prompt: string): Promise<any> {
    const apiKey = process.env.TAVILY_API_KEY;
    if (isInvalidKey(apiKey)) throw new Error("Configuration Error: TAVILY_API_KEY is missing.");
    this.onUpdate("reasoning", `Constructed Tavily query: "${prompt}"\nExecuting provider request...`);
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, query: prompt, search_depth: "basic" })
    });
    if (!res.ok) throw new Error(`Tavily API error: ${res.status}`);
    return await res.json();
  }
}

export class FMPExecutor implements ProviderExecutor {
  constructor(private ai: GoogleGenAI, private onUpdate: Function) {}
  async execute(provider: any, prompt: string): Promise<any> {
    const apiKey = process.env.FMP_API_KEY;
    if (isInvalidKey(apiKey)) throw new Error("Configuration Error: FMP_API_KEY is missing.");
    const entities = await getExtractedEntities(prompt, this.ai, this.onUpdate);
    
    let url = "";
    if (entities.tickers.length > 0) {
      url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${entities.tickers.join(",")}&limit=10&apikey=${apiKey}`;
      this.onUpdate("reasoning", `Constructed FMP query for tickers: ${entities.tickers.join(",")}\nExecuting provider request...`);
    } else {
      url = `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(entities.query)}&limit=10&apikey=${apiKey}`;
      this.onUpdate("reasoning", `Constructed FMP search query: "${entities.query}"\nExecuting provider request...`);
    }
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`FMP API error: ${res.status}`);
    return await res.json();
  }
}

export class SecEdgarExecutor implements ProviderExecutor {
  constructor(private ai: GoogleGenAI, private onUpdate: Function) {}
  async execute(provider: any, prompt: string): Promise<any> {
    const entities = await getExtractedEntities(prompt, this.ai, this.onUpdate);
    
    if (!entities.cik) {
      this.onUpdate("reasoning", "No trusted CIK could be resolved from the prompt entities. Skipping SEC Edgar retrieval to prevent hallucinated data.");
      throw new Error("SEC Edgar failed: Could not resolve a valid CIK.");
    }
    
    this.onUpdate("reasoning", `Constructed SEC EDGAR query for CIK: ${entities.cik}\nExecuting provider request...`);
    const res = await fetch(`https://data.sec.gov/submissions/CIK${entities.cik}.json`, {
      headers: { "User-Agent": "Lend402/1.0 (contact@lend402.com)" }
    });
    if (!res.ok) throw new Error(`SEC EDGAR error: ${res.status}`);
    return await res.json();
  }
}

export class TwelveDataExecutor implements ProviderExecutor {
  constructor(private ai: GoogleGenAI, private onUpdate: Function) {}
  async execute(provider: any, prompt: string): Promise<any> {
    const apiKey = process.env.TWELVEDATA_API_KEY;
    if (isInvalidKey(apiKey)) throw new Error("Configuration Error: TWELVEDATA_API_KEY is missing.");
    const entities = await getExtractedEntities(prompt, this.ai, this.onUpdate);
    const searchParam = entities.tickers.length > 0 ? `symbol=${entities.tickers[0]}` : `symbol=${encodeURIComponent(entities.query)}`;
    
    this.onUpdate("reasoning", `Constructed Twelve Data query: "${searchParam}"\nExecuting provider request...`);
    const res = await fetch(`https://api.twelvedata.com/stocks?${searchParam}&apikey=${apiKey}`);
    if (!res.ok) throw new Error(`Twelve Data error: ${res.status}`);
    return await res.json();
  }
}

export function getExecutorForProvider(providerId: string, ai: GoogleGenAI, onUpdate: Function): ProviderExecutor {
  switch (providerId) {
    case "alpha-vantage": return new AlphaVantageExecutor(ai, onUpdate);
    case "finnhub": return new FinnhubExecutor(ai, onUpdate);
    case "polygon-io": return new PolygonExecutor(ai, onUpdate);
    case "newsapi": return new NewsApiExecutor(ai, onUpdate);
    case "tavily": return new TavilyExecutor(ai, onUpdate);
    case "fmp": return new FMPExecutor(ai, onUpdate);
    case "sec-edgar": return new SecEdgarExecutor(ai, onUpdate);
    case "twelve-data": return new TwelveDataExecutor(ai, onUpdate);
    default:
      throw new Error(`No executor mapped for provider ID: ${providerId}`);
  }
}
