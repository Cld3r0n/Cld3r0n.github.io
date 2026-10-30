/* Web clásica: pinta todo desde data.js y anima el avatar de la portada. */
(function () {
  'use strict';
  const D = window.PORTFOLIO, AV = window.AVATAR, UI = window.UI;
  const $ = s => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('#nombre').textContent = D.nombre;
  $('#estado').textContent = D.estado;
  $('#rol').textContent = D.rol;
  $('#claim').textContent = D.claim;
  $('#cvBtn').href = D.cvPdf;
  $('#copy').textContent = '© ' + new Date().getFullYear() + ' ' + D.nombre;

  $('#stats').innerHTML = D.destacados.map(d => '<div><b>' + UI.esc(d.n) + '</b><span>' + UI.esc(d.t) + '</span></div>').join('');
  $('#sobreMi').innerHTML = UI.sobreMi(D);
  $('#skillsBox').innerHTML = UI.skills(D) + '<p class="hint" style="text-align:left;margin-top:14px">Niveles: ' + Object.keys(UI.LV).sort().reverse().map(k => UI.LV[k]).join(' · ') + '</p>';
  $('#formacionBox').innerHTML = UI.formacion(D);
  $('#contactoBox').innerHTML = UI.contacto(D);
  UI.wire($('#contactoBox'));

  /* proyectos con filtro por categoría */
  const grid = $('#gridProjects'), fil = $('#filters');
  const cats = ['Todos'].concat([...new Set(D.proyectos.map(p => p.categoria))]);
  let cur = 'Todos';
  function renderProjects() {
    grid.innerHTML = D.proyectos.filter(p => cur === 'Todos' || p.categoria === cur).map(p => UI.project(p)).join('');
    fil.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cat === cur)));
  }
  fil.innerHTML = cats.map(c => '<button type="button" data-cat="' + UI.esc(c) + '">' + UI.esc(c) + '</button>').join('');
  fil.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { cur = b.dataset.cat; renderProjects(); } });
  renderProjects();

  /* ---------- avatar de la portada ---------- */
  const cv = $('#heroFace'), S = 360, SC = Math.min(2, Math.max(1, devicePixelRatio || 1));
  cv.width = S * SC; cv.height = S * SC;
  const q = cv.getContext('2d');
  const bubble = $('#heroSpeech');
  const lines = D.frasesHero && D.frasesHero.length ? D.frasesHero : ['¡Hola! 👋'];
  let li = 0, chars = Array.from(lines[0]), shown = reduce ? chars.length : 0, hold = 0, blinkT = 0, nextBlink = 2500, last = performance.now(), t = 0;

  function setBubble(n) { bubble.innerHTML = UI.esc(chars.slice(0, n).join('')) + '<span class="caret"></span>'; }
  setBubble(shown);

  function draw(talking) {
    q.setTransform(SC, 0, 0, SC, 0, 0); q.clearRect(0, 0, S, S);
    const cx = S / 2, cy = 168;
    /* aro tipo radar */
    const g = q.createRadialGradient(cx, cy + 10, 30, cx, cy + 10, 170);
    g.addColorStop(0, 'rgba(0,229,255,.22)'); g.addColorStop(1, 'rgba(0,229,255,0)');
    q.fillStyle = g; q.fillRect(0, 0, S, S);
    q.save(); q.translate(cx, cy + 10);
    q.strokeStyle = 'rgba(0,229,255,.35)'; q.lineWidth = 1.5; q.setLineDash([6, 8]); q.lineDashOffset = reduce ? 0 : -t * 0.02;
    q.beginPath(); q.arc(0, 0, 150, 0, Math.PI * 2); q.stroke();
    q.setLineDash([]); q.strokeStyle = 'rgba(255,59,212,.4)'; q.beginPath(); q.arc(0, 0, 160, -0.6 + (reduce ? 0 : t * 0.0004), 0.4 + (reduce ? 0 : t * 0.0004)); q.stroke();
    q.restore();
    /* recorte circular para que el torso no salga del aro */
    q.save(); q.beginPath(); q.arc(cx, cy + 10, 149, 0, Math.PI * 2); q.clip();
    const bob = reduce ? 0 : Math.sin(t * 0.002) * 2;
    q.translate(cx, cy + bob); q.scale(1.45, 1.45);
    const mouth = talking ? 0.25 + 0.75 * Math.abs(Math.sin(t * 0.018)) * (0.6 + 0.4 * Math.sin(t * 0.007)) : 0;
    AV.portrait(q, D.avatarGuia, { mouth, blink: blinkT > 0, t: t * 0.06, look: Math.sin(t * 0.0007) * 0.6 });
    q.restore();
  }

  function frame(now) {
    const dt = Math.min(now - last, 60); last = now; t += dt;
    let talking = false;
    if (shown < chars.length) {
      shown += dt * 0.032; talking = true;
      setBubble(Math.min(chars.length, shown | 0));
    } else {
      hold += dt;
      if (hold > 2400 && !reduce) { hold = 0; li = (li + 1) % lines.length; chars = Array.from(lines[li]); shown = 0; }
    }
    nextBlink -= dt;
    if (nextBlink <= 0) { blinkT = 130; nextBlink = 2600 + Math.random() * 2600; }
    if (blinkT > 0) blinkT -= dt;
    draw(talking);
    if (!reduce || shown < chars.length) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
