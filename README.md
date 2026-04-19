# CBE QA – Playwright monitor + demo QA workflow

This repository is a **small, presenter-friendly QA sample**: a local **React + Vite** app, **Vitest** unit tests with **coverage**, **Playwright** (external CBE site checks **and** a stable local smoke test), and **GitHub Actions**.

---

## Local demo app (React + Vite)

The sample UI lives under `src/`. It is intentionally tiny: a hero plus one “bank-style” summary card so you can explain components and selectors in a few minutes.

```bash
cd cbe-qa-playwright
yarn install
yarn dev
```

Open the URL Vite prints (by default **http://127.0.0.1:5173**).  
Production-style bundle: `yarn build` then `yarn preview`.

---

## Unit tests (Vitest)

- **`yarn test`** — all unit tests, including **one intentional failing file** for red-build demos (`tests/unit/formatCurrency.demo-intentional-failure.test.ts`).
- **`yarn test:ci`** / **`yarn test:unit`** — same suite **without** that file (green for day-to-day work and CI).
- **`tests/unit/formatCurrency.test.ts`** — USD helper in `src/utils/formatCurrency.ts`.
- **`src/lib/utils.test.ts`** — helpers under `src/lib/`.

```bash
yarn test               # all Vitest tests (includes intentional failure)
yarn test:ci            # Vitest without the demo failure file
yarn test:unit:watch    # watch mode while developing
```

---

## Code coverage

Coverage uses **Vitest + v8**. The console run prints a table; **HTML** is written under **`coverage/`** (open `coverage/index.html` in a browser).

```bash
yarn test:coverage
```

---

## Playwright

| What | Command | Config |
|------|---------|--------|
| **External regression** (01–03 suites) | `yarn test:external` | `playwright.config.ts` — `baseURL` `https://combanketh.et` |
| **Live presentation** (2 simple tests on the public site) | `yarn test:e2e` | `playwright.live-demo.config.ts` — Chromium only, `workers: 1`, default **slowMo 400ms** |
| **Local Vite app smoke** | `yarn test:demo` | `playwright.demo.config.ts` — starts `yarn dev`, runs `tests/demo/smoke.spec.ts` |

Install browsers once (or after Playwright upgrades):

```bash
yarn install
npx playwright install chromium
```

**Headed live demo (audience can follow the cursor):**

```bash
npx playwright test tests/demo.spec.ts -c playwright.live-demo.config.ts --headed --workers=1
# optional: PLAYWRIGHT_DEMO_SLOW_MO=400 (default) or 0 to turn slowMo off
```

Other useful commands: `yarn test:headed` (full external + headed), `yarn test:debug`, `yarn report`, `yarn report:demo`.

Vitest files under `tests/unit/` are **ignored** by the default Playwright config so they are never mistaken for E2E tests.

---

## What the external suites do

| Suite | File | What it checks |
|-------|------|----------------|
| Availability | `01-availability.spec.ts` | `/home` loads (HTTP status under 400), body visible, title set, full-page screenshot |
| Public smoke | `02-navigation.spec.ts` | `navigation` landmark (or first link), meaningful body text, one relative link GET succeeds |
| Visual capture | `03-visual.spec.ts` | Viewport screenshot artifact (no pixel baseline) |
| **Live demo (public)** | `tests/demo.spec.ts` | Home loads + one nav click (`yarn test:e2e`) |
| **Demo smoke (local app)** | `tests/demo/smoke.spec.ts` | Local app: heading + summary card (`yarn test:demo`) |

The **scheduled** workflow still targets the live site. **CI** (see below) runs Vitest + coverage + **demo smoke only**, so PR checks do not depend on the bank site being up.

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_ORG/cbe-qa-playwright.git
cd cbe-qa-playwright
yarn install
npx playwright install chromium
```

### 2. Run checks locally

```bash
yarn typecheck
yarn test:ci
yarn test:coverage
yarn test:demo        # local Vite smoke
yarn test:external    # external site suites (needs network)
yarn test:e2e         # live-site demo spec (Chromium, 1 worker in config)
```

One-shot sanity (everything that does not need the live bank URL):

```bash
yarn verify:local
```

---

## Recording new tests with codegen

Playwright can **watch your browser actions and generate test code automatically**.

```bash
yarn codegen
```

This opens a browser pointed at **`https://combanketh.et/home`**.  
Copy generated steps into a new file under `tests/` and commit.

---

## Visual capture (external)

`03-visual.spec.ts` saves a **viewport PNG** under `screenshots/` for human review. It does **not** use stored pixel baselines (those were brittle across machines and site changes).

---

## GitHub Actions

Two workflows complement each other:

| Workflow | File | When it runs | What it does |
|----------|------|----------------|--------------|
| **CI (demo pipeline)** | `.github/workflows/ci.yml` | Push / PR to `main` or `master` | `yarn install` → **`yarn typecheck`** → **Vitest + coverage** → **Playwright demo smoke** (local Vite app). Includes a **placeholder** “notify on failure” step for you to replace with email or chat later. |
| **Daily QA monitor** | `.github/workflows/daily-monitor.yml` | Schedule + manual | External Playwright suites against the public site, artifacts, optional SMTP email. |

### CI artifacts

On CI, optional artifacts upload **HTML coverage** and (on failure) the **Playwright demo** HTML report.

### Daily monitor — viewing results

- **Job summary** on the run page: totals, table, failed tests.
- **Full HTML report:** download `playwright-report-*` and open `index.html`.

### Daily monitor — email report (optional)

Add repository secrets under **Settings → Secrets and variables → Actions**:

| Secret | Required | Description |
|--------|----------|-------------|
| `MAIL_TO` | Yes | Comma-separated recipient email(s). If set, the workflow sends an email after each run. |
| `SMTP_SERVER` | Yes* | SMTP server (e.g. `smtp.gmail.com`). |
| `SMTP_PORT` | No | Port (default `587`). Use `465` for TLS. |
| `SMTP_USERNAME` | Yes* | SMTP login. |
| `SMTP_PASSWORD` | Yes* | SMTP password (or app password for Gmail). |
| `SMTP_SECURE` | No | Set to `false` to disable TLS (default is true for port 465). |
| `MAIL_FROM` | No | Sender; falls back to `SMTP_USERNAME` if unset. |

\* Required when `MAIL_TO` is set.

### Failure notifications

- **GitHub** emails you when a workflow fails (account settings).
- **CI placeholder:** edit the “Notify on failure (placeholder)” step in `ci.yml` when you add SMTP or Slack.

---

## Updating the external target URL

Change `baseURL` in `playwright.config.ts` and, if the bank’s main path changes, update `homePath` in `tests/site.ts`:

```ts
use: {
  baseURL: 'https://combanketh.et',
  ...
}
```

---

## Adding new tests

1. Create e.g. `tests/04-my-new-suite.spec.ts` (external) or extend `tests/demo/` (local smoke).
2. Use codegen or write tests manually.
3. Push to `main` — scheduled runs pick up external suites; CI picks up unit + demo tests automatically.

```ts
import { test, expect } from '@playwright/test';

test('my new test', async ({ page }) => {
  await page.goto('/some-page');
  await expect(page.locator('h1')).toBeVisible();
});
```
