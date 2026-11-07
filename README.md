# Portfolio

Personal site for Suhail Tailor — software engineering master's student at San José State, with four projects running in production and a fifth in developer preview.

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

## Browser support

Chrome, Firefox, Safari 15.4+ and Edge. The floor is set by `:focus-visible` and `aspect-ratio`; `backdrop-filter` is used with its `-webkit-` prefix, and WebP is supported everywhere above that bar.

## Contact

- **Email** — suhail.tailor@sjsu.edu
- **LinkedIn** — [Suhail Tailor](https://www.linkedin.com/in/suhail-tailor-10016322b/)
- **GitHub** — [Sptailor](https://github.com/Sptailor)
- **Location** — San José, California
