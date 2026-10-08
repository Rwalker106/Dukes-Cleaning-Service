# BUILD — Duke's Professional Cleaning

> Static multipage website for Duke's Professional Cleaning Services (commercial, medical, and janitorial cleaning across Dacula, Gwinnett County, and Metro Atlanta), rebuilt in Astro from a previous vanilla JS/Vite build.

**Status: IN PROGRESS.** This document is a living record, updated as the rebuild proceeds. Sections marked `TODO` describe planned work that has not been built yet — nothing below is invented ahead of the actual code.

---

## Prerequisites

- Node.js `v22.12.0` or higher (required by `package.json`'s `engines` field)
- npm
- A Netlify account with access to the existing production site (no new Netlify site will be created — see Deployment)

---

## Quick start

```bash
git clone <repo-url>   # TODO: repo not yet created/pushed
cd dukes-professional-cleaning
npm install
npm run dev
```

Open: http://localhost:4321 (Astro's default dev server port)

`AGENTS.md` previously documented an `astro dev --background` workflow with `stop`/`status`/`logs` subcommands — this was verified against Astro's current CLI reference and does not exist. It's been corrected. `astro dev` runs in the foreground; to actually background it, that's a shell-level operation (e.g. `astro dev > astro-dev.log 2>&1 &` in Git Bash/WSL, or `Start-Process` in PowerShell), not an Astro feature.

---

## npm scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Start the Astro dev server |
| `npm run build` | Build for production → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run astro` | Run the Astro CLI directly (e.g. `npm run astro -- add <integration>`) |

---

## Project structure

```
dukes-professional-cleaning/
├── public/                  # Static assets copied as-is to dist/
├── src/
│   ├── assets/              # Migrated images (logo, service photos, hero images)
│   ├── layouts/
│   │   └── BaseLayout.astro # Shared page shell — title/description props
│   ├── pages/
│   │   └── index.astro      # Home page (only page built so far)
│   └── styles/               # Currently empty — global CSS TODO
├── astro.config.mjs         # site + astro-favicons integration
├── tsconfig.json            # extends astro/tsconfigs/strict
├── package.json
└── AGENTS.md                # dev workflow + doc links (CLAUDE.md is a symlink to this)
```

Note: unlike a vanilla Vite multipage setup, there is no `vite.config.js` with `rollupOptions.input` — Astro's file-based router treats every file in `src/pages/` as a route automatically.

**Favicons:** `astro-favicons` (v3.1.6, verified against its npm registry entry and GitHub README) is wired up in `astro.config.mjs`. It generates the full favicon/PWA asset set (multiple PNG sizes, apple-touch-icon, web manifest, etc.) from `public/favicon.svg` at build/dev time and injects the corresponding `<link>`/`<meta>` tags automatically — no manual favicon `<link>` tags needed in `BaseLayout.astro` for this.

---

## Pages

| Page | File | Purpose |
|------|------|---------|
| Home | `src/pages/index.astro` | Landing page |

TODO: remaining pages below have not been created yet — this table will grow as each is built.

---

## Planned site map

Content/IA decisions finalized during planning; nothing below exists as code yet — all TODO.

- `/` — Home *(built)*
- `/services/` — Services index, links out to each service page below *(TODO)*
  - `/services/medical-cleaning` *(TODO)*
  - `/services/green-cleaning` *(TODO — cross-cutting eco-friendly angle, also referenced on the other service pages, not siloed to just this page)*
  - `/services/office-cleaning` *(TODO)*
- `/request-for-proposal` — Formal RFP intake *(TODO)*. Only name/contact/facility-type/services-needed are required; budget range, contract terms, current provider, and file upload (attached to the notification email) are optional fields for prospects further along in a formal procurement process — so someone earlier in the process can still submit a partial form as a callback request.
- `/areas-we-serve` — Geographic coverage *(TODO)*. County/region-level (Dacula, Gwinnett County, Metro Atlanta, "and surrounding areas") rather than an exhaustive city list. May reference recognizable landmarks (e.g., the Perimeter area, Lawrenceville, near Emory's campus) as descriptors of the service radius — not as claims of an existing client relationship with those named institutions unless that's actually true.
- `/industries-we-serve` — Vertical/client-type focus *(TODO)*, e.g. medical facilities, automotive/car dealerships, corporate offices — separate axis from geography, each linking back to the relevant service page.

Site nav/menu structure: not yet finalized — TODO once pages exist.

---

## JavaScript architecture

Not yet built. Planned, per project scope discussed:

- Date logic (e.g. displaying current year in footer, or similar)
- Contact form(s) — possibly
- Mobile menu visibility toggle
- Cal.com booking widget embed

None of these have code yet — this section will be filled in with real file names and behavior as each is implemented.

---

## CSS architecture

`src/styles/` exists but is currently empty. TODO once styles are migrated/rebuilt.

---

## Environment variables

None defined yet — no `.env` or `.env.example` exists in the project yet.

If the Cal.com integration or a form provider ends up needing a client-side key, it must be prefixed `VITE_` to be exposed to browser JS (Astro is built on Vite). Never put secret/server-only keys behind a `VITE_` prefix.

**Adding secrets (when needed):** Netlify dashboard → Site configuration → Environment variables.

---

## Deployment

The current production site is **already live on Netlify**, with DNS fully configured for `dukesprofessionalcleaningservices.com`. This rebuild will **not** get its own Netlify site.

**Plan:**
1. Build and verify this Astro rewrite locally — `npm run dev` for development, `npm run build` + `npm run preview` to check the production build (including link checks, since this is a common regression when migrating page structure).
2. Once verified, go into the existing production Netlify site's settings and repoint its linked Git repository from the current repo to this new Astro repo (Site configuration → linked repository, or equivalent — exact current wording in Netlify's dashboard not independently confirmed).
3. This preserves the domain, DNS, and SSL certificate already in place — only the source repo changes.

**Build settings:**
- Build command: `astro build` (or `npm run build`)
- Publish directory: `dist/`
- Node version: `>=22.12.0` — set via a `.nvmrc` file or a `NODE_VERSION` environment variable on Netlify if the build image doesn't pick it up automatically

**`netlify.toml`:** not yet created. Recommended before the repo swap, to lock in build config and any redirects the current site relies on:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

More info at ["Deploying an existing Astro Git repository"](https://www.netlify.com/blog/how-to-deploy-astro/#deploy-an-existing-git-repository-to-netlify) on Netlify's blog.

TODO: check whether the current live site has a `_redirects` file or `netlify.toml` redirects (old URL slugs, etc.) that need to be replicated here if this rebuild changes any page URLs.

---

## Schema.org structured data

`BaseLayout.astro` now includes a `LocalBusiness`/`ProfessionalService`/`CleaningService` JSON-LD block (Tier 2, per the `jsonld-schema` skill's tiering) rendered via `set:html={JSON.stringify(schema)}`. Reviewed and fixed for: a missing script tag (schema was built but never rendered), an invalid non-numeric `Offer.price`, a contradictory weekend `openingHoursSpecification` entry, missing/incorrect `og:image` and `twitter:image`, and a broken favicon reference. Geo coordinates are intentionally city-level (home-based business, no public storefront).

---

## Common tasks

**Add a new page:**
1. Create `src/pages/<name>.astro`
2. That's it — Astro's file-based routing picks it up automatically (no manual entry-point registration needed, unlike a vanilla Vite multipage config)

**Add a new layout or component:**
1. Create it under `src/layouts/` or a new `src/components/` directory
2. Import and use it in a page's frontmatter (`---` block)

**Update global styles:**
TODO — depends on how `src/styles/` gets structured.

**Update environment variables (once introduced):**
1. Add to `.env.example` (no real value)
2. Add to local `.env` (with value) — never commit this file
3. Add to Netlify dashboard for production

---

## Notes

- `astro.config.mjs` already sets `site: "https://dukesprofessionalcleaningservices.com/"`, which Astro uses for canonical URLs and sitemap generation once a sitemap integration is added.
- Default page title/description currently lives as a hardcoded fallback in `BaseLayout.astro`'s `Props` — worth revisiting once each page supplies its own real title/description.
- This document will be updated section by section as pages, JS features, and the deployment swap actually happen — not written speculatively ahead of the code.
