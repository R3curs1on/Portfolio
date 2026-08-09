# Vedant Shendge / Portfolio

An interactive portfolio built like a small engineering dashboard instead of a plain resume page.

The site highlights my competitive programming profile, full-stack projects, leadership work, and live developer signals in one dark, terminal-inspired interface. It is intentionally lightweight: just HTML, CSS, and JavaScript, with no framework or build step needed.

## What it shows

- Achievement-first landing section with animated counters
- Live GitHub repository/activity cards
- Codeforces profile and contest telemetry
- LeetCode and CodeChef snapshots with graceful fallbacks
- Project case studies with architecture diagrams
- Skill filtering across projects and repositories
- Interactive terminal with commands like `help`, `projects`, `resume`, `matrix`, and `debug`
- Resume preview modal
- Hidden debug route for runtime info, local logs, FPS, and release status

## Stack

This portfolio keeps the stack simple on purpose:

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas animations
- GitHub API
- Codeforces API
- LeetCode GraphQL attempt with local fallback
- Google Drive resume embed

No bundler, no package install, no deployment lock-in.

## Run locally

Open `index.html` directly in a browser.

For a cleaner local preview, run a static server from the project root:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

The main page is `index.html`. The diagnostics page is available at `debug.html`.

## Project structure

```text
.
|-- index.html      # Main portfolio page
|-- style.css       # Layout, theme, responsive design, animations
|-- script.js       # Live data, terminal, charts, counters, canvas effects
|-- debug.html      # Runtime diagnostics route
|-- archive/        # Older portfolio iterations
`-- README.md
```

## Current version

The current build is `v2.5`.

Recent work focused on making the site feel more like a live profile:

- `v2.5`: live platform signals, repo cards, terminal commands, matrix mode, debug page
- `v2.4`: redesigned hero, timeline, certification cards, cleaner project case studies
- `v2.3`: achievement-first layout and flatter visual language

## Notes

Some external data depends on public browser access. GitHub and Codeforces usually load directly. LeetCode can block browser-side requests, so the site falls back to a local profile snapshot instead of breaking the section.

The certification and contact sections are structured for the production version and should be updated with final verified details before publishing widely.
