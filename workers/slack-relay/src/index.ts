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
    const text = e.text?.trim() ?? "";
    const isMessage = e.type === "message" && !e.subtype && !e.bot_id;
    if (!isMessage || e.user !== env.SLACK_ALLOWED_USER_ID || !text)
      return new Response("ok");

    const command = COMMANDS[text.toLowerCase()];
    if (!e.thread_ts) ctx.waitUntil(relay(e, env));
    else if (command) ctx.waitUntil(command(e.channel, e.thread_ts, env));
    return new Response("ok");
  },
} satisfies ExportedHandler<Env>;

type Command = (channel: string, thread: string, env: Env) => Promise<void>;

const COMMANDS: Record<string, Command> = {
  merge: (channel, thread, env) => act(channel, thread, env, "merge"),
  close: (channel, thread, env) => act(channel, thread, env, "close"),
};

async function act(
  channel: string,
  thread: string,
  env: Env,
  action: "merge" | "close",
): Promise<void> {
  const reply = (text: string) => postMessage(env, channel, thread, text);
  const number = await announcedPullRequest(env, channel, thread);
  if (!number) return reply("No pull request announced in this thread yet.");

  const pr = await github(env, `pulls/${number}`);
  if (!pr.ok) return reply(`GitHub answered ${pr.status} for PR #${number}.`);
  const { state, merged, head } = (await pr.json()) as {
    state: string;
    merged: boolean;
    head: { ref: string };
  };
  if (merged) return reply(`PR #${number} is already merged.`);
  if (state !== "open") return reply(`PR #${number} is already closed.`);

  const r =
    action === "merge"
      ? await github(env, `pulls/${number}/merge`, "PUT", {
          merge_method: "merge",
        })
      : await github(env, `pulls/${number}`, "PATCH", { state: "closed" });
  if (!r.ok) {
    const { message } = (await r.json()) as { message?: string };
    return reply(
      `Could not ${action} PR #${number}: ${r.status} ${message ?? ""}`,
    );
  }
  await github(env, `git/refs/heads/${head.ref}`, "DELETE");
  await reply(
    action === "merge"
      ? `Merged PR #${number}. The deploy is running; the article is live in a few minutes.`
      : `Closed PR #${number} and deleted its branch.`,
  );
}

async function announcedPullRequest(
  env: Env,
  channel: string,
  thread: string,
): Promise<number | undefined> {
  const r = await fetch(
    `https://slack.com/api/conversations.replies?channel=${channel}&ts=${thread}`,
    { headers: { authorization: `Bearer ${env.SLACK_BOT_TOKEN}` } },
  );
  const { messages = [] } = (await r.json()) as {
    messages?: { bot_id?: string; text?: string }[];
  };
  const repo = env.GITHUB_REPO.replace(/[.]/g, "\\.");
  const re = new RegExp(`github\\.com/${repo}/pull/(\\d+)`);
  for (const m of messages) {
    const found = m.bot_id && m.text?.match(re);
    if (found) return Number(found[1]);
  }
  return undefined;
}

function github(
  env: Env,
  path: string,
  method = "GET",
  body?: unknown,
): Promise<Response> {
  return fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/${path}`, {
    method,
    headers: {
      authorization: `Bearer ${env.GH_DISPATCH_TOKEN}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "blog-slack-relay",
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

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
  const r = await github(env, "dispatches", "POST", {
    event_type: "blog-post",
    client_payload: {
      text,
      model,
      slack_channel: e.channel,
      slack_thread_ts: e.ts,
    },
  });
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
