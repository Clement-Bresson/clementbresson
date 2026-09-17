import type { APIRoute } from "astro";

// Search engines and AI crawlers are all welcome; the explicit entries make the
// intent unambiguous for crawlers that look for their own user-agent block.
const aiCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
  "DuckAssistBot",
  "meta-externalagent",
  "Amazonbot",
  "MistralAI-User",
];

export const GET: APIRoute = ({ site }) => {
  const lines = [
    "User-agent: *",
    "Allow: /",
    "",
    ...aiCrawlers.flatMap((ua) => [`User-agent: ${ua}`, "Allow: /", ""]),
    `Sitemap: ${new URL("sitemap-index.xml", site).href}`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
