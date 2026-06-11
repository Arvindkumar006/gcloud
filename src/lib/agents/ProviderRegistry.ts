export type PremiumProvider = {
  id: string;
  provider: string;
  description: string;
  capabilities: string[];
  cost: number;
  latency: string;
  reliability: string;
  endpoint: string;
  vaultId: string;
};

export const PROVIDER_REGISTRY: PremiumProvider[] = [
  {
    id: "alpha-vantage",
    provider: "Alpha Vantage",
    description: "Real-time and historical stock APIs, forex, and crypto data.",
    capabilities: ["market-data", "forex", "crypto"],
    cost: 1.50,
    latency: "150ms",
    reliability: "99.9%",
    endpoint: "https://www.alphavantage.co/query",
    vaultId: "vault-alpha-vantage"
  },
  {
    id: "finnhub",
    provider: "Finnhub",
    description: "Real-time stock, forex, and crypto data. Includes analyst ratings and earnings.",
    capabilities: ["market-data", "analyst-ratings", "earnings", "forex", "crypto"],
    cost: 2.10,
    latency: "120ms",
    reliability: "99.95%",
    endpoint: "https://finnhub.io/api/v1",
    vaultId: "vault-finnhub"
  },
  {
    id: "polygon-io",
    provider: "Polygon.io",
    description: "Real-time and historical market data for stocks, options, forex, and crypto.",
    capabilities: ["market-data", "forex", "crypto", "macroeconomics"],
    cost: 3.00,
    latency: "80ms",
    reliability: "99.99%",
    endpoint: "https://api.polygon.io/v2",
    vaultId: "vault-polygon"
  },
  {
    id: "newsapi",
    provider: "NewsAPI",
    description: "Search worldwide news with code. Locates articles and breaking news.",
    capabilities: ["financial-news", "institutional-sentiment"],
    cost: 0.50,
    latency: "200ms",
    reliability: "99.5%",
    endpoint: "https://newsapi.org/v2/everything",
    vaultId: "vault-newsapi"
  },
  {
    id: "tavily",
    provider: "Tavily Search",
    description: "Search engine optimized for LLMs, great for general market and industry research.",
    capabilities: ["semiconductor-industry", "financial-news", "institutional-sentiment"],
    cost: 1.00,
    latency: "300ms",
    reliability: "99.8%",
    endpoint: "https://api.tavily.com/search",
    vaultId: "vault-tavily"
  },
  {
    id: "fmp",
    provider: "Financial Modeling Prep",
    description: "Accurate financial data, SEC filings, earnings, and institutional sentiment.",
    capabilities: ["market-data", "sec-filings", "earnings", "institutional-sentiment", "analyst-ratings"],
    cost: 2.50,
    latency: "180ms",
    reliability: "99.9%",
    endpoint: "https://financialmodelingprep.com/api/v3",
    vaultId: "vault-fmp"
  },
  {
    id: "sec-edgar",
    provider: "SEC EDGAR API",
    description: "Direct access to SEC filings and corporate disclosures.",
    capabilities: ["sec-filings", "earnings"],
    cost: 0.10,
    latency: "500ms",
    reliability: "99.0%",
    endpoint: "https://data.sec.gov/submissions",
    vaultId: "vault-sec-edgar"
  },
  {
    id: "twelve-data",
    provider: "Twelve Data",
    description: "Financial data API for stocks, forex, crypto, and ETFs.",
    capabilities: ["market-data", "forex", "crypto", "macroeconomics"],
    cost: 1.80,
    latency: "100ms",
    reliability: "99.95%",
    endpoint: "https://api.twelvedata.com",
    vaultId: "vault-twelve-data"
  }
];
