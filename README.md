# CBE QA – Playwright Monitor

Automated daily test suite for the CBE external website using Playwright and GitHub Actions.

---

## What This Does

| Suite | File | What it checks |
|-------|------|----------------|
| Availability | `01-availability.spec.ts` | Site loads, no broken images, response time < 5s, Internet Banking link present |
| Navigation | `02-navigation.spec.ts` | Nav menu visible, links not broken, footer present, portal reachable |
| Visual | `03-visual.spec.ts` | Screenshot comparisons against saved baseline |

Tests run automatically every day at **08:00 Addis Ababa time** via GitHub Actions.  
You can also trigger a run manually from the **Actions** tab in GitHub.

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_ORG/cbe-qa-playwright.git
cd cbe-qa-playwright
npm install
npx playwright install chromium
```

### 2. Run tests locally

```bash
# Run all tests
npm test

# Run with browser visible
npm run test:headed

# Run a specific suite
npx playwright test tests/01-availability.spec.ts

# Debug a test step by step
npm run test:debug

# Open the HTML report after a run
npm run report
```

---

## Recording New Tests with Codegen

Playwright can **watch your browser actions and generate test code automatically**.

```bash
npm run codegen
```

This opens a browser pointed at `https://www.combanketh.et`.  
Everything you click, type, and navigate generates code in the panel on the right.  
Copy that code into a new file under `tests/` and commit it.

---

## Visual Snapshot Tests

Visual tests compare screenshots against a saved baseline.

**First run — create the baselines:**
```bash
npx playwright test tests/03-visual.spec.ts --update-snapshots
```
Commit the generated files in `tests/__snapshots__/`.

**After an intentional redesign — update baselines:**
```bash
npx playwright test --update-snapshots
```

---

## GitHub Actions

### Scheduled daily run
The workflow runs automatically at 06:00 UTC (08:00 EAT) every day.  
See `.github/workflows/daily-monitor.yml`.

### Manual run
Go to **Actions → Daily QA Monitor → Run workflow** in GitHub.  
You can choose to run all suites or a specific one.

### Viewing results
After each run, go to the **Actions** tab and open the run.  
Download the `playwright-report-*` artifact and open `index.html` for a full visual report.

### Failure notifications
**GitHub email:** Enabled by default — GitHub emails you when a workflow fails.

**Slack:** Add your webhook URL as a repository secret:
1. Go to **Settings → Secrets and variables → Actions**
2. Add secret: `SLACK_WEBHOOK_URL` = your Slack incoming webhook URL

---

## Updating the Target URL

Change `baseURL` in `playwright.config.ts`:

```ts
use: {
  baseURL: 'https://www.combanketh.et',
  ...
}
```

---

## Adding New Tests

1. Create a new file: `tests/04-my-new-suite.spec.ts`
2. Use the codegen tool or write tests manually
3. Push to `main` — the next scheduled run picks them up automatically

```ts
import { test, expect } from '@playwright/test';

test('my new test', async ({ page }) => {
  await page.goto('/some-page');
  await expect(page.locator('h1')).toBeVisible();
});
```
