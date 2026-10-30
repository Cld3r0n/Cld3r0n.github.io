/* Bloques de HTML compartidos por la web clásica y la oficina. */
window.UI = (function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /* resalta lo pendiente (✏️) para que se vea al momento */
  const txt = s => esc(s).replace(/✏️([^,.;:()·\n]*)/g, '<mark class="todo">✏️$1</mark>');
  const ESTADO = { 'En producción': 'ok', 'Publicado': 'ok', 'Entregado': 'ok', 'En curso': 'run', 'En desarrollo': 'run', 'En diseño': 'plan' };
  const ICON = { servidores: '🖥️', puesto: '🎯', automatizacion: '🤖', formacion: '🎓' };
  const LV = { 3: 'Lo uso a diario', 2: 'Lo manejo', 1: 'Aprendiendo' };

  const chip = e => '<span class="chip chip-' + (ESTADO[e] || 'plan') + '"><i></i>' + esc(e) + '</span>';
  const safeUrl = u => /^(https?:|mailto:|assets\/|\.\/|#)/i.test(u || '') ? u : '#';

  function project(p) {
    return '<article class="pcard' + (p.borrador ? ' is-draft' : '') + '" data-cat="' + esc(p.categoria) + '">' +
      '<header class="pc-head"><span class="pc-cat">' + (ICON[p.zona] || '📁') + ' ' + esc(p.categoria) + '</span>' + chip(p.estado) + '</header>' +
      '<h3>' + txt(p.titulo) + '</h3>' +
      '<p class="pc-sum">' + txt(p.resumen) + '</p>' +
      (p.puntos && p.puntos.length ? '<ul class="pc-list">' + p.puntos.map(x => '<li>' + txt(x) + '</li>').join('') + '</ul>' : '') +
      (p.roadmap && p.roadmap.length ? '<div class="pc-road"><span class="pc-road-t">Hoja de ruta · ' + p.roadmap.filter(r => r[1]).length + '/' + p.roadmap.length + ' hecho</span><ul>' + p.roadmap.map(r => '<li class="' + (r[1] ? 'done' : '') + '">' + txt(r[0]) + '</li>').join('') + '</ul></div>' : '') +
      (p.siguiente ? '<p class="pc-next"><span>next →</span> ' + txt(p.siguiente) + '</p>' : '') +
      (p.tech && p.tech.length ? '<div class="tags">' + p.tech.map(x => '<span class="tag">' + esc(x) + '</span>').join('') + '</div>' : '') +
      (p.enlaces && p.enlaces.length ? '<div class="pc-links">' + p.enlaces.map(l => '<a class="lnk" href="' + esc(safeUrl(l.u)) + '" target="_blank" rel="noopener">' + esc(l.t) + ' ↗</a>').join('') + '</div>' : '') +
      '</article>';
  }

  function skills(D) {
    return '<div class="skills">' + D.skills.map(g =>
      '<div class="sk-group"><h3>' + esc(g.grupo) + '</h3><ul>' + g.items.map(([n, l]) =>
        '<li><span class="sk-name">' + esc(n) + '</span><span class="lvl lvl-' + l + '" title="' + LV[l] + '"><span class="pips"><i></i><i></i><i></i></span><em>' + LV[l] + '</em></span></li>'
      ).join('') + '</ul></div>').join('') + '</div>';
  }

  function formacion(D) {
    const tl = (arr, f) => '<ol class="tl">' + arr.map(f).join('') + '</ol>';
    let h = '<h3 class="sub">Formación</h3>' + tl(D.formacion, f =>
      '<li><span class="tl-date">' + txt(f.fechas) + '</span><strong>' + txt(f.titulo) + '</strong><span class="tl-org">' + txt(f.centro) + '</span>' + (f.detalle ? '<p>' + txt(f.detalle) + '</p>' : '') + '</li>');
    if (D.experiencia && D.experiencia.length) h += '<h3 class="sub">Experiencia</h3>' + tl(D.experiencia, e =>
      '<li><span class="tl-date">' + txt(e.fechas) + '</span><strong>' + txt(e.puesto) + '</strong><span class="tl-org">' + txt(e.empresa) + '</span>' + (e.detalle ? '<p>' + txt(e.detalle) + '</p>' : '') + '</li>');
    if (D.certificaciones && D.certificaciones.length) h += '<h3 class="sub">Certificaciones</h3><ul class="certs">' + D.certificaciones.map(c =>
      '<li><span class="seal">✓</span><div><strong>' + txt(c.titulo) + '</strong><span>' + txt(c.entidad) + ' · ' + txt(c.fecha) + '</span></div></li>').join('') + '</ul>';
    return h;
  }

  function sobreMi(D) {
    return '<div class="about">' + D.sobreMi.map(p => '<p>' + txt(p) + '</p>').join('') +
      '<dl class="facts">' + D.datos.map(d => '<div><dt>' + esc(d.k) + '</dt><dd>' + txt(d.v) + '</dd></div>').join('') + '</dl>' +
      (D.softSkills && D.softSkills.length ? '<div class="soft"><span>Soft skills</span><div class="tags">' + D.softSkills.map(x => '<span class="tag">' + esc(x) + '</span>').join('') + '</div></div>' : '') + '</div>';
  }

  function contacto(D) {
    const c = D.contacto;
    const clean = u => u.replace(/^https?:\/\/(www\.)?/, '');
    return '<ul class="contact">' +
      '<li><span class="ct-k">✉️ Email</span><code class="ct-v" id="ctEmail">' + txt(c.email) + '</code><button class="btn btn-sm" type="button" data-copy="' + esc(c.email) + '">Copiar</button></li>' +
      '<li><span class="ct-k">🐙 GitHub</span><a class="ct-v" href="' + esc(safeUrl(c.github)) + '" target="_blank" rel="noopener">' + txt(clean(c.github)) + ' ↗</a></li>' +
      '<li><span class="ct-k">💼 LinkedIn</span><a class="ct-v" href="' + esc(safeUrl(c.linkedin)) + '" target="_blank" rel="noopener">' + txt(clean(c.linkedin)) + ' ↗</a></li>' +
      '<li><span class="ct-k">📄 CV</span><a class="ct-v" href="' + esc(safeUrl(D.cvPdf)) + '" target="_blank" rel="noopener">Abrir CV en PDF ↗</a></li>' +
      '</ul>';
  }

  function wire(root) {
    root.querySelectorAll('[data-copy]').forEach(b => {
      b.addEventListener('click', () => {
        const v = b.getAttribute('data-copy'), done = () => { b.textContent = '¡Copiado!'; setTimeout(() => b.textContent = 'Copiar', 1600); };
        const fallback = () => { const el = b.previousElementSibling; if (!el) return; const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Seleccionado'; };
        try { navigator.clipboard.writeText(v).then(done, fallback); } catch (e) { fallback(); }
      });
    });
  }

  return { esc, txt, chip, project, skills, formacion, sobreMi, contacto, wire, LV };
})();
