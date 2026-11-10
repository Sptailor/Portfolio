# Portfolio

Personal site for Suhail Tailor — Software Engineering master's student at San José State University, with five deployed applications and one project in developer preview.

**[portfolio-sptailor.vercel.app](https://portfolio-sptailor.vercel.app/)**

## Stack

Vanilla HTML, CSS and JavaScript. No framework, no build step — the files that are committed are the files that are served.

- **Background** — a kinetic grid drawn on a `<canvas>`: grid points warp toward the pointer within a 260px radius, edges stay pinned, and clicks send a ripple outward at 400px/sec.
- **Surfaces** — two tiers of glass (`.thin`, `.thick`) built on `backdrop-filter`, so the grid stays legible through the cards.
- **Theme** — dark by default, with a light theme on the drawer toggle. Colours live in custom properties on `.rootx`; the few values that have to be inline carry a `data-tint` hook that `Main.js` repaints.
- **Navigation** — a collapsible drawer that overlaps the content and closes on an outside click.
- **Work** — an accordion; each row opens to the problem, what I did, the stack and a link to the live site or the source.

## Layout

```text
index.html                     markup
Portfolio.css                  all styles
Main.js                        canvas, drawer, accordion, theme, magnetic labels
analytics.js                   PostHog, Vercel Web Analytics, GA4
Resume.pdf
assets/                        images used by the site, favicon, OG image
data/activity.json             GitHub contribution snapshot
scripts/activity.mjs           regenerates the snapshot
.github/workflows/activity.yml daily refresh
```

## Activity data

The contribution graph is real. `scripts/activity.mjs` queries the GitHub GraphQL API and writes `data/activity.json`; the page ships with a committed snapshot and fetches the JSON at runtime, so the section still renders if the request fails.

```sh
GITHUB_TOKEN=$(gh auth token) node scripts/activity.mjs
```

A scheduled workflow re-runs it daily. If the data stops updating, the Actions token has lost access to `contributionsCollection` — add a personal access token with `read:user` as the `ACTIVITY_TOKEN` secret.

## Running locally

```sh
python3 -m http.server
```

Then open <http://localhost:8000>. A server is needed rather than opening the file directly, because the activity fetch and the webfonts are blocked under `file://`.

## Analytics

`analytics.js` holds all three providers and the config block that switches
them on. An empty string leaves a provider dormant — nothing loads and
nothing is sent.

| Provider | Carries | Plan |
| --- | --- | --- |
| Vercel Web Analytics | pageviews only | Hobby: 2,500 events/mo, ~1 month retention |
| PostHog | pageviews and the events below | Free: 1M events/mo |
| GA4 | the events below, if a measurement ID is set | free |

Custom events are not sent to Vercel on purpose: they are a Pro-plan
feature, so PostHog carries them instead.

Events: `resume_download`, `project_click`, `project_expand`,
`github_click`, `linkedin_click`, `contact_click`. One delegated listener on
the document reads every click and emits exactly one event, so a GitHub link
inside a project row is a `github_click` carrying the project name rather
than two events. `capture_pageview` is pinned to `true` rather than the
`history_change` that the 2026-08-30 defaults would pick, because the nav is
hash links on one document and would otherwise add a pageview per jump.

### Keeping my own visits out

Load the site once per browser with `?analytics=off`. The flag lives in
`localStorage`, so it is per browser and per device, and clearing site data
clears it. `?analytics=on` puts the browser back. Localhost and automated
browsers are excluded without being asked. An opted-out browser never
fetches the Vercel script at all, which is the only lever Vercel offers —
it has no per-visitor opt-out.

### Session replay

Off, and there is no consent bar. Recording a real visit is the one thing
here that would need asking, and a permission prompt is too high a price on
a page whose job is a first impression — so the recording went instead of
the prompt. Pageviews and clicks stay: they are anonymous, cookieless and
carry no session.

`disable_session_recording` is what switches it off. The masking beside it is
inert while recording is off and is kept on purpose, so turning the flag back
on cannot quietly record anything raw. It would also need switching on in
PostHog under **Settings → Project → Session replay**, and it would need the
prompt back.

### Reading the data from Claude Code

```sh
claude mcp add --transport http posthog https://mcp.posthog.com/mcp -s user
```

Then run `/mcp` and log in. Calling the MCP tools is free.

## Browser support

Chrome, Firefox, Safari 15.4+ and Edge. The floor is set by `:focus-visible` and `aspect-ratio`; `backdrop-filter` is used with its `-webkit-` prefix, and WebP is supported everywhere above that bar.

## Contact

- **Email** — suhail.tailor@sjsu.edu
- **LinkedIn** — [Suhail Tailor](https://www.linkedin.com/in/suhail-tailor-10016322b/)
- **GitHub** — [Sptailor](https://github.com/Sptailor)
- **Location** — San José, California
