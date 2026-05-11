export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, useWebSearch = false, messages = null } = req.body;
  if (!prompt && !messages) {
    return res.status(400).json({ error: "Missing prompt or messages" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured." });
  }

  const msgs = messages || [{ role: "user", content: prompt }];

  // Reduced max_tokens to save quota
  // AI personal analysis: 800 (was 2000) — 200-word answer needs ~400 tokens
  // Community search: 1500 (web_search needs more for JSON output)
  const body = {
    model: "claude-sonnet-4-5",
    max_tokens: useWebSearch ? 1500 : 800,
    messages: msgs,
  };

  if (useWebSearch) {
    body.tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }];
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      // Friendlier error for rate limit
      if (response.status === 429) {
        return res.status(429).json({
          error: "API 用量已达上限，请等 1 分钟再试 / Rate limit reached, please wait 1 minute"
        });
      }
      return res.status(500).json({
        error: `Anthropic error ${response.status}: ${data?.error?.message || JSON.stringify(data)}`
      });
    }

    const text = (data.content || [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("\n");

    if (!text) {
      return res.status(500).json({ error: "Empty response" });
    }

    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
}
