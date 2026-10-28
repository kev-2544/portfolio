# Kevin Manoti — portfolio site

A static portfolio in plain HTML, CSS and JavaScript. It has no build step, no
dependencies, no backend and no database. All content lives in four files:

| File | What it holds |
|---|---|
| `projects.js` | Every project, plus the category list used by the filters |
| `experience.js` | Professional work history (empty until you add roles) |
| `profile.js` | Email, LinkedIn, CV path, location |
| `images/` | Screenshots, one folder per project |

`index.html` (the home page), `project.html` (the template for every project
detail page) and `main.js` (the renderer) read those files. You should not
need to edit them to change content.

Project pages use the URL `project.html?id=<project id>`. GitHub Pages serves
that as an ordinary static file, so no server-side routing or generated pages
are needed.

---

## Preview locally

Opening `index.html` directly works. To match GitHub Pages exactly, serve the folder:

```bash
cd site
python -m http.server 8000
# open http://localhost:8000
```

Before you commit, check the data files (this needs Node, with nothing to install):

```bash
node site/tools/check.js
```

It reports missing required fields, duplicate IDs, bad dates, screenshot files
that don't exist, missing alt text, oversized images and links that would break
under a GitHub Pages subpath. The deploy workflow runs it too and stops the
deploy if it finds errors.

---

## Add a project

1. Open `projects.js` and copy an existing entry inside `window.PROJECTS = [ ... ]`.
2. Give it a **unique `id`**: lowercase letters, numbers and hyphens, e.g. `dbt-jaffle-shop`.
   This becomes the URL `project.html?id=dbt-jaffle-shop`.
3. Fill in the fields. Only `id`, `title`, `category` and `summary` are required.
   Leave any other field out and its section is hidden.

```js
{
  id: 'dbt-jaffle-shop',
  title: 'Jaffle Shop',
  subtitle: 'dbt starter project',        // shown above the title on featured cards
  category: 'data',                        // a key from PROJECT_CATEGORIES
  featured: false,                         // true = also shown in "Featured work"
  status: 'completed',                     // 'completed' | 'in-progress' | 'archived'
  date: '2026-01',                         // YYYY-MM; places it on the timeline
  summary: 'One or two sentences for the card.',
  description: ['Paragraph one.', 'Paragraph two.'],
  stack: ['dbt', 'DuckDB', 'SQL'],
  repo: 'https://github.com/Manoty/Jaffle_shop',
  live: '',                                // optional demo URL
  screenshots: [
    { src: 'images/dbt-jaffle-shop/01-lineage.webp', alt: 'dbt lineage graph from sources to marts', caption: 'Model lineage' },
  ],
  problem: 'What problem it solves.',
  solution: 'The approach.',
  implementation: ['Notable technical detail', 'Another one'],
  results: ['Only real, verifiable outcomes'],
},
```

The order in the file is the order on the page. Put your strongest work first.

**Edit a project:** change its fields. **Remove a project:** delete its `{ ... },` block.

**Add a filter category:** add a key to `window.PROJECT_CATEGORIES`,
e.g. `ml: 'Machine learning'`, and set `category: 'ml'` on a project. A filter
button appears only for categories that at least one project uses.

## Add screenshots

1. Create a folder named after the project ID: `site/images/<id>/`.
2. Add two or three images, named in display order: `01-overview.webp`, `02-detail.webp`, …
3. Reference them in the project's `screenshots` array. Use paths relative to
   `site/` with **no leading slash** (`images/<id>/01-overview.webp`, not
   `/images/...`). A leading slash breaks on GitHub Pages.
4. Write `alt` text that says what the image shows, for screen-reader users, and a
   short `caption`.

Keep images fast to load:

- Use 1200 px wide at most, saved as **WebP** (or JPEG) at quality 75–80.
  Aim for under 300 KB each. The check script warns above 400 KB.
- Free tools: [Squoosh](https://squoosh.app) in the browser, or
  `cwebp -q 78 -resize 1200 0 in.png -o out.webp`.

The first screenshot becomes the card thumbnail. If a project has none, the card
shows a styled placeholder with the repository name. If an image file is missing,
it is hidden and the page still works.

Only use screenshots of the real running project.

## Add professional experience

Open `experience.js` and add an entry inside `window.EXPERIENCE = [ ... ]`:

```js
{
  title: 'Analytics Engineer',
  organization: 'Company name',
  url: 'https://company.example',   // optional
  location: 'Nairobi, Kenya',
  type: 'Full-time',                 // Full-time, Contract, Freelance, Internship…
  start: '2025-01',                  // YYYY-MM
  end: null,                         // YYYY-MM, or null for "Present"
  description: 'One short paragraph.',
  responsibilities: ['What the role involved'],
  achievements: ['A measurable outcome you can back up'],   // optional
  stack: ['dbt', 'SQL', 'Python'],
},
```

Entries are sorted newest first. Leave out `location` or `type` to hide them.
While the list is empty, the "Professional experience" column is hidden and only
the "Selected personal projects" timeline (built from each project's `date`) is shown.

## Education and certifications

These live in `experience.js` too, below the roles:

```js
window.EDUCATION = [
  { degree: 'Bachelor of Science in …', institution: 'University name', year: '2025' },
];

window.CERTIFICATIONS = [
  { name: 'Certificate name', issuer: 'Issuer', year: '2024', url: 'https://…' },  // url optional
];
```

Add a `url` only for a credential link you have checked. An empty list hides its column.

## Update the CV

1. Save your CV as a PDF, e.g. `Kevin-Manoti-CV.pdf`.
2. Put it in `site/cv/` (create the folder if it doesn't exist).
3. In `profile.js`, set:

   ```js
   cv: 'cv/Kevin-Manoti-CV.pdf',
   cvUpdated: 'Updated October 2026',
   ```

To replace the CV later, overwrite the PDF with the same filename. While `cv`
is empty, the CV section shows "available on request" instead of a broken link.

## Contact details

In `profile.js`, set `email` and `linkedin`. Empty values are hidden, and the
contact section always shows GitHub.

---

## Publish on GitHub Pages (free)

This folder (`profile/`) holds the site in `site/` and a deploy workflow in
`.github/workflows/pages.yml`. The workflow checks the data files, then
publishes only `site/`. GitHub Pages is free for public repositories.

1. On GitHub, create a new **public** repository with no README.
   - Name it `Manoty.github.io` to serve the site at **https://manoty.github.io/**
   - Or give it any other name, e.g. `portfolio`, to serve it at
     **https://manoty.github.io/portfolio/**

2. From the `profile/` folder, push it:

   ```bash
   cd profile
   git init -b main
   git add .
   git commit -m "Add static portfolio site"
   git remote add origin https://github.com/Manoty/<repo-name>.git
   git push -u origin main
   ```

3. On GitHub, open **Settings → Pages**. Under **Build and deployment → Source**,
   choose **GitHub Actions**.
4. Open the **Actions** tab. The *Deploy portfolio to GitHub Pages* run starts on
   every push to `main` that changes `site/`. If the first run failed because
   Pages wasn't enabled yet, open the run and choose **Re-run jobs**, or
   start it by hand with **Run workflow**.
5. When the run is green, the site is live at the address from step 1.

To update the site later, edit the files, commit, push, and wait about a minute.

All links in the site are relative, so it works at either address without changes.
