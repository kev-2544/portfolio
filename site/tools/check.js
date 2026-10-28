#!/usr/bin/env node
// Validates the portfolio data files. No dependencies; run from anywhere:
//   node site/tools/check.js
// Exits with code 1 if any error is found. Warnings do not fail the check.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SITE = path.resolve(__dirname, '..');
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// Load the browser data files into a sandbox that has a fake `window`.
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of ['profile.js', 'projects.js', 'experience.js']) {
  try {
    vm.runInContext(fs.readFileSync(path.join(SITE, f), 'utf8'), sandbox, { filename: f });
  } catch (e) {
    err(`${f}: could not be parsed: ${e.message}`);
  }
}
const { PROJECTS = [], PROJECT_CATEGORIES = {}, EXPERIENCE = [], PROFILE = {} } = sandbox.window;

const YM = /^\d{4}-(0[1-9]|1[0-2])$/;
const isHttp = (u) => /^https?:\/\/\S+$/.test(u);
const localFile = (rel) => fs.existsSync(path.join(SITE, rel));

// ---------------------------------------------------------------- projects
if (!Array.isArray(PROJECTS) || !PROJECTS.length) err('projects.js: window.PROJECTS is empty or not an array');
const ids = new Set();
PROJECTS.forEach((p, i) => {
  const where = `projects.js [${i}] ${p && p.id ? `"${p.id}"` : ''}`.trim();
  if (!p || typeof p !== 'object') return err(`${where}: entry is not an object`);
  for (const k of ['id', 'title', 'category', 'summary']) if (!p[k]) err(`${where}: missing required field "${k}"`);
  if (p.id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id)) err(`${where}: id must be lowercase letters, numbers and hyphens`);
  if (p.id && ids.has(p.id)) err(`${where}: duplicate id`);
  ids.add(p.id);
  if (p.category && !PROJECT_CATEGORIES[p.category]) warn(`${where}: category "${p.category}" is not in PROJECT_CATEGORIES (label will be the raw key)`);
  if (p.status && !['completed', 'in-progress', 'archived'].includes(p.status)) err(`${where}: status must be completed, in-progress or archived`);
  if (p.date && !YM.test(p.date)) err(`${where}: date must be YYYY-MM`);
  if (p.repo && !isHttp(p.repo)) err(`${where}: repo must be an http(s) URL`);
  if (p.live && !isHttp(p.live)) err(`${where}: live must be an http(s) URL`);
  if (p.stack && !Array.isArray(p.stack)) err(`${where}: stack must be an array`);
  for (const k of ['description', 'implementation', 'results']) {
    if (p[k] && !Array.isArray(p[k]) && typeof p[k] !== 'string') err(`${where}: ${k} must be an array or string`);
  }
  if (p.screenshots) {
    if (!Array.isArray(p.screenshots)) return err(`${where}: screenshots must be an array`);
    if (p.screenshots.length > 3) warn(`${where}: only the first 3 screenshots are shown`);
    p.screenshots.forEach((s, j) => {
      if (!s || !s.src) return err(`${where}: screenshot ${j + 1} has no src`);
      if (s.src.startsWith('/')) err(`${where}: screenshot "${s.src}" starts with "/"; use a relative path so it works under a GitHub Pages subpath`);
      else if (!isHttp(s.src) && !localFile(s.src)) err(`${where}: screenshot file not found: site/${s.src}`);
      else if (!isHttp(s.src)) {
        const kb = fs.statSync(path.join(SITE, s.src)).size / 1024;
        if (kb > 400) warn(`${where}: ${s.src} is ${Math.round(kb)} KB; aim for under 300 KB (see README)`);
      }
      if (!s.alt) err(`${where}: screenshot ${j + 1} needs alt text`);
      if (!s.caption) warn(`${where}: screenshot ${j + 1} has no caption`);
    });
  }
});
if (!PROJECTS.some((p) => p.featured)) warn('projects.js: no project has featured: true, so "Featured work" will be hidden');

// ---------------------------------------------------------------- experience
if (!Array.isArray(EXPERIENCE)) err('experience.js: window.EXPERIENCE must be an array');
else {
  if (!EXPERIENCE.length) warn('experience.js: no entries yet; the "Professional experience" block is hidden');
  EXPERIENCE.forEach((j, i) => {
    const where = `experience.js [${i}]`;
    for (const k of ['title', 'organization', 'start']) if (!j[k]) err(`${where}: missing required field "${k}"`);
    if (j.start && !YM.test(j.start)) err(`${where}: start must be YYYY-MM`);
    if (j.end && !YM.test(j.end)) err(`${where}: end must be YYYY-MM or null`);
    if (j.start && j.end && j.end < j.start) err(`${where}: end is before start`);
    if (j.url && !isHttp(j.url)) err(`${where}: url must be an http(s) URL`);
  });
}

// ---------------------------------------------------------------- profile
if (!PROFILE.github) err('profile.js: github is required');
if (PROFILE.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(PROFILE.email)) err('profile.js: email looks invalid');
if (PROFILE.linkedin && !isHttp(PROFILE.linkedin)) err('profile.js: linkedin must be an http(s) URL');
if (PROFILE.cv) {
  if (PROFILE.cv.startsWith('/')) err('profile.js: cv must be a relative path such as cv/Kevin-Manoti-CV.pdf');
  else if (!isHttp(PROFILE.cv) && !localFile(PROFILE.cv)) err(`profile.js: CV file not found: site/${PROFILE.cv}`);
} else warn('profile.js: cv is empty; the CV section shows "available on request"');
if (!PROFILE.email) warn('profile.js: email is empty; contact section shows GitHub only');

// ---------------------------------------------------------------- html
// Root-relative links ("/x") break on a project site served from /<repo>/.
for (const f of ['index.html', 'project.html']) {
  const html = fs.readFileSync(path.join(SITE, f), 'utf8');
  for (const m of html.matchAll(/\s(?:href|src)="(\/[^/"][^"]*)"/g)) err(`${f}: root-relative link "${m[1]}" will break under a GitHub Pages subpath`);
  for (const m of html.matchAll(/\s(?:href|src)="(?!https?:|mailto:|#|data:|\/\/)([^"?#]+)/g)) {
    if (!localFile(m[1])) err(`${f}: linked file not found: ${m[1]}`);
  }
}

// ---------------------------------------------------------------- report
for (const w of warnings) console.log(`warn   ${w}`);
for (const e of errors) console.log(`ERROR  ${e}`);
console.log(`\n${PROJECTS.length} projects, ${EXPERIENCE.length || 0} experience entries: ${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
