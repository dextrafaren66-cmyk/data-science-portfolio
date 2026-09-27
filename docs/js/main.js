/* Renders every section of index.html from PORTFOLIO_DATA (js/data.js).
   Project case studies open in a modal; deep link with index.html#project=<id>. */

const CV = D.site.cvUrl;

/* ---------- small builders ---------- */
function eyebrow(text) {
  return `<p class="eyebrow">${esc(text)}</p>`;
}
function sectionHead(label, title, id) {
  return `<header class="section-head">${eyebrow(label)}<h2 class="section-title"${id ? ` id="${id}"` : ""}>${esc(title)}</h2></header>`;
}
function ext(href) {
  return /^https?:/.test(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
}
/* Content fields can be a string, an array (bullets) or { text, bullets }. */
function rich(v) {
  if (!v) return "";
  if (Array.isArray(v)) return `<ul class="bullets">${v.map((b) => `<li>${md(b)}</li>`).join("")}</ul>`;
  if (typeof v === "object") return `${v.text ? `<p>${md(v.text)}</p>` : ""}${v.bullets ? rich(v.bullets) : ""}`;
  return `<p>${md(v)}</p>`;
}
function socialIcons(cls = "social") {
  const items = [
    ["github", "GitHub", LINKS.github],
    ["linkedin", "LinkedIn", LINKS.linkedin],
    ["mail", "Email", LINKS.email],
  ].filter(([, , href]) => href);
  return `<ul class="${cls}">${items
    .map(([ic, label, href]) => `<li><a href="${esc(href)}" aria-label="${label}"${ext(href)}>${icon(ic)}</a></li>`)
    .join("")}</ul>`;
}
/* The CV button falls back to GitHub while no CV file is configured. */
function cvButton(cls, label = "Download CV") {
  return CV
    ? `<a class="${cls}" href="${esc(CV)}" download>${icon("fileText")}<span>${label}</span></a>`
    : `<a class="${cls}" href="${esc(LINKS.github)}"${ext(LINKS.github)}>${icon("github")}<span>View GitHub</span></a>`;
}

/* ---------- nav ---------- */
function renderNav() {
  const links = [
    ["#about", "About"], ["#skills", "Skills"], ["#projects", "Projects"],
    ["#experience", "Experience"], ["#contact", "Contact"],
  ];
  const resume = CV
    ? `<a class="nav-cta" href="${esc(CV)}" download>Resume CV</a>`
    : `<a class="nav-cta" href="${esc(LINKS.github)}"${ext(LINKS.github)}>GitHub</a>`;
  $("#site-nav").innerHTML = `
    <div class="nav-inner container">
      <a class="brand" href="#top"><span class="brand-dot" aria-hidden="true"></span>${esc(D.site.name)}<span class="brand-role">/ ${esc(D.site.role)}</span></a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Open menu">
        <span></span><span></span>
      </button>
      <ul class="nav-links" id="nav-links">
        ${links.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}
        <li>${resume}</li>
      </ul>
    </div>`;
  const nav = $("#site-nav");
  const btn = $(".nav-toggle", nav);
  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  btn.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  nav.querySelectorAll(".nav-links a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); btn.focus(); }
  });
}

/* ---------- hero ---------- */
function renderHero() {
  const s = D.site;
  $("#hero").innerHTML = `
    <canvas class="hero-canvas" aria-hidden="true"></canvas>
    <div class="hero-content container">
      <h1 class="hero-name">${esc(s.name)}</h1>
      <p class="hero-role">${esc(s.role)}</p>
      <p class="hero-tagline">${md(s.tagline)}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#projects"><span>View Projects</span>${icon("chevronRight")}</a>
        ${cvButton("btn btn-secondary")}
      </div>
      ${socialIcons("social hero-social")}
    </div>`;
  initHeroCanvas($(".hero-canvas"));
}

/* Drifting network of points: a quiet nod to graphs and neural nets.
   Static when the visitor prefers reduced motion; paused off-screen. */
function initHeroCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w = 0, h = 0, nodes = [], raf = 0, visible = true;

  function setup() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const box = canvas.parentElement.getBoundingClientRect();
    w = box.width; h = box.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = w < 640 ? 22 : 40;
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const d = Math.hypot(dx, dy);
        if (d < 150) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(41,151,255,${0.15 * (1 - d / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function step() {
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    draw();
    raf = requestAnimationFrame(step);
  }
  function start() { if (!reduce && visible && !raf && !document.hidden) raf = requestAnimationFrame(step); }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  setup(); draw(); start();
  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => { stop(); setup(); draw(); start(); }, 150);
  });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(canvas);
  }
}

/* ---------- about + skills ---------- */
function renderAbout() {
  const a = D.about;
  $("#about").innerHTML = `
    <div class="container split">
      <div class="about-copy reveal">
        ${eyebrow("About Me")}
        <h2 class="section-title sm">${esc(a.heading)}</h2>
        ${a.paragraphs.map((p) => `<p class="muted">${md(p)}</p>`).join("")}
        <dl class="highlights">
          ${a.highlights.map((h) => `<div><dt>${esc(h.label)}</dt><dd>${esc(h.value)}</dd></div>`).join("")}
        </dl>
      </div>
      <div id="skills" class="skills reveal">
        ${eyebrow("Technical Stack")}
        <h2 class="visually-hidden">Skills</h2>
        <div class="skill-grid">
          ${D.skills.map((s) => `
            <div class="skill-card">
              <h3 class="skill-title">${icon(s.icon || "sparkles", "icon icon-accent")}${esc(s.category)}</h3>
              ${chips(s.items)}
            </div>`).join("")}
        </div>
      </div>
    </div>`;
}

/* ---------- projects ---------- */
function renderProjects() {
  const cards = D.projects.map((p) => `
    <article class="project-card reveal">
      <p class="card-eyebrow">${esc(p.category)}</p>
      <h3 class="card-title"><a class="stretched" href="#project=${encodeURIComponent(p.id)}" data-project="${esc(p.id)}">${esc(p.title)}</a></h3>
      <p class="card-desc">${md(p.description)}</p>
      ${chips(p.tech.slice(0, 5), "chip mono")}
      <div class="card-foot">
        <p class="card-metric"><strong>${esc(p.metric.value)}</strong> ${esc(p.metric.label)}</p>
        <span class="read-more" aria-hidden="true">Read More ${icon("chevronRight")}</span>
      </div>
    </article>`).join("");

  const other = (D.otherProjects || []).map((o) => `
    <li class="other-item">
      <div>
        <h4>${esc(o.title)}</h4>
        <p>${md(o.description)}</p>
      </div>
      <div class="other-links">
        ${o.demo ? `<a class="btn btn-small btn-primary" href="${esc(o.demo)}"${ext(o.demo)}>${icon("external")}<span>Live site</span></a>` : ""}
        ${o.folder ? `<a class="btn btn-small btn-ghost" href="${esc(LINKS.folder(o.folder))}"${ext(LINKS.github)}>${icon("github")}<span>Code</span></a>` : ""}
      </div>
    </li>`).join("");

  $("#projects").innerHTML = `
    <div class="container">
      ${sectionHead("Portfolio", "Featured Work.")}
      <div class="project-grid">${cards}</div>
      ${other ? `<div class="other reveal">${eyebrow("Other work")}<ul class="other-list">${other}</ul></div>` : ""}
    </div>`;

  $("#projects").addEventListener("click", (e) => {
    const a = e.target.closest("[data-project]");
    if (!a) return;
    e.preventDefault();
    openProject(a.dataset.project, a);
  });
}

/* ---------- project modal ---------- */
const modal = { el: null, lastFocus: null, scrollY: 0 };

function box(title, ic, value) {
  if (!value) return "";
  return `<div class="panel box"><h4 class="box-title">${icon(ic)}${esc(title)}</h4>${rich(value)}</div>`;
}
function note(label, value, accent = false) {
  if (!value) return "";
  return `<div class="note${accent ? " note-accent" : ""}"><p class="note-label">${esc(label)}</p>${rich(value)}</div>`;
}

function projectBody(p) {
  const s = p.sections || {};
  const boxes = [
    box("Preprocessing", "filter", s.preprocessing),
    box("EDA", "eye", s.eda),
    box("Methodology", "brain", s.methodology || p.methodology),
    box("Model Setup", "terminal", s.model),
    box("Evaluation Metrics", "gauge", s.metrics),
  ].filter(Boolean).join("");
  const figs = (p.figures || []).map((f) => `
    <figure class="figure">
      <a href="${esc(f.src)}" target="_blank" rel="noopener"><img src="${esc(f.src)}" alt="${esc(f.caption)}" loading="lazy"></a>
      <figcaption>${esc(f.caption)}</figcaption>
    </figure>`).join("");
  return `
    ${s.overview ? `<p class="lead">${md(s.overview)}</p>` : ""}
    <div class="two-col">
      <div><h4 class="label">Problem Statement</h4>${rich(s.problem || p.problem)}</div>
      <div><h4 class="label">Dataset</h4>${rich(s.dataset)}</div>
    </div>
    <div class="panel chart-panel">
      <div class="chart-head">
        <h4 class="label">Evaluation Metric Visualizer</h4>
        <p class="headline-metric"><span>${esc(p.metric.value)}</span> ${esc(p.metric.label)}</p>
      </div>
      ${barChart(p.chart)}
    </div>
    <div class="box-grid">${boxes}</div>
    <div class="notes">
      ${note("Result", s.results, true)}
      ${note("Key Insight", s.insights)}
      ${note("Challenges", s.challenges)}
      ${note("Future Improvements", s.future)}
    </div>
    ${figs ? `<div><h4 class="label">Figures</h4><div class="figures">${figs}</div></div>` : ""}
    <div class="modal-actions">
      <a class="btn btn-ghost" href="${esc(LINKS.folder(p.folder))}" target="_blank" rel="noopener noreferrer">${icon("github")}<span>GitHub Repo</span></a>
      ${p.demo ? `<a class="btn btn-primary" href="${esc(p.demo)}"${ext(p.demo)}>${icon("external")}<span>${esc(p.demoLabel || "Live Demo")}</span></a>` : ""}
    </div>`;
}

function buildModal() {
  const el = document.createElement("div");
  el.className = "modal";
  el.hidden = true;
  el.innerHTML = `
    <div class="modal-backdrop" data-close></div>
    <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">
      <header class="modal-head">
        <div>
          <p class="modal-eyebrow"></p>
          <h3 class="modal-title" id="modal-title"></h3>
        </div>
        <button class="icon-btn" type="button" data-close aria-label="Close project details">${icon("x")}</button>
      </header>
      <div class="modal-body"></div>
    </div>`;
  document.body.appendChild(el);
  el.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeProject(); });
  el.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); closeProject(); return; }
    if (e.key !== "Tab") return;
    const f = [...el.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')].filter((n) => n.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  modal.el = el;
}

function setInert(on) {
  ["#site-nav", "#main", "#site-footer", ".skip-link"].forEach((sel) => {
    const n = $(sel);
    if (n) on ? n.setAttribute("inert", "") : n.removeAttribute("inert");
  });
}

function openProject(id, trigger) {
  const p = D.projects.find((x) => x.id === id);
  if (!p) return;
  if (!modal.el) buildModal();
  const el = modal.el;
  $(".modal-eyebrow", el).textContent = p.category;
  $(".modal-title", el).textContent = p.title;
  $(".modal-body", el).innerHTML = projectBody(p);
  $(".modal-dialog", el).scrollTop = 0;
  if (el.hidden) {
    modal.lastFocus = trigger || document.activeElement;
    modal.scrollY = window.scrollY;
    document.documentElement.classList.add("modal-open");
    el.hidden = false;
    setInert(true);
    requestAnimationFrame(() => el.classList.add("is-visible"));
  }
  if (location.hash !== `#project=${id}`) history.replaceState(null, "", `#project=${encodeURIComponent(id)}`);
  $(".icon-btn", el).focus({ preventScroll: true });
}

function closeProject() {
  const el = modal.el;
  if (!el || el.hidden) return;
  el.classList.remove("is-visible");
  el.hidden = true;
  setInert(false);
  document.documentElement.classList.remove("modal-open");
  history.replaceState(null, "", location.pathname + location.search);
  window.scrollTo({ top: modal.scrollY, behavior: "instant" });
  if (modal.lastFocus && document.contains(modal.lastFocus)) modal.lastFocus.focus({ preventScroll: true });
}

function syncHash() {
  const m = location.hash.match(/^#project=(.+)$/);
  if (m) {
    const id = decodeURIComponent(m[1]);
    if (!modal.el || modal.el.hidden) $("#projects").scrollIntoView({ behavior: "instant" });
    openProject(id, $(`[data-project="${CSS.escape(id)}"]`));
  } else if (modal.el && !modal.el.hidden) closeProject();
}

/* ---------- experience ---------- */
function renderExperience() {
  $("#experience").innerHTML = `
    <div class="container narrow">
      ${sectionHead("Experience", "Projects & Activities.")}
      <ol class="timeline">
        ${D.experience.map((x) => `
          <li class="tl-item reveal">
            <span class="tl-dot" aria-hidden="true"></span>
            <div class="tl-head">
              <h3 class="tl-role">${esc(x.role)}</h3>
              <span class="tl-date">${esc(x.date)}</span>
            </div>
            <p class="tl-org">${esc(x.organization)}${x.type ? ` <span class="tl-type">${esc(x.type)}</span>` : ""}</p>
            <p class="muted">${md(x.description)}</p>
            ${x.responsibilities?.length || x.achievements?.length ? `
              <ul class="bullets">
                ${(x.responsibilities || []).map((r) => `<li>${md(r)}</li>`).join("")}
                ${(x.achievements || []).map((r) => `<li class="win">${md(r)}</li>`).join("")}
              </ul>` : ""}
          </li>`).join("")}
      </ol>
    </div>`;
}

/* ---------- education + certifications ---------- */
function renderEducation() {
  const ed = D.education.map((e) => `
    <div class="card edu-card">
      <h3 class="edu-school">${esc(e.school)}</h3>
      <p class="edu-program">${esc(e.program)}</p>
      <p class="mono-meta">${esc(e.date)}${e.location ? ` · ${esc(e.location)}` : ""}</p>
      ${e.achievements?.length ? rich(e.achievements) : ""}
      ${D.certifications?.length && e.coursework?.length ? `<p class="label">Relevant coursework</p>${chips(e.coursework)}` : ""}
    </div>`).join("");

  let right;
  if (D.certifications?.length) {
    right = `
      <header class="section-head">${eyebrow("Credentials")}<h2 class="section-title sm">Certifications.</h2></header>
      <ul class="cert-list">
        ${D.certifications.map((c) => `
          <li class="card cert">
            <span class="cert-icon">${icon("award", "icon icon-accent")}</span>
            <div>
              <h3>${c.url ? `<a class="stretched" href="${esc(c.url)}"${ext(c.url)}>${esc(c.name)}</a>` : esc(c.name)}</h3>
              <p>${esc([c.issuer, c.date].filter(Boolean).join(" • "))}</p>
            </div>
          </li>`).join("")}
      </ul>`;
  } else {
    const cw = D.education[0]?.coursework || [];
    right = `
      <header class="section-head">${eyebrow("Coursework")}<h2 class="section-title sm">Relevant Classes.</h2></header>
      <div class="card">${chips(cw)}</div>`;
  }

  $("#education").innerHTML = `
    <div class="container split">
      <div class="reveal">
        <header class="section-head">${eyebrow("Education")}<h2 class="section-title sm">Academic Path.</h2></header>
        ${ed}
      </div>
      <div class="reveal">${right}</div>
    </div>`;
}

/* ---------- contact ---------- */
function renderContact() {
  $("#contact").innerHTML = `
    <div class="container narrow split">
      <div class="contact-copy reveal">
        ${sectionHead("Connect", "Get in touch.")}
        <p class="muted">I'm looking for a data science or machine learning internship. Got a role, a project, or just a question about something here? I'd be glad to hear from you.</p>
        ${cvButton("btn btn-secondary", "Download Full Resume")}
        ${socialIcons("social social-boxed")}
      </div>
      <div class="card form-card reveal">
        <form class="contact-form" novalidate>
          <div class="field"><label for="cf-name">Name</label><input id="cf-name" name="name" type="text" autocomplete="name" required></div>
          <div class="field"><label for="cf-email">Email</label><input id="cf-email" name="email" type="email" autocomplete="email" required></div>
          <div class="field"><label for="cf-msg">Message</label><textarea id="cf-msg" name="message" rows="4" required></textarea></div>
          <button class="btn btn-primary btn-block" type="submit">${icon("send")}<span>Send Message</span></button>
          <p class="form-status" role="status" aria-live="polite"></p>
        </form>
      </div>
    </div>`;

  const form = $(".contact-form");
  const status = $(".form-status", form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll("input, textarea")];
    let ok = true;
    fields.forEach((f) => {
      const bad = !f.value.trim() || (f.type === "email" && !f.checkValidity());
      f.setAttribute("aria-invalid", String(bad));
      if (bad && ok) { f.focus(); ok = false; }
    });
    if (!ok) { status.textContent = "Please fill in every field with a valid email address."; status.className = "form-status is-error"; return; }

    const data = Object.fromEntries(new FormData(form));
    if (D.site.formEndpoint) {
      status.textContent = "Sending…"; status.className = "form-status";
      try {
        const r = await fetch(D.site.formEndpoint, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) });
        if (!r.ok) throw new Error(r.status);
        form.reset();
        status.textContent = "Thanks! Your message was sent."; status.className = "form-status is-ok";
      } catch {
        status.textContent = "Sorry, that didn't go through. Please email me directly."; status.className = "form-status is-error";
      }
    } else if (D.links.email) {
      const body = `${data.message}\n\nFrom: ${data.name} (${data.email})`;
      location.href = `mailto:${D.links.email}?subject=${encodeURIComponent("Portfolio enquiry from " + data.name)}&body=${encodeURIComponent(body)}`;
      status.textContent = "Opening your email app…"; status.className = "form-status is-ok";
    }
  });
}

/* ---------- footer ---------- */
function renderFooter() {
  const links = [["GitHub", LINKS.github], ["LinkedIn", LINKS.linkedin], ["Email", LINKS.email]].filter(([, h]) => h);
  $("#site-footer").innerHTML = `
    <div class="container footer-inner">
      <p class="footer-name">${esc(D.site.name)} <span>· ${esc(D.site.role)}</span></p>
      <ul class="footer-links">${links.map(([t, h]) => `<li><a href="${esc(h)}"${ext(h)}>${t}</a></li>`).join("")}</ul>
      <p>© ${esc(D.site.year)} ${esc(D.site.name)}</p>
    </div>`;
}

/* ---------- scroll reveal ---------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    els.forEach((n) => n.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  els.forEach((n) => io.observe(n));
}

/* ---------- boot ---------- */
renderNav();
renderHero();
renderAbout();
renderProjects();
renderExperience();
renderEducation();
renderContact();
renderFooter();
initReveal();
window.addEventListener("hashchange", syncHash);
if (location.hash.startsWith("#project=")) syncHash();
