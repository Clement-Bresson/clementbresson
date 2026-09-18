# Blog pipeline: from a text to a pull request

Step 1 of the phone-to-blog pipeline. A raw text goes in, a pull request with a bilingual article and a preview URL comes out. Steps 2 (Slack → Cloudflare Worker → `repository_dispatch`) and 3 (Slack app) build on this and are not in the repo yet.

## Pieces

| Piece                             | Role                                                                                                                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/blog-post.yml` | The workflow: installs OpenCode, runs the agent, validates, commits on `post/<slug>`, opens the PR, uploads a preview                                                  |
| `.opencode/agents/blog-writer.md` | The OpenCode agent: writer prompt and permissions (edits allowed in `src/content/blog/**` and `.pipeline/**` only, bash limited to `scripts/article.ts` and the build) |
| `opencode.json`                   | Loads the editorial skill (`.claude/skills/blog-article/SKILL.md`) as instructions; `AGENTS.md` is loaded by default                                                   |
| `AGENTS.md`, "Headless runs"      | The rules specific to unattended runs (scope, no invented facts, TODO markers, no commit)                                                                              |
| `.github/scripts/pr-body.ts`      | Builds the PR body: title, summary, TODO markers, sources, files                                                                                                       |
| `.github/actions/preview`         | Uploads `dist/` as a Worker version and posts its preview URL on the PR (also used by `deploy.yml` for every PR)                                                       |

## Secrets

| Secret                         | Needed for                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`            | `anthropic/*` models (the default)                                                |
| `OPENAI_API_KEY`               | `openai/*` models, only if you pick one                                           |
| `GOOGLE_GENERATIVE_AI_API_KEY` | `google/*` models, only if you pick one                                           |
| `CLOUDFLARE_API_TOKEN`         | Preview upload (already used by the deploy); the token needs Workers Scripts edit |
| `CLOUDFLARE_ACCOUNT_ID`        | Same                                                                              |
| `PIPELINE_PAT`                 | Optional, see "Checks on the PR" below                                            |

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

## Contract for step 2

`repository_dispatch` with `event_type: blog-post` and this `client_payload`:

```json
{
  "text": "…",
  "model": "anthropic/claude-sonnet-5",
  "title_hint": "",
  "slack_channel": "C0123",
  "slack_thread_ts": "1726650000.000100"
}
```

`model` and `title_hint` are optional. `slack_channel` and `slack_thread_ts` are passed through as job outputs (`slack_channel`, `slack_thread_ts`, next to `pr_url` and `preview_url`) for the step that will post back to Slack.

## Facts checked while building this

- Astro 7 static site, npm, Node 24 (`.node-version`); validation is `npm run article:check` and `npm run build`.
- Content collection `src/content/blog/<slug>/{en,fr}.md`, schema in `src/content.config.ts` (`title`, `description`, `pubDate`, `updatedDate`, `cover`, `coverAlt`, `tags` from `src/data/tags.json`, `linkedin`, `sources`, `draft`). No author field: the author is the site.
- Hosting is Cloudflare Workers static assets deployed by `wrangler deploy` from `deploy.yml`, not Cloudflare Pages, hence the Worker-version preview.
- OpenCode: agents in `.opencode/agents/*.md`, per-path `edit` and per-command `bash` permissions (last matching rule wins), `opencode run --agent … --model … --auto`, install with `npm install -g opencode-ai`.
