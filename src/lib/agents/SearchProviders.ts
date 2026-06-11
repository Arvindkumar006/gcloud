export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedAt?: string;
  source?: string;
}

export interface SearchProvider {
  name: string;
  search(query: string): Promise<SearchResult[]>;
}

export class TavilySearchProvider implements SearchProvider {
  name = "Tavily";

  async search(query: string): Promise<SearchResult[]> {
    const apiKey = process.env.TAVILY_API_KEY || "";
    if (!apiKey) {
      throw new Error("Missing TAVILY_API_KEY environment variable. Add it to .env.local");
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "basic",
        include_answer: false,
        include_images: false,
        include_raw_content: false,
        max_results: 10
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily API returned ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.results) {
      return [];
    }

    return data.results.map((r: any) => ({
      title: r.title,
      url: r.url,
      snippet: r.content,
      publishedAt: r.published_date || undefined,
      source: "Tavily"
    }));
  }
}
