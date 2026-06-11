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
    id: "bloomberg",
    provider: "Bloomberg Terminal API",
    description: "Premium market data, institutional sentiment, and macroeconomic indicators.",
    capabilities: ["market-data", "institutional-sentiment", "macroeconomics", "financial-news"],
    cost: 15.50,
    latency: "120ms",
    reliability: "99.99%",
    endpoint: "https://api.bloomberg.com/v1/data",
    vaultId: "vault-bloomberg"
  },
  {
    id: "alphasense",
    provider: "AlphaSense",
    description: "Deep corporate research, SEC filings, and analyst ratings.",
    capabilities: ["sec-filings", "analyst-ratings", "earnings", "institutional-sentiment"],
    cost: 8.75,
    latency: "180ms",
    reliability: "99.9%",
    endpoint: "https://api.alphasense.com/search",
    vaultId: "vault-alphasense"
  },
  {
    id: "factset",
    provider: "FactSet Research",
    description: "Comprehensive financial data and corporate intelligence.",
    capabilities: ["market-data", "earnings", "analyst-ratings", "financial-news"],
    cost: 6.20,
    latency: "200ms",
    reliability: "99.8%",
    endpoint: "https://api.factset.com/v2/intelligence",
    vaultId: "vault-factset"
  },
  {
    id: "glassnode",
    provider: "Glassnode Advanced",
    description: "On-chain data and cryptocurrency market intelligence.",
    capabilities: ["crypto", "market-data", "macroeconomics"],
    cost: 3.50,
    latency: "150ms",
    reliability: "99.5%",
    endpoint: "https://api.glassnode.com/v1/metrics",
    vaultId: "vault-glassnode"
  },
  {
    id: "techinsights",
    provider: "TechInsights Semiconductors",
    description: "Deep technical analysis and market data for the semiconductor industry.",
    capabilities: ["semiconductor-industry", "market-data", "financial-news"],
    cost: 12.00,
    latency: "250ms",
    reliability: "99.0%",
    endpoint: "https://api.techinsights.com/semi",
    vaultId: "vault-techinsights"
  },
  {
    id: "sec-edgar",
    provider: "SEC EDGAR Premium Feed",
    description: "Direct real-time access to SEC filings and corporate disclosures.",
    capabilities: ["sec-filings", "earnings"],
    cost: 1.50,
    latency: "50ms",
    reliability: "99.9%",
    endpoint: "https://api.sec.gov/edgar",
    vaultId: "vault-sec-edgar"
  },
  {
    id: "coinmetrics",
    provider: "CoinMetrics Pro",
    description: "Cryptocurrency network data and market metrics.",
    capabilities: ["crypto", "institutional-sentiment"],
    cost: 2.80,
    latency: "100ms",
    reliability: "99.9%",
    endpoint: "https://api.coinmetrics.io/v4/timeseries",
    vaultId: "vault-coinmetrics"
  },
  {
    id: "oanda",
    provider: "OANDA Forex API",
    description: "Foreign exchange rates and historical forex data.",
    capabilities: ["forex", "market-data"],
    cost: 1.10,
    latency: "80ms",
    reliability: "99.95%",
    endpoint: "https://api.oanda.com/v3/instruments",
    vaultId: "vault-oanda"
  }
];
