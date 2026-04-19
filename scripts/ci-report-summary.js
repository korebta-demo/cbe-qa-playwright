#!/usr/bin/env node
/**
 * Generates a color-coded Markdown summary for GitHub Actions from Playwright JUnit results.
 * Writes to GITHUB_STEP_SUMMARY and optionally to a file for email body.
 * Uses only Node built-ins (no extra deps).
 */

const fs = require('fs');
const path = require('path');

const JUNIT_PATH = path.join(process.cwd(), 'results', 'junit.xml');
const SUMMARY_ENV = 'GITHUB_STEP_SUMMARY';
const OUT_BODY_PATH = path.join(process.cwd(), 'results', 'email-body.html');

function parseJunit(xmlPath) {
  if (!fs.existsSync(xmlPath)) {
    return { tests: 0, failures: 0, errors: 0, time: 0, suites: [], failedCases: [] };
  }
  const content = fs.readFileSync(xmlPath, 'utf8');

  const rootMatch = content.match(/testsuites[^>]*tests="(\d+)"[^>]*failures="(\d+)"[^>]*errors="(\d+)"[^>]*time="([\d.]+)"/)
    || content.match(/testsuites[^>]*tests="(\d+)"[^>]*failures="(\d+)"/);
  const tests = rootMatch ? parseInt(rootMatch[1], 10) : 0;
  const failures = rootMatch ? parseInt(rootMatch[2], 10) : 0;
  const errors = rootMatch && rootMatch[3] !== undefined ? parseInt(rootMatch[3], 10) : 0;
  const time = rootMatch && rootMatch[4] !== undefined ? parseFloat(rootMatch[4]) : 0;

  const suites = [];
  const suiteRegex = /<testsuite[^>]*name="([^"]*)"[^>]*tests="(\d+)"[^>]*failures="(\d+)"[^>]*errors="(\d+)"[^>]*time="([\d.]+)"/g;
  let m;
  while ((m = suiteRegex.exec(content)) !== null) {
    suites.push({
      name: m[1],
      tests: parseInt(m[2], 10),
      failures: parseInt(m[3], 10),
      errors: parseInt(m[4], 10),
      time: parseFloat(m[5]),
    });
  }

  const failedCases = [];
  const caseBlockRegex = /<testcase[^>]*name="([^"]*)"[^>]*classname="([^"]*)"[^>]*>[\s\S]*?<failure[^>]*message="([^"]*)"[^>]*>([\s\S]*?)<\/failure>/g;
  while ((m = caseBlockRegex.exec(content)) !== null) {
    failedCases.push({
      name: m[1],
      classname: m[2].replace(/\s*$/, '').split('.').slice(0, -1).join('.') || m[2],
      message: (m[3] || m[4].trim().slice(0, 200)).replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    });
  }

  return { tests, failures, errors, time, suites, failedCases };
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function markdownSummary(data, runUrl, runNumber, suiteLabel) {
  const { tests, failures, errors, time, suites, failedCases } = data;
  const passed = tests - failures - errors;
  const isPass = failures === 0 && errors === 0;

  const statusBadge = isPass
    ? '🟢 **PASSED**'
    : '🔴 **FAILED**';
  const statusEmoji = isPass ? '✅' : '❌';

  let md = '';
  md += `## ${statusEmoji} Playwright QA Report\n\n`;
  md += `**Status:** ${statusBadge}  \n`;
  md += `**Suite:** ${suiteLabel}  \n`;
  md += `**Total:** ${tests} tests  \n`;
  md += `**Passed:** ${passed}  \n`;
  if (failures + errors > 0) {
    md += `**Failed:** ${failures + errors}  \n`;
  }
  md += `**Duration:** ${time.toFixed(1)}s  \n\n`;

  if (runUrl) {
    md += `[View workflow run](${runUrl})  \n\n`;
  }

  if (suites.length > 0) {
    md += `### Features / Suites\n\n`;
    md += `| Feature (suite) | Tests | Passed | Failed | Time |\n`;
    md += `|-----------------|-------|--------|--------|------|\n`;
    for (const s of suites) {
      const sPassed = s.tests - s.failures - s.errors;
      const failCell = s.failures + s.errors > 0 ? `**${s.failures + s.errors}**` : '0';
      const safeName = s.name.replace(/\|/g, '\\|').replace(/\n/g, ' ');
      md += `| ${safeName} | ${s.tests} | ${sPassed} | ${failCell} | ${s.time.toFixed(1)}s |\n`;
    }
    md += '\n';
  }

  if (failedCases.length > 0) {
    md += `### Failed tests\n\n`;
    for (const c of failedCases) {
      const safeMsg = c.message.replace(/`/g, "'").slice(0, 300) + (c.message.length > 300 ? '…' : '');
      const safeClass = c.classname.replace(/`/g, "'");
      md += `- **${c.name.replace(/\*/g, '\\*')}** (\`${safeClass}\`)\n`;
      md += `  - \`${safeMsg}\`\n`;
    }
    md += '\n';
  }

  md += `---\n`;
  md += `📥 **Full report:** Download the \`playwright-report-${runNumber || 'N'}\` artifact for the HTML report (screenshots, traces, videos).\n`;

  return md;
}

function htmlEmailBody(data, runUrl, runNumber, suiteLabel) {
  const { tests, failures, errors, time, suites, failedCases } = data;
  const passed = tests - failures - errors;
  const isPass = failures === 0 && errors === 0;

  let html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Playwright QA Report</title></head><body style="font-family: system-ui, sans-serif; max-width: 720px; margin: 0 auto; padding: 16px;">';
  html += `<h1 style="color: ${isPass ? '#0a0' : '#c00'}">${isPass ? '✅ Passed' : '❌ Failed'} – Playwright QA</h1>`;
  html += `<p><strong>Suite:</strong> ${escapeHtml(suiteLabel)}</p>`;
  html += `<p><strong>Total:</strong> ${tests} tests &nbsp;|&nbsp; <strong>Passed:</strong> ${passed} &nbsp;|&nbsp; <strong>Failed:</strong> ${failures + errors} &nbsp;|&nbsp; <strong>Duration:</strong> ${time.toFixed(1)}s</p>`;
  if (runUrl) {
    html += `<p><a href="${escapeHtml(runUrl)}">View workflow run &amp; download HTML report</a></p>`;
  }
  if (suites.length > 0) {
    html += '<h2>Features / Suites</h2><table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%">';
    html += '<thead><tr><th>Feature</th><th>Tests</th><th>Passed</th><th>Failed</th><th>Time</th></tr></thead><tbody>';
    for (const s of suites) {
      const sPassed = s.tests - s.failures - s.errors;
      html += `<tr><td>${escapeHtml(s.name)}</td><td>${s.tests}</td><td>${sPassed}</td><td>${s.failures + s.errors}</td><td>${s.time.toFixed(1)}s</td></tr>`;
    }
    html += '</tbody></table>';
  }
  if (failedCases.length > 0) {
    html += '<h2>Failed tests</h2><ul>';
    for (const c of failedCases) {
      html += `<li><strong>${escapeHtml(c.name)}</strong> (<code>${escapeHtml(c.classname)}</code>)<br><small>${c.message.slice(0, 400)}</small></li>`;
    }
    html += '</ul>';
  }
  html += '<p><small>Download the playwright-report artifact for the full HTML report with screenshots and traces.</small></p>';
  html += '</body></html>';
  return html;
}

function main() {
  const runUrl = process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : '';
  const runNumber = process.env.GITHUB_RUN_NUMBER || '';
  const suiteInput = process.env.SUITE_LABEL || 'all';

  const data = parseJunit(JUNIT_PATH);
  const md = markdownSummary(data, runUrl, runNumber, suiteInput);
  const html = htmlEmailBody(data, runUrl, runNumber, suiteInput);

  const summaryPath = process.env[SUMMARY_ENV];
  if (summaryPath) {
    fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
    fs.writeFileSync(summaryPath, md, 'utf8');
  } else {
    // When not in CI, write markdown to results/summary.md so you can view the job-summary style report locally
    fs.mkdirSync(path.dirname(OUT_BODY_PATH), { recursive: true });
    fs.writeFileSync(path.join(process.cwd(), 'results', 'summary.md'), md, 'utf8');
  }

  fs.mkdirSync(path.dirname(OUT_BODY_PATH), { recursive: true });
  fs.writeFileSync(OUT_BODY_PATH, html, 'utf8');
}

main();
