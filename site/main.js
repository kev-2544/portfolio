// Renders the home page (index.html) and the project detail page (project.html)
// from projects.js, experience.js and profile.js. Content lives in those files;
// nothing here should need editing to add or change a project.
(function () {
  const projects = window.PROJECTS || [];
  const experience = window.EXPERIENCE || [];
  const categories = window.PROJECT_CATEGORIES || {};
  const profile = window.PROFILE || {};
  const page = document.body.dataset.page;

  // ---------------------------------------------------------------- helpers
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Only allow http(s), mailto and relative URLs into href/src attributes.
  const safeUrl = (u) => {
    const s = String(u || '').trim();
    if (!s) return '';
    if (/^(https?:|mailto:)/i.test(s)) return s;
    if (/^[a-z][a-z0-9+.-]*:/i.test(s) || s.startsWith('//')) return '';
    return s;
  };

  const $ = (sel) => document.querySelector(sel);
  const list = (v) => (Array.isArray(v) ? v : v ? [v] : []);
  const categoryLabel = (key) => categories[key] || key || '';
  const detailUrl = (p) => `project.html?id=${encodeURIComponent(p.id)}`;

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmtMonth = (ym) => {
    const m = /^(\d{4})-(\d{2})/.exec(ym || '');
    return m ? `${MONTHS[+m[2] - 1]} ${m[1]}` : '';
  };

  const STATUS = { completed: 'Completed', 'in-progress': 'In progress', archived: 'Archived' };
  const statusBadge = (p) =>
    STATUS[p.status] ? `<span class="status status-${esc(p.status)}">${STATUS[p.status]}</span>` : '';

  const ext = (href, label, cls = '') =>
    safeUrl(href) ? `<a class="${cls}" href="${esc(safeUrl(href))}" target="_blank" rel="noopener">${label} <span aria-hidden="true">↗</span></a>` : '';

  const tags = (items, max) => {
    const all = list(items);
    const shown = max ? all.slice(0, max) : all;
    if (!shown.length) return '';
    const more = all.length - shown.length;
    return `<ul class="tags" aria-label="Technologies">${shown.map((t) => `<li>${esc(t)}</li>`).join('')}${
      more > 0 ? `<li class="tag-more">+${more}</li>` : ''
    }</ul>`;
  };

  // Placeholder used when a project has no screenshot, or an image fails to load:
  // the repository path and the first few technologies, in a terminal style.
  const thumbPlaceholder = (p) => {
    const repo = (/github\.com\/([^?#]+)/.exec(p.repo || '') || [])[1] || p.id;
    const stack = list(p.stack).slice(0, 3).join(' · ').toLowerCase();
    return `<div class="thumb-placeholder" aria-hidden="true"><span>${esc(categoryLabel(p.category))}</span><strong>${esc(
      repo.replace(/\/$/, '')
    )}</strong>${stack ? `<code>${esc(stack)}</code>` : ''}</div>`;
  };

  const thumb = (p) => {
    const s = list(p.screenshots)[0];
    const src = s && safeUrl(s.src);
    return `<div class="thumb">${
      src
        ? `<img src="${esc(src)}" alt="" loading="lazy" decoding="async" data-fallback="placeholder">${thumbPlaceholder(p)}`
        : thumbPlaceholder(p)
    }</div>`;
  };

  // Missing images: hide the broken <img> (cards fall back to the placeholder
  // behind it; galleries drop the figure).
  document.addEventListener(
    'error',
    (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement)) return;
      if (img.dataset.fallback === 'placeholder') img.remove();
      else if (img.dataset.fallback === 'figure') {
        const fig = img.closest('figure');
        const gallery = img.closest('.gallery');
        if (fig) fig.remove();
        if (gallery && !gallery.querySelector('figure')) gallery.closest('section')?.remove();
      }
    },
    true
  );

  // ---------------------------------------------------------------- shared UI
  function initChrome() {
    // Theme toggle (dark by default; choice remembered)
    const root = document.documentElement;
    const toggle = $('#themeToggle');
    const syncToggle = () =>
      toggle?.setAttribute('aria-label', root.dataset.theme === 'light' ? 'Use dark theme' : 'Use light theme');
    syncToggle();
    toggle?.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
      syncToggle();
    });

    // Mobile menu
    const menuBtn = $('#menuToggle');
    const nav = $('#siteNav');
    const setMenu = (open) => {
      menuBtn?.setAttribute('aria-expanded', String(open));
      nav?.classList.toggle('open', open);
    };
    menuBtn?.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    nav?.addEventListener('click', (e) => e.target.closest('a') && setMenu(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn?.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuBtn.focus();
      }
    });

    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();

    document.querySelectorAll('[data-github]').forEach((a) => (a.href = safeUrl(profile.github) || a.href));
  }

  // Subtle fade-in on scroll. Skipped entirely for reduced-motion users.
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        }),
      { rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
  }

  // ---------------------------------------------------------------- home page
  function renderHome() {
    // Featured
    const featured = projects.filter((p) => p.featured);
    const featuredEl = $('#featured');
    featuredEl.innerHTML = featured
      .map(
        (p) => `
        <article class="feature reveal">
          <a class="feature-media" href="${detailUrl(p)}" tabindex="-1" aria-hidden="true">${thumb(p)}</a>
          <div class="feature-body">
            <p class="kicker">${esc(p.subtitle || categoryLabel(p.category))}</p>
            <h3><a href="${detailUrl(p)}">${esc(p.title)}</a></h3>
            <p>${esc(p.summary)}</p>
            ${tags(p.stack, 6)}
            <div class="links">
              <a href="${detailUrl(p)}">Case study <span aria-hidden="true">→</span></a>
              ${ext(p.repo, 'Code')}
              ${ext(p.live, 'Live demo')}
            </div>
          </div>
        </article>`
      )
      .join('');
    if (!featured.length) $('#work').hidden = true;

    // Filters: built from the categories actually used by projects
    const used = Object.keys(categories).filter((k) => projects.some((p) => p.category === k));
    projects.forEach((p) => p.category && !used.includes(p.category) && used.push(p.category));
    const filters = $('#filters');
    filters.innerHTML = [['all', 'All'], ...used.map((k) => [k, categoryLabel(k)])]
      .map(
        ([key, label]) =>
          `<button type="button" class="chip" data-filter="${esc(key)}" aria-pressed="false">${esc(label)} <span class="chip-count">${
            key === 'all' ? projects.length : projects.filter((p) => p.category === key).length
          }</span></button>`
      )
      .join('');

    const grid = $('#grid');
    const status = $('#gridStatus');
    function render(filter) {
      const shown = projects.filter((p) => filter === 'all' || p.category === filter);
      grid.innerHTML = shown
        .map(
          (p) => `
          <article class="card">
            <a class="card-media" href="${detailUrl(p)}" tabindex="-1" aria-hidden="true">${thumb(p)}</a>
            <div class="card-body">
              <p class="card-meta">${esc(categoryLabel(p.category))}${p.date ? ` · ${esc(p.date.slice(0, 4))}` : ''} ${statusBadge(p)}</p>
              <h3><a href="${detailUrl(p)}">${esc(p.title)}</a></h3>
              <p>${esc(p.summary)}</p>
              ${tags(p.stack, 4)}
              <div class="links">
                <a href="${detailUrl(p)}">Details <span aria-hidden="true">→</span></a>
                ${ext(p.repo, 'Code')}
                ${ext(p.live, 'Live')}
              </div>
            </div>
          </article>`
        )
        .join('');
      filters.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === filter)));
      status.textContent = `Showing ${shown.length} of ${projects.length} projects${
        filter === 'all' ? '' : ` in ${categoryLabel(filter)}`
      }.`;
    }

    filters.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      render(btn.dataset.filter);
      const url = new URL(window.location.href);
      if (btn.dataset.filter === 'all') url.searchParams.delete('category');
      else url.searchParams.set('category', btn.dataset.filter);
      history.replaceState(null, '', url);
    });
    const initial = new URLSearchParams(window.location.search).get('category');
    render(initial && used.includes(initial) ? initial : 'all');

    renderExperience();
    renderTimeline();
    renderCv();
    renderContact();
  }

  function renderExperience() {
    const block = $('#workHistory');
    const jobs = experience
      .filter((j) => j && j.title && j.organization)
      .sort((a, b) => String(b.start || '').localeCompare(String(a.start || '')));
    if (!jobs.length) {
      block.hidden = true;
      $('#experience').classList.add('no-history');
      return;
    }
    $('#jobs').innerHTML = jobs
      .map((j) => {
        const range = [fmtMonth(j.start), j.end ? fmtMonth(j.end) : 'Present'].filter(Boolean).join(' – ');
        const org = safeUrl(j.url)
          ? `<a href="${esc(safeUrl(j.url))}" target="_blank" rel="noopener">${esc(j.organization)}</a>`
          : esc(j.organization);
        const meta = [j.location, j.type].filter(Boolean).map(esc).join(' · ');
        return `
        <li class="tl-item reveal">
          <p class="tl-date">${esc(range)}</p>
          <h4>${esc(j.title)} <span class="tl-org">· ${org}</span></h4>
          ${meta ? `<p class="tl-meta">${meta}</p>` : ''}
          ${j.description ? `<p>${esc(j.description)}</p>` : ''}
          ${list(j.achievements).length ? `<ul class="points">${list(j.achievements).map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
          ${tags(j.stack)}
        </li>`;
      })
      .join('');
  }

  function renderTimeline() {
    const dated = projects.filter((p) => /^\d{4}-\d{2}/.test(p.date || '')).sort((a, b) => b.date.localeCompare(a.date));
    if (!dated.length) {
      $('#projectTimeline').hidden = true;
      return;
    }
    const years = [...new Set(dated.map((p) => p.date.slice(0, 4)))];
    $('#timeline').innerHTML = years
      .map(
        (y) => `
        <li class="tl-year reveal">
          <h4 class="tl-year-label">${y}</h4>
          <ul class="tl-rows">
            ${dated
              .filter((p) => p.date.startsWith(y))
              .map(
                (p) => `
                <li>
                  <span class="tl-month">${esc(MONTHS[+p.date.slice(5, 7) - 1] || '')}</span>
                  <a href="${detailUrl(p)}">${esc(p.title)}</a>
                  <span class="tl-cat">${esc(categoryLabel(p.category))}</span>
                </li>`
              )
              .join('')}
          </ul>
        </li>`
      )
      .join('');
  }

  function renderCv() {
    const cv = safeUrl(profile.cv);
    const el = $('#cvActions');
    if (cv) {
      el.innerHTML = `
        <a class="btn btn-primary" href="${esc(cv)}" download>Download CV (PDF)</a>
        <a class="btn" href="${esc(cv)}" target="_blank" rel="noopener">Open in browser <span aria-hidden="true">↗</span></a>
        ${profile.cvUpdated ? `<p class="cv-note">${esc(profile.cvUpdated)}</p>` : ''}`;
    } else {
      el.innerHTML = `<p class="cv-note">A PDF copy of my CV is available on request. <a href="#contact">Get in touch</a>.</p>`;
    }
  }

  function renderContact() {
    const email = String(profile.email || '').trim();
    const items = [
      email && /^[^\s@]+@[^\s@]+$/.test(email)
        ? `<a class="btn btn-primary" href="mailto:${esc(email)}">Email ${esc(email)}</a>`
        : '',
      ext(profile.github, 'GitHub', 'btn' + (email ? '' : ' btn-primary')),
      ext(profile.linkedin, 'LinkedIn', 'btn'),
    ].filter(Boolean);
    $('#contactActions').innerHTML = items.join('');
  }

  // ---------------------------------------------------------------- project page
  function renderProject() {
    const id = new URLSearchParams(window.location.search).get('id');
    const idx = projects.findIndex((p) => p.id === id);
    const root = $('#project');

    if (idx === -1) {
      document.title = 'Project not found · Kevin Manoti';
      root.innerHTML = `
        <section class="wrap not-found">
          <p class="kicker">404</p>
          <h1>Project not found</h1>
          <p>There is no project with the ID <code>${esc(id || '(none)')}</code>.</p>
          <a class="btn btn-primary" href="index.html#projects">Browse all projects</a>
        </section>`;
      return;
    }

    const p = projects[idx];
    const prev = projects[(idx - 1 + projects.length) % projects.length];
    const next = projects[(idx + 1) % projects.length];
    document.title = `${p.title} · Kevin Manoti`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', p.summary || '');

    const shots = list(p.screenshots).filter((s) => s && safeUrl(s.src));
    const section = (title, body) => (body ? `<section class="detail-block reveal"><h2>${title}</h2>${body}</section>` : '');
    const paras = (v) => list(v).map((t) => `<p>${esc(t)}</p>`).join('');
    const bullets = (v) => (list(v).length ? `<ul class="points">${list(v).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '');

    const facts = [
      ['Category', `<a href="index.html?category=${encodeURIComponent(p.category)}#projects">${esc(categoryLabel(p.category))}</a>`],
      p.date && ['Started', esc(fmtMonth(p.date))],
      STATUS[p.status] && ['Status', statusBadge(p)],
    ].filter(Boolean);

    root.innerHTML = `
      <section class="wrap detail-head">
        <a class="back" href="index.html#projects"><span aria-hidden="true">←</span> All projects</a>
        <p class="kicker">${esc(p.subtitle || categoryLabel(p.category))}</p>
        <h1>${esc(p.title)} ${statusBadge(p)}</h1>
        <p class="lede">${esc(p.summary)}</p>
        <div class="cta">
          ${ext(p.repo, 'View code on GitHub', 'btn btn-primary')}
          ${ext(p.live, 'Live demo', 'btn')}
        </div>
      </section>

      ${
        shots.length
          ? `<section class="wrap gallery-wrap" aria-label="Screenshots">
              <div class="gallery gallery-${Math.min(shots.length, 3)}">
                ${shots
                  .slice(0, 3)
                  .map(
                    (s) => `
                    <figure>
                      <a href="${esc(safeUrl(s.src))}" target="_blank" rel="noopener" aria-label="Open full-size image: ${esc(s.caption || s.alt || p.title)}">
                        <img src="${esc(safeUrl(s.src))}" alt="${esc(s.alt || '')}" loading="lazy" decoding="async" data-fallback="figure">
                      </a>
                      ${s.caption ? `<figcaption>${esc(s.caption)}</figcaption>` : ''}
                    </figure>`
                  )
                  .join('')}
              </div>
            </section>`
          : ''
      }

      <div class="wrap detail-grid">
        <div class="detail-main">
          ${section('Overview', paras(p.description))}
          ${section('Problem', paras(p.problem))}
          ${section('Solution', paras(p.solution))}
          ${section('Implementation', bullets(p.implementation))}
          ${section('Results', bullets(p.results))}
        </div>
        <aside class="detail-aside" aria-label="Project facts">
          <dl class="facts">
            ${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
          </dl>
          ${list(p.stack).length ? `<h2 class="aside-title">Stack</h2>${tags(p.stack)}` : ''}
          <div class="links links-stack">
            ${ext(p.repo, 'Repository')}
            ${ext(p.live, 'Live demo')}
          </div>
        </aside>
      </div>

      ${
        projects.length > 1
          ? `<nav class="wrap pager" aria-label="More projects">
              <a href="${detailUrl(prev)}"><span class="pager-label"><span aria-hidden="true">←</span> Previous</span>${esc(prev.title)}</a>
              <a class="pager-next" href="${detailUrl(next)}"><span class="pager-label">Next <span aria-hidden="true">→</span></span>${esc(next.title)}</a>
            </nav>`
          : ''
      }`;
  }

  initChrome();
  if (page === 'home') renderHome();
  if (page === 'project') renderProject();
  initReveal();
})();
