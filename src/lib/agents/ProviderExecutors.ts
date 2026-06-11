export interface ProviderExecutor {
  execute(provider: any, prompt: string): Promise<any>;
}

export class AlphaVantageExecutor implements ProviderExecutor {
  async execute(provider: any, prompt: string): Promise<any> {
    const apiKey = process.env.ALPHAVANTAGE_API_KEY;
    if (!apiKey) throw new Error("Missing ALPHAVANTAGE_API_KEY.");
    const res = await fetch(`https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=finance&apikey=${apiKey}`);
    if (!res.ok) throw new Error(`Alpha Vantage API error: ${res.status}`);
    return await res.json();
  }
}

export class FinnhubExecutor implements ProviderExecutor {
  async execute(provider: any, prompt: string): Promise<any> {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) throw new Error("Missing FINNHUB_API_KEY.");
    const res = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${apiKey}`);
    if (!res.ok) throw new Error(`Finnhub API error: ${res.status}`);
    return await res.json();
  }
}

export class PolygonExecutor implements ProviderExecutor {
  async execute(provider: any, prompt: string): Promise<any> {
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) throw new Error("Missing POLYGON_API_KEY.");
    const res = await fetch(`https://api.polygon.io/v3/reference/tickers?active=true&limit=10&apiKey=${apiKey}`);
    if (!res.ok) throw new Error(`Polygon API error: ${res.status}`);
    return await res.json();
  }
}

export class NewsApiExecutor implements ProviderExecutor {
  async execute(provider: any, prompt: string): Promise<any> {
    const apiKey = process.env.NEWSAPI_API_KEY;
    if (!apiKey) throw new Error("Missing NEWSAPI_API_KEY.");
    const res = await fetch(`https://newsapi.org/v2/everything?q=finance&apiKey=${apiKey}`);
    if (!res.ok) throw new Error(`NewsAPI error: ${res.status}`);
    return await res.json();
  }
}

export class TavilyExecutor implements ProviderExecutor {
  async execute(provider: any, prompt: string): Promise<any> {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) throw new Error("Missing TAVILY_API_KEY.");
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
  async execute(provider: any, prompt: string): Promise<any> {
    const apiKey = process.env.FMP_API_KEY;
    if (!apiKey) throw new Error("Missing FMP_API_KEY.");
    const res = await fetch(`https://financialmodelingprep.com/api/v3/stock_news?limit=10&apikey=${apiKey}`);
    if (!res.ok) throw new Error(`FMP API error: ${res.status}`);
    return await res.json();
  }
}

export class SecEdgarExecutor implements ProviderExecutor {
  async execute(provider: any, prompt: string): Promise<any> {
    // SEC Edgar doesn't strictly need an API key, but requires a User-Agent.
    const res = await fetch(`https://data.sec.gov/submissions/CIK0000320193.json`, {
      headers: { "User-Agent": "Lend402/1.0 (contact@lend402.com)" }
    });
    if (!res.ok) throw new Error(`SEC EDGAR error: ${res.status}`);
    return await res.json();
  }
}

export class TwelveDataExecutor implements ProviderExecutor {
  async execute(provider: any, prompt: string): Promise<any> {
    const apiKey = process.env.TWELVEDATA_API_KEY;
    if (!apiKey) throw new Error("Missing TWELVEDATA_API_KEY.");
    const res = await fetch(`https://api.twelvedata.com/stocks?source=docs&apikey=${apiKey}`);
    if (!res.ok) throw new Error(`Twelve Data error: ${res.status}`);
    return await res.json();
  }
}

export function getExecutorForProvider(providerId: string): ProviderExecutor {
  switch (providerId) {
    case "alpha-vantage": return new AlphaVantageExecutor();
    case "finnhub": return new FinnhubExecutor();
    case "polygon-io": return new PolygonExecutor();
    case "newsapi": return new NewsApiExecutor();
    case "tavily": return new TavilyExecutor();
    case "fmp": return new FMPExecutor();
    case "sec-edgar": return new SecEdgarExecutor();
    case "twelve-data": return new TwelveDataExecutor();
    default:
      throw new Error(`No executor mapped for provider ID: ${providerId}`);
  }
}
