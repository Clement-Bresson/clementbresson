export interface Env {
  SLACK_SIGNING_SECRET: string;
  SLACK_BOT_TOKEN: string;
  GH_DISPATCH_TOKEN: string;
  GITHUB_REPO: string;
  SLACK_ALLOWED_USER_ID: string;
}

type SlackMessage = {
  type: string;
  subtype?: string;
  user?: string;
  bot_id?: string;
  channel: string;
  ts: string;
  thread_ts?: string;
  text?: string;
};

type SlackPayload =
  | { type: "url_verification"; challenge: string }
  | { type: "event_callback"; event: SlackMessage };

const DEFAULT_MODEL = "anthropic/claude-sonnet-5";
const MAX_AGE_SECONDS = 300;

export default {
  async fetch(request, env, ctx): Promise<Response> {
    if (
      request.method !== "POST" ||
      new URL(request.url).pathname !== "/slack/events"
    )
      return new Response("Not found", { status: 404 });
    const body = await request.text();
    if (!(await verify(request, body, env.SLACK_SIGNING_SECRET)))
      return new Response("Bad signature", { status: 401 });

    const payload = JSON.parse(body) as SlackPayload;
    if (payload.type === "url_verification")
      return new Response(payload.challenge);
    // Slack retries when the first delivery is slow; the first one already ran.
    if (request.headers.get("x-slack-retry-num")) return new Response("ok");
    if (payload.type !== "event_callback") return new Response("ok");

    const e = payload.event;
    const isPost =
      e.type === "message" && !e.subtype && !e.bot_id && !e.thread_ts;
    if (!isPost || e.user !== env.SLACK_ALLOWED_USER_ID || !e.text?.trim())
      return new Response("ok");

    ctx.waitUntil(relay(e, env));
    return new Response("ok");
  },
} satisfies ExportedHandler<Env>;

async function verify(
  request: Request,
  body: string,
  secret: string,
): Promise<boolean> {
  const timestamp = request.headers.get("x-slack-request-timestamp") ?? "";
  const signature = request.headers.get("x-slack-signature") ?? "";
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!timestamp || !signature || !(age < MAX_AGE_SECONDS)) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`v0:${timestamp}:${body}`),
  );
  const expected = `v0=${[...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function unescapeSlack(text: string): string {
  return text
    .replace(/<(https?:\/\/[^|>]+)(?:\|[^>]*)?>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function parseMessage(raw: string): { text: string; model: string } {
  const text = unescapeSlack(raw).trim();
  const m = text.match(/^model:\s*(\S+)\s*\n+([\s\S]*)$/);
  return m
    ? { text: m[2].trim(), model: m[1] }
    : { text, model: DEFAULT_MODEL };
}

async function relay(e: SlackMessage, env: Env): Promise<void> {
  const { text, model } = parseMessage(e.text ?? "");
  const r = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}/dispatches`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.GH_DISPATCH_TOKEN}`,
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
        "user-agent": "blog-slack-relay",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        event_type: "blog-post",
        client_payload: {
          text,
          model,
          slack_channel: e.channel,
          slack_thread_ts: e.ts,
        },
      }),
    },
  );
  const runs = `https://github.com/${env.GITHUB_REPO}/actions/workflows/blog-post.yml`;
  const message = r.ok
    ? `Received. Writing the article with ${model}; the PR link will follow here. Runs: ${runs}`
    : `Could not start the workflow: GitHub answered ${r.status} ${await r.text()}`;
  await postMessage(env, e.channel, e.ts, message);
}

async function postMessage(
  env: Env,
  channel: string,
  thread_ts: string,
  text: string,
): Promise<void> {
  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
      "content-type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ channel, thread_ts, text }),
  });
}
