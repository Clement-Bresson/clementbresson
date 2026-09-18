# Blog pipeline: from a text to a pull request

A raw text goes in, a pull request with a bilingual article and a preview URL comes out. Two entry points: the GitHub Actions form (step 1) and a Slack channel through the `blog-slack-relay` Worker (steps 2 and 3, see "Slack" below).

## Pieces

| Piece                             | Role                                                                                                                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/blog-post.yml` | The workflow: installs OpenCode, runs the agent, validates, commits on `post/<slug>`, opens the PR, uploads a preview                                                  |
| `.opencode/agents/blog-writer.md` | The OpenCode agent: writer prompt and permissions (edits allowed in `src/content/blog/**` and `.pipeline/**` only, bash limited to `scripts/article.ts` and the build) |
| `opencode.json`                   | Loads the editorial skill (`.claude/skills/blog-article/SKILL.md`) as instructions; `AGENTS.md` is loaded by default                                                   |
| `AGENTS.md`, "Headless runs"      | The rules specific to unattended runs (scope, no invented facts, TODO markers, no commit)                                                                              |
| `.github/scripts/pr-body.ts`      | Builds the PR body: title, summary, TODO markers, sources, files                                                                                                       |
| `.github/actions/preview`         | Uploads `dist/` as a Worker version and posts its preview URL on the PR (also used by `deploy.yml` for every PR)                                                       |
| `workers/slack-relay`             | Cloudflare Worker: Slack message → `repository_dispatch` → ack in the thread; deployed by `deploy.yml`; `slack-manifest.json` creates the Slack app                    |

## Secrets

| Secret                         | Needed for                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`            | `anthropic/*` models (the default)                                                  |
| `OPENAI_API_KEY`               | `openai/*` models, only if you pick one                                             |
| `GOOGLE_GENERATIVE_AI_API_KEY` | `google/*` models, only if you pick one                                             |
| `CLOUDFLARE_API_TOKEN`         | Preview upload (already used by the deploy); the token needs Workers Scripts edit   |
| `CLOUDFLARE_ACCOUNT_ID`        | Same                                                                                |
| `PIPELINE_PAT`                 | Optional, see "Checks on the PR" below                                              |
| `SLACK_SIGNING_SECRET`         | Slack relay: request signature check                                                |
| `SLACK_BOT_TOKEN`              | Slack relay and the workflow's "Report to Slack" step                               |
| `GH_DISPATCH_TOKEN`            | Slack relay: fine-grained token, Contents and Pull requests read/write on this repo |

## Trigger from the phone

GitHub app → repository → Actions → "Blog post" → Run workflow:

1. `text`: paste the post. French or English; both languages are generated.
2. `model`: leave the default unless you are comparing providers.
3. `title_hint`: optional, a title or an angle for the article.

Within about five minutes the run summary shows the PR link, the PR body and the preview URL. Review on the preview, edit the Markdown from the GitHub app if needed, merge. The merge deploys.

Every run creates exactly one folder `src/content/blog/<slug>/` with `en.md` and `fr.md`, and may edit existing articles under the same folder to add inbound links. The run fails if anything else changed, if zero or several folders were created, or if `npm run article:check` or `npm run build` fails.

## TODO markers

The agent researches sources online (OpenCode's `websearch`, Exa-backed, enabled by `OPENCODE_ENABLE_EXA=1`, and `webfetch`): every product, company, person, talk or article the text names gets its official page found, fetched, listed in `sources` and linked on first mention. It never writes a URL it could not fetch, nor invents a figure, a quote or a person. When the text relies on something it cannot find a source for, it keeps the sentence and adds, in both languages:

```markdown
<!-- TODO source: the 2024 study the paragraph refers to -->
```

The PR body lists every marker. HTML comments are not rendered, but resolve or delete them before merging: add the source to the `sources` frontmatter field, or remove the claim.

## Cost

Every run prints its token usage and cost per model in the run summary (`opencode stats`, priced from models.dev), whatever the provider. For an account-level view, use a dedicated API key named for the pipeline in each provider console (Anthropic Console → Usage & Cost, OpenAI usage page, Google AI Studio): the key's own line is the pipeline's spend.

## Changing the default model

Edit `default:` under `model` in `.github/workflows/blog-post.yml` and the fallback in the job's `MODEL` env (used by `repository_dispatch`). Ids are `provider/model` as listed on [models.dev](https://models.dev).

## Adding a provider

1. Add the provider's key as a repository secret with the name OpenCode expects (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`; other providers on [opencode.ai/docs/providers](https://opencode.ai/docs/providers/)).
2. Pass it to the "Run the writer" step in `blog-post.yml`.
3. Add its models to the `options` of the `model` input.

## Checks on the PR

One-time repository setting, or every run fails at the PR step with "GitHub Actions is not permitted to create or approve pull requests": Settings → Actions → General → Workflow permissions → tick "Allow GitHub Actions to create and approve pull requests".

The workflow validates and builds the article before opening the PR, and uploads the preview itself. When the PR is created with the default `GITHUB_TOKEN`, GitHub does not run other workflows on it: `deploy.yml` will not add its "Build" check or refresh the preview on later pushes to the branch. If you want that, create a fine-grained personal access token with contents and pull requests write on this repo and add it as the `PIPELINE_PAT` secret; the workflow uses it when present.

## Preview URLs

`wrangler.jsonc` has `preview_urls: true`. Each PR gets a Worker version (`wrangler versions upload --preview-alias pr-<n>`), which is not deployed to production; the URL is on `workers.dev` and is posted as a PR comment, updated on every push. Canonical URLs and the sitemap inside a preview point to the production domain, which is fine for review.

## Slack

Post a message in the Slack channel, get the PR link back in the thread.

```
Slack channel  --event-->  Worker blog-slack-relay  --repository_dispatch-->  blog-post workflow
     ^                              |                                              |
     |<---- "Received" in thread ---+                                              |
     |<---------------------- "PR ready: … / Preview: …" in thread ----------------+
```

- `workers/slack-relay/src/index.ts`: verifies Slack's signature (HMAC, 5-minute window), answers the URL challenge, ignores retries, bots, edits and thread replies, accepts only top-level messages from `SLACK_ALLOWED_USER_ID`, calls `POST /repos/<repo>/dispatches` with `event_type: blog-post`, then posts an acknowledgement in the thread. A first line `model: provider/model` picks the model; the rest is the text.
- The workflow's last step ("Report to Slack", runs even on failure) posts the PR and preview URLs, or the run link, in the same thread using `SLACK_BOT_TOKEN`.
- Reply `merge` or `close` in that thread (exact word, from the allowed user) and the Worker merges or closes the PR the bot announced there and deletes its branch, then confirms in the thread. It finds the PR number in its own "PR ready" message (`conversations.replies`), so it only ever acts on PRs it announced. A merge triggers the normal deploy.
- `deploy.yml` deploys the Worker on every push to `main` (job "Deploy the Slack relay") and uploads its secrets from the GitHub secrets. It skips the deploy, with a note in the summary, until the three secrets exist.
- Local run: `npm run relay:dev` with a `workers/slack-relay/.dev.vars` file (ignored by git) holding the three secrets; `npm run check:relay` type-checks it.

`client_payload` sent by the Worker:

```json
{
  "text": "…",
  "model": "anthropic/claude-sonnet-5",
  "slack_channel": "C0123",
  "slack_thread_ts": "1726650000.000100"
}
```

### Setup, once

1. **Slack app**: [api.slack.com/apps](https://api.slack.com/apps) → Create New App → From a manifest → pick the workspace → paste `workers/slack-relay/slack-manifest.json` with the `request_url` pointing at your Worker URL (`https://blog-slack-relay.<subdomain>.workers.dev/slack/events`; the subdomain is on the Workers overview page of the Cloudflare dashboard). Slack cannot verify that URL before the Worker is deployed, so if it complains, create the app without the `event_subscriptions` block and add the request URL in Event Subscriptions after step 4.
2. **Secrets from Slack** (app page): _Basic Information → Signing Secret_ → GitHub secret `SLACK_SIGNING_SECRET`. _Install App → Install to Workspace_, then _Bot User OAuth Token_ (`xoxb-…`) → GitHub secret `SLACK_BOT_TOKEN`.
3. **GitHub token for the Worker**: GitHub → Settings → Developer settings → Fine-grained tokens → New: this repository only, permissions _Contents: Read and write_ (what `repository_dispatch` needs) and _Pull requests: Read and write_ (for `merge`/`close` from the thread), expiry at most a year → GitHub secret `GH_DISPATCH_TOKEN`. Note the expiry date somewhere; the ack message in Slack will say `401` when it lapses.
4. **Your Slack member ID**: Slack → your profile → ⋯ → Copy member ID (`U…`) → put it in `vars.SLACK_ALLOWED_USER_ID` of `workers/slack-relay/wrangler.jsonc`, commit, push. The push deploys the Worker.
5. **Channel**: create `#agent-clementbresson-blog-post` (public or private), and invite the bot: `/invite @clementbresson.com`. If the app was created without event subscriptions, now add the request URL under Event Subscriptions and subscribe the bot to `message.channels` and `message.groups`; save, reinstall if Slack asks.
6. **Test**: post a short text in `#agent-clementbresson-blog-post`. Within seconds: "Received…" in the thread. Within ~5 minutes: the PR and preview links.

## Facts checked while building this

- Astro 7 static site, npm, Node 24 (`.node-version`); validation is `npm run article:check` and `npm run build`.
- Content collection `src/content/blog/<slug>/{en,fr}.md`, schema in `src/content.config.ts` (`title`, `description`, `pubDate`, `updatedDate`, `cover`, `coverAlt`, `tags` from `src/data/tags.json`, `linkedin`, `sources`, `draft`). No author field: the author is the site.
- Hosting is Cloudflare Workers static assets deployed by `wrangler deploy` from `deploy.yml`, not Cloudflare Pages, hence the Worker-version preview.
- OpenCode: agents in `.opencode/agents/*.md`, per-path `edit` and per-command `bash` permissions (last matching rule wins), `opencode run --agent … --model … --auto`, install with `npm install -g opencode-ai`.
