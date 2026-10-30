/* Oficina SOC: motor 2D en Canvas, avatar del jugador, guía con tour,
   pathfinding A*, ventanas de zona y terminal interactiva. */
(function () {
  'use strict';
  const D = window.PORTFOLIO, AV = window.AVATAR, UI = window.UI;
  const $ = s => document.querySelector(s);
  const W = 768, H = 544, SC = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('adri-soc:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('adri-soc:' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  };

  const cv = $('#world'); cv.width = W * SC; cv.height = H * SC;
  const main = cv.getContext('2d'); let x = main;

  /* ---------- utilidades de dibujo ---------- */
  const R = (a, b, w, h, f) => { x.fillStyle = f; x.fillRect(a, b, w, h); };
  const lg = (a, b, c2, d, ...cs) => { const g = x.createLinearGradient(a, b, c2, d); cs.forEach((q, i) => g.addColorStop(i / (cs.length - 1), q)); return g; };
  const glow = (a, b, r, col, al) => { const g = x.createRadialGradient(a, b, 0, a, b, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = al == null ? 1 : al; x.fillStyle = g; x.fillRect(a - r, b - r, 2 * r, 2 * r); x.restore(); };
  const rr = (a, b, w, h, r, f) => { x.beginPath(); if (x.roundRect) x.roundRect(a, b, w, h, r); else x.rect(a, b, w, h); x.fillStyle = f; x.fill(); };
  const hit = (a, b, m) => { m = m || 0; return a.x < b.x + b.w + m && a.x + a.w > b.x - m && a.y < b.y + b.h + m && a.y + a.h > b.y - m; };
  const box = (o, t0, t1, f0, f1, rim) => {
    const ty = o.y - o.z;
    x.fillStyle = lg(0, ty, 0, ty + o.h, t0, t1); x.fillRect(o.x, ty, o.w, o.h);
    x.fillStyle = lg(0, ty + o.h, 0, o.y + o.h, f0, f1); x.fillRect(o.x, ty + o.h, o.w, o.z);
    R(o.x, ty, o.w, 2, rim); R(o.x, ty + o.h - 1, o.w, 2, 'rgba(0,0,0,.6)'); R(o.x, ty, 1.5, o.h + o.z, 'rgba(255,255,255,.07)');
  };
  const mk = () => { const o = document.createElement('canvas'); o.width = W * SC; o.height = H * SC; o.getContext('2d').setTransform(SC, 0, 0, SC, 0, 0); return o; };
  let t = 0;

  /* monitor con contenido animado */
  function monitor(mx, my, w, h, col, inner) {
    R(mx + w / 2 - 3, my + h, 6, 8, '#1a2133'); R(mx + w / 2 - 10, my + h + 7, 20, 3, '#1a2133');
    rr(mx - 3, my - 3, w + 6, h + 6, 3, '#05080f'); R(mx, my, w, h, '#02060b');
    x.save(); x.beginPath(); x.rect(mx, my, w, h); x.clip(); inner(mx, my, w, h); x.restore();
    R(mx, my, w, h, lg(mx, my, mx + w, my + h, 'rgba(255,255,255,.09)', 'rgba(255,255,255,0)'));
    glow(mx + w / 2, my + h / 2, w * 0.9, col, 0.35);
  }

  /* ---------- zonas ---------- */
  const ZT = { servidores: 'Home lab · Servidores', puesto: 'Hacking y CTFs', automatizacion: 'Automatización', skills: 'Skills', formacion: 'Formación', terminal: 'Terminal', contacto: 'Contacto', 'sobre-mi': 'Sobre mí' };
  const ZI = { servidores: '🖥️', puesto: '🎯', automatizacion: '🤖', skills: '📊', formacion: '🎓', terminal: '⌨️', contacto: '📡', 'sobre-mi': '🛋️' };
  const ZONAS = Object.keys(ZT);
  const ZSUM = { skills: 'Tecnologías que uso y mi nivel real en cada una.', formacion: 'Carrera, máster, experiencia y trabajos de la universidad.', terminal: 'Terminal interactiva. Escribe "help" para empezar.', contacto: 'Email, GitHub, LinkedIn y CV.', 'sobre-mi': 'Quién soy y qué me mueve.' };
  function zoneSummary(id) {
    if (ZSUM[id]) return ZSUM[id];
    const ps = D.proyectos.filter(p => p.zona === id && !p.borrador);
    return ps.length ? ps.map(p => p.titulo).join(' · ') : (ZSUM[id] || '');
  }

  const E = [];
  const add = (id, o, fn) => { o.id = id; o.fn = fn; o.solid = o.solid !== false; o.up = o.up || 0; E.push(o); return o; };

  /* Sala de servidores: dos filas de racks */
  const rack = o => {
    box(o, '#222d48', '#121a2e', '#18223a', '#0b1120', '#3a4d7a');
    const fy = o.y - o.z + o.h, fh = o.z, n = 5, cw = (o.w - 8) / 3, uh = (fh - 14) / n;
    for (let i = 0; i < 3; i++) {
      const rx = o.x + 4 + i * cw, rw = cw - 6;
      R(rx, fy + 4, rw, fh - 8, '#06090f');
      for (let j = 0; j < n; j++) {
        const uy = fy + 7 + j * uh;
        rr(rx + 2, uy, rw - 4, uh - 2, 2, lg(0, uy, 0, uy + uh, '#1c263e', '#10172a'));
        R(rx + 5, uy + 3, 16, 1.5, '#33466e'); R(rx + 5, uy + 7, 24, 1.5, '#26365a');
        for (let k = 0; k < 3; k++) R(rx + rw - 22 + k * 6, uy + 4, 3, 3, ((t >> (2 + k)) + i * 3 + j * 2 + k) % 7 ? (k === 1 ? '#00e5ff' : '#00ff9c') : '#ff3b6b');
      }
    }
    R(o.x, fy, o.w, 1, 'rgba(0,229,255,.3)');
    glow(o.x + o.w / 2, o.y + o.h + 2, o.w * 0.6, 'rgba(0,229,255,.28)', 0.7);
  };
  add('servidores', { x: 40, y: 150, w: 168, h: 24, z: 64 }, rack);
  add('servidores', { x: 40, y: 262, w: 168, h: 24, z: 64 }, rack);

  /* Puesto de hacking: triple monitor */
  add('puesto', { x: 272, y: 210, w: 176, h: 30, z: 22, up: 50 }, o => {
    box(o, '#232e4a', '#111a2e', '#182139', '#0a0f1c', '#00e5ff');
    const tp = o.y - o.z;
    [[8, -36, 50, 32, '#00ff9c', 'rgba(0,255,156,.5)'], [63, -46, 50, 40, '#00e5ff', 'rgba(0,229,255,.5)'], [118, -36, 50, 32, '#ff3bd4', 'rgba(255,59,212,.5)']].forEach(([a, b, w, h, col, gcol], i) => {
      monitor(o.x + a, tp + b, w, h, gcol, (mx, my, ww) => {
        for (let k = 0; k < 7; k++) R(mx + 4, my + 4 + k * 5.4, 6 + ((k * 7 + i * 13 + (t >> 4)) % (ww - 16)), 2, col);
        if (i === 1) { x.fillStyle = col; x.font = 'bold 7px monospace'; x.fillText('root#', mx + 4, my + h - 4); if ((t >> 5) % 2) R(mx + 30, my + h - 10, 4, 7, col); }
      });
    });
    R(o.x + 50, tp + 8, 76, 9, '#080d18');
    for (let k = 0; k < 16; k++) { x.fillStyle = 'hsl(' + ((t * 2 + k * 22) % 360) + ' 100% 60%)'; x.fillRect(o.x + 53 + k * 4.5, tp + 10, 3, 5); }
    rr(o.x + 146, tp + 4, 8, 13, 2, '#00ff9c'); rr(o.x + 20, tp + 9, 16, 10, 2, '#cfd8dc');
    glow(o.x + 88, o.y + o.h + 2, 90, 'rgba(0,229,255,.2)', 0.6);
  });

  /* Rincón de automatización: chat de Telegram, código y Raspberry Pi */
  add('automatizacion', { x: 520, y: 170, w: 150, h: 28, z: 22, up: 44 }, o => {
    box(o, '#232e4a', '#111a2e', '#182139', '#0a0f1c', '#ff3bd4');
    const tp = o.y - o.z;
    monitor(o.x + 10, tp - 40, 60, 38, 'rgba(0,229,255,.5)', (mx, my, w) => {
      R(mx, my, w, 6, '#0f2a44'); x.fillStyle = '#9fdcff'; x.font = 'bold 5px monospace'; x.fillText('@adri_bot', mx + 3, my + 4.6);
      for (let k = 0; k < 4; k++) { const left = k % 2 === 0, bw = 14 + ((k * 13 + (t >> 6)) % 24); rr(left ? mx + 3 : mx + w - 3 - bw, my + 9 + k * 7, bw, 5, 2, left ? '#1f3b57' : '#0a7d9a'); }
    });
    monitor(o.x + 80, tp - 40, 60, 38, 'rgba(0,255,156,.5)', (mx, my) => {
      const cols = ['#ff3bd4', '#00e5ff', '#e6e6e6', '#ffb300', '#00ff9c', '#e6e6e6'], ind = [0, 4, 4, 8, 4, 0];
      for (let k = 0; k < 6; k++) R(mx + 4 + ind[k], my + 4 + k * 5.5, 10 + ((k * 11 + 7) % 26), 2, cols[(k + (t >> 7)) % 6]);
    });
    rr(o.x + 62, tp + 8, 24, 15, 2, '#0f6b3a'); R(o.x + 69, tp + 11, 9, 9, '#1c1f24');
    R(o.x + 64, tp + 10, 3, 3, (t >> 4) % 2 ? '#ff3b6b' : '#3a0f15'); R(o.x + 81, tp + 10, 3, 3, '#00ff9c');
    rr(o.x + 120, tp + 6, 10, 12, 2, '#d8d8d8'); R(o.x + 122, tp + 8, 6, 3, '#4a2a18');
    glow(o.x + 75, o.y + o.h + 2, 80, 'rgba(255,59,212,.2)', 0.6);
  });

  /* Pantalla gigante de la pared (skills): no bloquea el paso */
  add('skills', { x: 300, y: 100, w: 168, h: 6, z: 0, solid: false, hl: { x: 260, y: 4, w: 248, h: 88 } }, () => {});

  /* Vitrina de formación */
  add('formacion', { x: 40, y: 452, w: 78, h: 24, z: 92 }, o => {
    box(o, '#232e4a', '#121a2e', '#1a2540', '#0b1222', '#3a4d7a');
    const fy = o.y - o.z + o.h;
    R(o.x + 5, fy + 6, o.w - 10, o.z - 12, '#050a14');
    glow(o.x + o.w / 2, fy + o.z / 2, 60, 'rgba(0,229,255,.25)', 0.7);
    for (let r = 0; r < 3; r++) {
      const sy = fy + 12 + r * 25;
      R(o.x + 6, sy + 18, o.w - 12, 2, '#1c2a48');
      if (r === 0) { /* trofeo */
        const cx = o.x + o.w / 2; rr(cx - 7, sy, 14, 10, 4, '#ffb300'); R(cx - 2, sy + 10, 4, 4, '#c98a00'); R(cx - 6, sy + 14, 12, 3, '#c98a00');
        glow(cx, sy + 6, 18, 'rgba(255,179,0,.6)', 0.7);
      } else for (let b = 0; b < 3; b++) {
        const bx = o.x + 10 + b * 20, col = ['#00e5ff', '#ff3bd4', '#00ff9c'][(b + r) % 3];
        rr(bx, sy, 16, 17, 2, '#e8edf5'); R(bx + 2, sy + 3, 12, 1.5, '#9aa6b8'); R(bx + 2, sy + 7, 9, 1.5, '#9aa6b8'); x.beginPath(); x.arc(bx + 11, sy + 12, 3, 0, 7); x.fillStyle = col; x.fill();
      }
    }
    R(o.x, fy, 2, o.z, '#00e5ff'); R(o.x + o.w - 2, fy, 2, o.z, '#00e5ff');
    R(o.x + 5, fy + 6, o.w - 10, o.z - 12, lg(o.x, fy, o.x + o.w, fy + o.z, 'rgba(255,255,255,.08)', 'rgba(255,255,255,0)'));
  });

  /* Terminal tipo recreativa */
  add('terminal', { x: 330, y: 450, w: 64, h: 22, z: 50, up: 34 }, o => {
    const ty = o.y - o.z;
    x.fillStyle = lg(0, ty - 34, 0, o.y + o.h, '#1a2440', '#0a0f1c');
    x.beginPath(); x.moveTo(o.x + 4, ty - 34); x.lineTo(o.x + o.w - 4, ty - 34); x.lineTo(o.x + o.w, ty + 6); x.lineTo(o.x + o.w, o.y + o.h); x.lineTo(o.x, o.y + o.h); x.lineTo(o.x, ty + 6); x.closePath(); x.fill();
    R(o.x + 4, ty - 34, o.w - 8, 10, '#00ff9c'); x.fillStyle = '#022014'; x.font = 'bold 7px monospace'; x.textAlign = 'center'; x.fillText('TERMINAL', o.x + o.w / 2, ty - 26.5); x.textAlign = 'left';
    glow(o.x + o.w / 2, ty - 29, 40, 'rgba(0,255,156,.55)', 0.8);
    R(o.x + 8, ty - 20, o.w - 16, 28, '#02060b');
    x.fillStyle = '#00ff9c'; x.font = '7px monospace'; x.fillText('> help', o.x + 11, ty - 11); x.fillText('> _', o.x + 11, ty - 2);
    if ((t >> 5) % 2) R(o.x + 22, ty - 8, 4, 7, '#00ff9c');
    glow(o.x + o.w / 2, ty - 6, 36, 'rgba(0,255,156,.3)', 0.7);
    R(o.x + 4, ty + 12, o.w - 8, 8, '#0b1222'); for (let k = 0; k < 8; k++) R(o.x + 7 + k * 7, ty + 14, 5, 4, '#26365a');
    R(o.x, ty + 6, 2, o.z + o.h - 6, '#00ff9c');
  });

  /* Mesa de reuniones con holograma (contacto) */
  add('contacto', { x: 540, y: 330, w: 140, h: 56, z: 22, up: 58 }, o => {
    for (let i = 0; i < 3; i++) [o.x - 18, o.x + o.w + 4].forEach((cx, s) => { const cy = o.y + 4 + i * 17; rr(cx, cy, 14, 14, 5, '#141c30'); R(s ? cx + 12 : cx, cy + 1, 2, 12, '#ff3bd4'); });
    box(o, '#142038', '#0a1224', '#101a30', '#070c18', '#ff3bd4');
    const ty = o.y - o.z, cx = o.x + o.w / 2, by = ty + o.h / 2, cy = by - 34;
    x.strokeStyle = 'rgba(255,59,212,.4)'; x.strokeRect(o.x + 6, ty + 5, o.w - 12, o.h - 10);
    x.beginPath(); x.ellipse(cx, by, 24, 8, 0, 0, 7); x.fillStyle = 'rgba(0,229,255,.25)'; x.fill(); x.strokeStyle = '#00e5ff'; x.stroke();
    x.beginPath(); x.moveTo(cx - 22, by); x.lineTo(cx - 12, cy + 16); x.lineTo(cx + 12, cy + 16); x.lineTo(cx + 22, by); x.fillStyle = lg(0, cy, 0, by, 'rgba(0,229,255,0)', 'rgba(0,229,255,.22)'); x.fill();
    const a = t * 0.03, ca = Math.cos(a), sa = Math.sin(a), V = [];
    for (let i = 0; i < 8; i++) { const X = (i & 1 ? 1 : -1) * 13, Y = (i & 2 ? 1 : -1) * 13, Z = (i & 4 ? 1 : -1) * 13; V.push([cx + X * ca - Z * sa, cy + Y * 0.9 + (X * sa + Z * ca) * 0.3]); }
    x.save(); x.strokeStyle = '#00e5ff'; x.lineWidth = 1.5; x.shadowColor = '#00e5ff'; x.shadowBlur = 10; x.beginPath();
    [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([i, j]) => { x.moveTo(V[i][0], V[i][1]); x.lineTo(V[j][0], V[j][1]); });
    x.stroke(); x.restore();
    x.fillStyle = '#ff3bd4'; x.font = 'bold 12px monospace'; x.textAlign = 'center'; x.fillText('@', cx, cy + 4); x.textAlign = 'left';
    glow(cx, cy, 50, 'rgba(0,229,255,.4)', 0.8);
  });

  /* Sofá (sobre mí) */
  add('sobre-mi', { x: 528, y: 478, w: 150, h: 26, z: 28, up: 30 }, o => {
    const ty = o.y - o.z;
    rr(o.x - 6, ty - 12, 12, o.z + 10, 5, '#2a1f4d'); rr(o.x + o.w - 6, ty - 12, 12, o.z + 10, 5, '#2a1f4d');
    rr(o.x, ty - 28, o.w, 30, 8, lg(0, ty - 28, 0, ty, '#3a2c6a', '#2a1f4d'));
    box(o, '#43347a', '#2a1f4d', '#2a1f4d', '#170f33', '#8a6cff');
    for (let i = 1; i < 3; i++) R(o.x + i * 50, ty + 1, 1.5, o.h + o.z - 2, 'rgba(0,0,0,.35)');
    rr(o.x + 14, ty - 6, 22, 14, 4, '#ff3bd4'); rr(o.x + o.w - 40, ty - 6, 22, 14, 4, '#00e5ff');
    R(o.x + 6, o.y + o.h - 2, o.w - 12, 2, '#ff3bd4');
    glow(o.x + o.w / 2, o.y + o.h + 4, 90, 'rgba(255,59,212,.3)', 0.7);
  });

  /* Plantas */
  [[246, 130], [736, 124], [736, 420], [140, 520], [470, 520]].forEach(([a, b]) => add(null, { x: a - 7, y: b, w: 14, h: 8, z: 12, up: 36 }, o => {
    const cx = o.x + 7, by = o.y;
    rr(cx - 9, by - 14, 18, 14, 3, '#10172a'); R(cx - 9, by - 14, 18, 2, '#00e5ff');
    for (let i = 0; i < 7; i++) { x.save(); x.translate(cx, by - 14); x.rotate(-1.3 + i * 0.43 + (reduce ? 0 : Math.sin(t * 0.02 + i) * 0.04)); x.fillStyle = i % 2 ? '#0f7a4a' : '#12a860'; x.beginPath(); x.ellipse(0, -18, 5, 18, 0, 0, 7); x.fill(); x.restore(); }
    glow(cx, by - 20, 30, 'rgba(0,255,156,.25)', 0.6);
  }));

  const zoneById = {}; E.forEach(e => { if (e.id && !zoneById[e.id]) zoneById[e.id] = e; });
  const bbox = e => e.hl || { x: e.x, y: e.y - e.z - e.up, w: e.w, h: e.h + e.z + e.up };

  /* ---------- fondo estático ---------- */
  const PATHS = [[[208, 170], [244, 170], [244, 232], [272, 232]], [[448, 226], [484, 226], [484, 186], [520, 186]], [[208, 282], [262, 282], [262, 430], [362, 430], [362, 450]]];
  const bg = mk(), ovl = mk();
  function sky(w, h) {
    const o = document.createElement('canvas'); o.width = w * SC; o.height = h * SC; const q = o.getContext('2d'); q.scale(SC, SC);
    const g = q.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1a0f3a'); g.addColorStop(1, '#4a1458'); q.fillStyle = g; q.fillRect(0, 0, w, h);
    let bx = 0, seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    while (bx < w) { const bw = 8 + (rnd() * 12 | 0), bh = h * 0.25 + rnd() * h * 0.55; q.fillStyle = '#090717'; q.fillRect(bx, h - bh, bw, bh); for (let wy = h - bh + 4; wy < h - 3; wy += 6) for (let wx = bx + 2; wx < bx + bw - 2; wx += 4) if (rnd() < 0.4) { q.fillStyle = rnd() < 0.5 ? '#ffd75a' : '#00e5ff'; q.fillRect(wx, wy, 2, 3); } bx += bw + 1; }
    return o;
  }
  function build() {
    x = bg.getContext('2d');
    R(0, 0, W, H, lg(0, 96, 0, H, '#0c1222', '#04060d'));
    x.lineWidth = 1; x.strokeStyle = 'rgba(0,229,255,.07)'; x.beginPath();
    for (let i = 0; i <= 24; i++) { x.moveTo(i * 32, 104); x.lineTo(i * 32, H); }
    for (let y = 104; y <= H; y += 32) { x.moveTo(0, y); x.lineTo(W, y); }
    x.stroke();
    glow(384, 330, 360, 'rgba(0,229,255,.08)'); glow(600, 420, 200, 'rgba(255,59,212,.05)');
    /* sala de servidores */
    R(24, 118, 208, 192, 'rgba(0,229,255,.05)'); x.strokeStyle = 'rgba(0,229,255,.5)'; x.strokeRect(24.5, 118.5, 208, 192);
    for (let i = 0; i < 21; i++) R(24 + i * 9.9, 310, 5, 5, i % 2 ? '#ffd200' : '#111');
    x.font = 'bold 10px "IBM Plex Mono", monospace'; x.fillStyle = 'rgba(0,229,255,.6)'; x.fillText('// SALA DE SERVIDORES', 30, 330);
    /* sala de reuniones */
    R(512, 300, 196, 112, 'rgba(255,59,212,.04)'); x.strokeStyle = 'rgba(255,59,212,.5)'; x.strokeRect(512.5, 300.5, 196, 112);
    x.fillStyle = 'rgba(255,59,212,.6)'; x.fillText('// SALA DE REUNIONES', 518, 294);
    /* zona chill */
    rr(506, 430, 204, 104, 12, '#120d29'); x.strokeStyle = 'rgba(138,108,255,.45)'; x.strokeRect(506.5, 430.5, 204, 104);
    /* cables con su canal */
    x.lineCap = 'round'; x.lineJoin = 'round';
    PATHS.forEach(pa => { x.beginPath(); pa.forEach((q, i) => i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1])); x.strokeStyle = 'rgba(0,229,255,.18)'; x.lineWidth = 6; x.stroke(); x.strokeStyle = 'rgba(0,229,255,.55)'; x.lineWidth = 1.5; x.stroke(); });
    /* pared */
    R(0, 0, W, 96, lg(0, 0, 0, 96, '#141e38', '#0a1020'));
    for (let i = 0; i < 10; i++) R(i * 80, 0, 1, 96, 'rgba(0,0,0,.4)');
    R(0, 0, W, 4, lg(0, 0, W, 0, '#00e5ff', '#ff3bd4', '#00e5ff'));
    R(0, 92, W, 12, '#05080f'); R(0, 94, W, 2, '#00e5ff'); glow(384, 95, 380, 'rgba(0,229,255,.2)', 0.5);
    R(0, 104, 14, H, lg(0, 0, 14, 0, '#000', '#0a1020')); R(W - 14, 104, 14, H, lg(W - 14, 0, W, 0, '#0a1020', '#000')); R(0, H - 4, W, 4, 'rgba(0,229,255,.35)');
    const s1 = sky(88, 66);
    [40, 146].forEach(wx => { R(wx - 4, 12, 96, 74, '#05080f'); x.drawImage(s1, wx, 16, 88, 66); R(wx + 42, 16, 2, 66, '#05080f'); x.fillStyle = lg(wx, 16, wx + 88, 82, 'rgba(255,255,255,.14)', 'rgba(255,255,255,0)'); x.fillRect(wx, 16, 88, 66); x.strokeStyle = 'rgba(0,229,255,.55)'; x.strokeRect(wx - 3.5, 12.5, 95, 73); });
    /* marco de la pantalla gigante */
    R(260, 4, 248, 88, '#05080f'); R(264, 8, 240, 80, '#02060b'); x.strokeStyle = '#00e5ff'; x.lineWidth = 2; x.strokeRect(261, 5, 246, 86); glow(384, 48, 170, 'rgba(0,229,255,.16)', 0.8);
    /* letrero neón (fondo) */
    R(560, 18, 180, 54, '#070a14'); x.strokeStyle = 'rgba(255,59,212,.35)'; x.lineWidth = 1; x.strokeRect(560.5, 18.5, 179, 53);
    /* capa superior: líneas de escáner y viñeta */
    x = ovl.getContext('2d');
    for (let y = 0; y < H; y += 3) R(0, y, W, 1, 'rgba(0,0,0,.18)');
    const v = x.createRadialGradient(384, 272, 220, 384, 272, 520); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,10,.6)'); x.fillStyle = v; x.fillRect(0, 0, W, H);
    x = main;
  }

  /* ---------- colisiones y rejilla para A* ---------- */
  const foot = (X, Y) => ({ x: X - 8, y: Y - 6, w: 16, h: 6 });
  const free = (px, py) => px >= 22 && px <= W - 22 && py >= 124 && py <= H - 8 && !E.some(e => e.solid && hit(foot(px, py), e, 2));
  const CS = 16, GW = W / CS, GH = H / CS; let grid;
  function buildGrid() { grid = new Uint8Array(GW * GH); for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) grid[j * GW + i] = free(i * CS + 8, j * CS + 8) ? 0 : 1; }
  const cellOf = (px, py) => [Math.max(0, Math.min(GW - 1, px / CS | 0)), Math.max(0, Math.min(GH - 1, py / CS | 0))];
  function nearestFree(i, j) {
    const seen = new Uint8Array(GW * GH), qu = [[i, j]]; seen[j * GW + i] = 1;
    while (qu.length) { const [a, b] = qu.shift(); if (!grid[b * GW + a]) return [a, b]; for (const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const na = a + da, nb = b + db; if (na < 0 || nb < 0 || na >= GW || nb >= GH || seen[nb * GW + na]) continue; seen[nb * GW + na] = 1; qu.push([na, nb]); } }
    return [i, j];
  }
  const DIRS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
  function los(a, b) { const d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.ceil(d / 4); for (let k = 1; k < n; k++) if (!free(a.x + (b.x - a.x) * k / n, a.y + (b.y - a.y) * k / n)) return false; return true; }
  function astar(sx, sy, tx, ty) {
    let [si, sj] = cellOf(sx, sy), [ti, tj] = cellOf(tx, ty);
    if (grid[sj * GW + si]) [si, sj] = nearestFree(si, sj);
    let exact = free(tx, ty);
    if (grid[tj * GW + ti]) { [ti, tj] = nearestFree(ti, tj); exact = false; }
    const N = GW * GH, g = new Float32Array(N).fill(Infinity), f = new Float32Array(N).fill(Infinity), came = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
    const h = (i, j) => { const dx = Math.abs(i - ti), dy = Math.abs(j - tj); return dx + dy - 0.586 * Math.min(dx, dy); };
    const s = sj * GW + si, goal = tj * GW + ti; g[s] = 0; f[s] = h(si, sj); const open = [s];
    while (open.length) {
      let bi = 0; for (let k = 1; k < open.length; k++) if (f[open[k]] < f[open[bi]]) bi = k;
      const cur = open[bi]; open[bi] = open[open.length - 1]; open.pop();
      if (cur === goal) break; if (closed[cur]) continue; closed[cur] = 1;
      const ci = cur % GW, cj = cur / GW | 0;
      for (const [di, dj, cost] of DIRS) {
        const ni = ci + di, nj = cj + dj; if (ni < 0 || nj < 0 || ni >= GW || nj >= GH) continue;
        const n = nj * GW + ni; if (grid[n] || closed[n]) continue;
        if (di && dj && (grid[cj * GW + ni] || grid[nj * GW + ci])) continue;
        const ng = g[cur] + cost; if (ng < g[n]) { g[n] = ng; f[n] = ng + h(ni, nj); came[n] = cur; open.push(n); }
      }
    }
    if (goal !== s && came[goal] < 0) return null;
    const pts = []; let k = goal; while (k !== s && k >= 0) { pts.push({ x: (k % GW) * CS + 8, y: (k / GW | 0) * CS + 8 }); k = came[k]; }
    pts.reverse(); if (exact) pts.push({ x: tx, y: ty });
    const out = []; let from = { x: sx, y: sy }, i = 0;
    while (i < pts.length) { let j = pts.length - 1; while (j > i && !los(from, pts[j])) j--; out.push(pts[j]); from = pts[j]; i = j + 1; }
    return out.length ? out : null;
  }

  /* ---------- personajes ---------- */
  const player = { x: 384, y: 392, dir: 'up', flip: false, phase: 0, moving: false, path: null, onArrive: null, cfg: store.get('avatar', null) };
  const guide = { x: 432, y: 372, dir: 'down', flip: false, phase: 0, moving: false, path: null, cfg: D.avatarGuia };
  const face = (a, dx, dy) => { if (Math.abs(dx) > Math.abs(dy)) { a.dir = 'side'; a.flip = dx < 0; } else a.dir = dy < 0 ? 'up' : 'down'; };
  function follow(a, speed, dt) {
    if (!a.path || !a.path.length) { a.path = null; return false; }
    const p0 = a.path[0], dx = p0.x - a.x, dy = p0.y - a.y, d = Math.hypot(dx, dy), v = speed * dt / 1000;
    if (d <= v) { a.x = p0.x; a.y = p0.y; a.path.shift(); if (!a.path.length) a.path = null; }
    else { a.x += dx / d * v; a.y += dy / d * v; }
    if (d > 0.5) face(a, dx, dy);
    return true;
  }
  const standPoint = z => z.id === 'skills' ? { x: 384, y: 140 } : { x: z.x + z.w / 2, y: z.y + z.h + 20 };

  /* ---------- entrada ---------- */
  const keys = {};
  const KM = { ArrowUp: 'up', KeyW: 'up', w: 'up', ArrowDown: 'down', KeyS: 'down', s: 'down', ArrowLeft: 'left', KeyA: 'left', a: 'left', ArrowRight: 'right', KeyD: 'right', d: 'right' };
  const kk = e => KM[e.code] || KM[(e.key || '').toLowerCase()] || KM[e.key];
  const anyModal = () => !$('#modal').hidden || !$('#creator').hidden || !$('#term').hidden;
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (anyModal()) { closeModals(); e.preventDefault(); } else if (!dlg.hidden && !tour.on) hideDlg(); return; }
    if (anyModal()) return;
    const tg = e.target; if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA')) return;
    const k = kk(e);
    if (k) { keys[k] = 1; player.path = null; player.onArrive = null; e.preventDefault(); return; }
    if ((e.code === 'KeyE' || e.key === 'e' || e.key === 'E') && !e.repeat) { interact(); e.preventDefault(); return; }
    if (e.key === 'Enter' && tour.on && !e.repeat && document.activeElement === cv) { if (!say.done) finishSay(); else nextStep(); e.preventDefault(); }
  }, { passive: false });
  addEventListener('keyup', e => { const k = kk(e); if (k) keys[k] = 0; });
  const clearKeys = () => { for (const k in keys) keys[k] = 0; document.querySelectorAll('.pad .on').forEach(b => b.classList.remove('on')); };
  addEventListener('blur', clearKeys);
  document.addEventListener('visibilitychange', clearKeys);

  document.querySelectorAll('.pad [data-k]').forEach(b => {
    const k = b.dataset.k;
    b.addEventListener('pointerdown', e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (er) { /* */ } keys[k] = 1; b.classList.add('on'); player.path = null; player.onArrive = null; });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, () => { keys[k] = 0; b.classList.remove('on'); }));
    b.addEventListener('contextmenu', e => e.preventDefault());
  });
  $('#padAct').addEventListener('click', () => interact());

  /* clic o toque en el mapa: caminar hasta allí */
  cv.addEventListener('pointerdown', e => {
    cv.focus({ preventScroll: true });
    const r = cv.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * W, py = (e.clientY - r.top) / r.height * H;
    if (Math.hypot(px - guide.x, py - (guide.y - 24)) < 26) { goTo(guide.x + 28, guide.y + 6, () => talkToGuide()); return; }
    const z = E.filter(o => o.id).find(o => { const b = bbox(o); return px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h; });
    if (z) { const sp = standPoint(z); goTo(sp.x, sp.y, () => openZone(z.id)); return; }
    goTo(px, Math.max(py, 124), null);
  });
  function goTo(tx, ty, cb) { const p = astar(player.x, player.y, tx, ty); player.path = p; player.onArrive = p ? cb : null; marker = p ? { x: p[p.length - 1].x, y: p[p.length - 1].y, t: 0 } : null; if (!p && cb) cb(); }
  let marker = null;

  /* ---------- HUD, toasts y zonas visitadas ---------- */
  const visited = new Set();
  const hud = $('#hudZonas');
  function visit(id) {
    if (!id || visited.has(id)) return;
    visited.add(id); hud.textContent = '🧭 ' + visited.size + '/' + ZONAS.length;
    if (visited.size === ZONAS.length) { toast('🏆 Logro desbloqueado: auditoría completa. Has visitado toda la oficina.'); burst(player.x, player.y - 30); }
  }
  function toast(msg) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg; $('#toasts').appendChild(d); setTimeout(() => d.remove(), 3600); }
  const sparks = [];
  function burst(bx, by) { if (reduce) return; for (let i = 0; i < 70; i++) { const a = Math.random() * 6.28, v = 1 + Math.random() * 3.5; sparks.push({ x: bx, y: by, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, l: 60 + Math.random() * 40, c: ['#00ff9c', '#00e5ff', '#ff3bd4', '#ffb300'][i % 4] }); } }

  const strip = { cmd: $('#stripCmd'), title: $('#stripTitle'), text: $('#stripText'), btn: $('#stripBtn') };
  let near = null; /* {type:'zone'|'guide', id} */
  function setStrip(n) {
    const key = n ? n.type + ':' + n.id : '';
    if (setStrip.k === key) return; setStrip.k = key;
    if (!n) { strip.cmd.innerHTML = '<b>reclutador@adrian-soc</b>:~$ ls'; strip.title.textContent = 'Explora la oficina'; strip.text.textContent = 'Acércate a una zona o habla con Adrián Calderón. También puedes hacer clic en el suelo para caminar.'; strip.btn.hidden = true; return; }
    if (n.type === 'guide') { strip.cmd.innerHTML = '<b>reclutador@adrian-soc</b>:~$ talk adrian'; strip.title.textContent = '💬 Adrián Calderón, el guía'; strip.text.textContent = 'Te presenta el CV de Adrián zona por zona.'; strip.btn.textContent = 'Hablar · E'; strip.btn.hidden = false; return; }
    strip.cmd.innerHTML = '<b>reclutador@adrian-soc</b>:~$ cd ./' + n.id;
    strip.title.textContent = ZI[n.id] + ' ' + ZT[n.id]; strip.text.textContent = zoneSummary(n.id);
    strip.btn.textContent = n.id === 'terminal' ? 'Usar terminal · E' : 'Abrir · E'; strip.btn.hidden = false;
  }
  strip.btn.addEventListener('click', () => interact());
  function interact() {
    if (anyModal()) return;
    if (near && near.type === 'guide') talkToGuide();
    else if (near) openZone(near.id);
  }

  /* ---------- ventanas ---------- */
  let lastFocus = null;
  function openPanel(el) { lastFocus = document.activeElement; clearKeys(); el.hidden = false; const f = el.querySelector('input, [data-close]'); if (f) f.focus(); }
  function closeModals() { ['#modal', '#creator', '#term'].forEach(s => { $(s).hidden = true; }); if (creatorFirst) { creatorFirst = false; if (!player.cfg) { player.cfg = AV.norm(draft); store.set('avatar', player.cfg); } intro(); } (lastFocus && lastFocus.focus ? lastFocus : cv).focus({ preventScroll: true }); }
  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) closeModals(); });
  });

  function openZone(id) {
    if (!id) return;
    visit(id);
    if (id === 'terminal') { openTerm(); return; }
    const ps = D.proyectos.filter(p => p.zona === id);
    let body;
    if (id === 'formacion') body = UI.formacion(D) + (ps.length ? '<h3 class="sub">Trabajos de los que estoy orgulloso</h3>' + ps.map(p => UI.project(p)).join('') : '');
    else if (ps.length) body = ps.map(p => UI.project(p)).join('');
    else if (id === 'contacto') body = UI.contacto(D);
    else if (id === 'sobre-mi') body = UI.sobreMi(D);
    else if (id === 'skills') body = UI.skills(D);
    $('#mKicker').textContent = 'cd ./' + id;
    $('#mTitle').textContent = ZI[id] + ' ' + ZT[id];
    $('#mBody').innerHTML = body || '';
    UI.wire($('#mBody'));
    openPanel($('#modal'));
  }

  /* ---------- diálogo del guía ---------- */
  const dlg = $('#dlg'), dlgText = $('#dlgText'), dlgActions = $('#dlgActions'), dlgStep = $('#dlgStep');
  const fc = $('#face'), FS = 132; fc.width = FS * SC; fc.height = FS * SC; const fq = fc.getContext('2d');
  const say = { chars: [], shown: 0, done: true };
  function speak(text) { say.chars = Array.from(text); say.shown = reduce ? say.chars.length : 0; say.done = false; dlgText.textContent = reduce ? text : ''; tts(text); }
  function finishSay() { say.shown = say.chars.length; }
  dlgText.addEventListener('click', finishSay);
  function setActions(list) {
    dlgActions.innerHTML = '';
    list.forEach(a => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-sm' + (a.primary ? ' btn-primary' : '') + (a.ghost ? ' btn-ghost' : ''); b.textContent = a.t; if (a.disabled) b.disabled = true; b.addEventListener('click', a.f); dlgActions.appendChild(b); });
  }
  function showDlg(text, actions, step) { dlg.hidden = false; dlgStep.textContent = step || ''; speak(text); setActions(actions || []); }
  function hideDlg() { dlg.hidden = true; stopVoice(); say.done = true; }

  /* voz (opcional) */
  let voiceOn = store.get('voz', false), speaking = false, voice = null;
  const hasTTS = 'speechSynthesis' in window;
  const btnVoz = $('#btnVoz');
  function pickVoice() { const vs = speechSynthesis.getVoices(); voice = vs.find(v => /^es[-_]ES/i.test(v.lang)) || vs.find(v => /^es/i.test(v.lang)) || null; }
  if (hasTTS) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } else btnVoz.hidden = true;
  const cleanSpeech = s => s.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim();
  function tts(text) {
    if (!voiceOn || !hasTTS) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(cleanSpeech(text)); u.lang = 'es-ES'; if (voice) u.voice = voice; u.rate = 1.06; u.pitch = 1.05;
      u.onstart = () => { speaking = true; }; u.onend = u.onerror = () => { speaking = false; };
      speechSynthesis.speak(u);
    } catch (e) { speaking = false; }
  }
  function stopVoice() { if (hasTTS) try { speechSynthesis.cancel(); } catch (e) { /* */ } speaking = false; }
  function paintVoz() { btnVoz.textContent = voiceOn ? '🔊' : '🔇'; btnVoz.setAttribute('aria-pressed', String(voiceOn)); btnVoz.title = voiceOn ? 'Silenciar al guía' : 'Activar la voz del guía'; }
  btnVoz.addEventListener('click', () => { voiceOn = !voiceOn; store.set('voz', voiceOn); paintVoz(); if (voiceOn) { toast('🔊 Voz activada'); if (!dlg.hidden && say.chars.length) tts(say.chars.join('')); } else { stopVoice(); toast('🔇 Voz desactivada'); } });
  paintVoz();

  /* ---------- tour guiado ---------- */
  const steps = D.tour;
  const tour = { on: false, i: 0, phase: 'idle', auto: store.get('auto', false), wait: 0, zone: null };
  function tourStart(i) { tour.on = true; tour.wait = 0; $('#btnTour').innerHTML = '⏹ <span>Parar tour</span>'; goStep(i || 0); }
  function tourEnd() {
    tour.on = false; tour.zone = null; tour.phase = 'idle'; $('#btnTour').innerHTML = '▶ <span>Tour guiado</span>';
    showDlg('¡Tour terminado! 🎉 Ahora la oficina es toda tuya: pulsa E cerca de cada zona para ver los detalles, o prueba la terminal.', [
      { t: '🔁 Repetir el tour', f: () => tourStart(0) },
      { t: '✉️ Ver contacto', f: () => { hideDlg(); openZone('contacto'); } },
      { t: '🧭 Explorar', primary: true, f: hideDlg }
    ]);
  }
  function goStep(i) {
    if (i >= steps.length) { tourEnd(); return; }
    tour.i = Math.max(0, i); tour.wait = 0;
    const st = steps[tour.i], z = st.zona && zoneById[st.zona];
    tour.zone = null;
    if (z) {
      const sp = standPoint(z), gx = sp.x - 26;
      guide.path = astar(guide.x, guide.y, gx, sp.y) || [{ x: gx, y: sp.y }];
      tour.phase = 'walk';
      showDlg(st.camino || 'Sígueme 👉', tourActions(true), stepLabel());
      /* el jugador le sigue solo si no se está moviendo él */
      if (!keysDown()) goTo(sp.x + 22, sp.y + 8, null);
    } else { tour.phase = 'talk'; showStep(); }
  }
  const keysDown = () => keys.up || keys.down || keys.left || keys.right;
  const stepLabel = () => (tour.i + 1) + '/' + steps.length;
  function showStep() {
    const st = steps[tour.i]; tour.phase = 'talk'; tour.wait = 0; tour.zone = st.zona || null;
    if (st.zona) visit(st.zona);
    guide.dir = 'down';
    showDlg(st.texto, tourActions(false), stepLabel());
  }
  function tourActions(walking) {
    const st = steps[tour.i], list = [];
    list.push({ t: '◀', ghost: true, disabled: tour.i === 0, f: () => goStep(tour.i - 1) });
    list.push({ t: walking ? 'Saltar ▶' : (tour.i === steps.length - 1 ? 'Terminar ✓' : 'Siguiente ▶'), primary: true, f: () => { if (tour.phase === 'walk') { guide.path = null; const z = zoneById[st.zona]; if (z) { const sp = standPoint(z); guide.x = sp.x - 26; guide.y = sp.y; } showStep(); } else nextStep(); } });
    if (st.zona && !walking) list.push({ t: '🔍 Ver detalle', f: () => openZone(st.zona) });
    list.push({ t: tour.auto ? '⏸ Auto' : '⏵ Auto', ghost: true, f: () => { tour.auto = !tour.auto; store.set('auto', tour.auto); setActions(tourActions(tour.phase === 'walk')); toast(tour.auto ? '⏵ Avance automático activado' : '⏸ Avance automático desactivado'); } });
    list.push({ t: '✕', ghost: true, f: () => { tour.on = false; tour.zone = null; $('#btnTour').innerHTML = '▶ <span>Tour guiado</span>'; hideDlg(); } });
    return list;
  }
  function nextStep() { goStep(tour.i + 1); }
  $('#btnTour').addEventListener('click', () => { if (tour.on) { tour.on = false; tour.zone = null; $('#btnTour').innerHTML = '▶ <span>Tour guiado</span>'; hideDlg(); } else tourStart(0); });

  function talkToGuide() {
    if (tour.on) return;
    guide.dir = 'down';
    showDlg('¿Qué te apetece? Puedo enseñarte toda la oficina en un par de minutos, o te dejo explorar a tu aire. 😄', [
      { t: '🚀 Hazme el tour', primary: true, f: () => tourStart(1) },
      { t: '🙋 ¿Quién eres?', f: () => showDlg('Soy el avatar de ' + D.nombre + '. Él me diseñó para presentarte su CV mientras paseas por su oficina. Todo lo que ves está hecho a mano con JavaScript.', [{ t: '🚀 Hazme el tour', primary: true, f: () => tourStart(1) }, { t: 'Vale 👍', ghost: true, f: hideDlg }]) },
      { t: '🧭 Explorar solo', ghost: true, f: hideDlg }
    ]);
  }
  function intro() {
    showDlg((steps[0] && !steps[0].zona) ? steps[0].texto : '¡Hola! 👋 Bienvenidos al CV de ' + D.nombre + '.', [
      { t: '🚀 Sí, enséñamelo', primary: true, f: () => tourStart(1) },
      { t: '🧭 Prefiero explorar', ghost: true, f: () => { hideDlg(); toast('👀 Acércate a una zona y pulsa E. Habla con Adrián Calderón cuando quieras el tour.'); } }
    ]);
  }

  /* ---------- creador de avatar ---------- */
  let draft = AV.norm(player.cfg || AV.random()), creatorFirst = false;
  const crOpts = $('#crOpts');
  const LABEL = { ninguno: 'Ninguno', auriculares: 'Auriculares' };
  function renderCreator() {
    crOpts.innerHTML = Object.keys(AV.OPC).map(k => {
      const o = AV.OPC[k];
      return '<div class="cr-row"><h3 id="lb-' + k + '">' + o.label + '</h3><div class="opts" role="group" aria-labelledby="lb-' + k + '">' +
        o.vals.map(v => o.tipo === 'color'
          ? '<button type="button" class="sw" data-k="' + k + '" data-v="' + v + '" style="background:' + v + '" aria-label="' + o.label + ' ' + v + '" aria-pressed="' + (draft[k] === v) + '"></button>'
          : '<button type="button" class="ch" data-k="' + k + '" data-v="' + v + '" aria-pressed="' + (draft[k] === v) + '">' + (LABEL[v] || v) + '</button>').join('') +
        '</div></div>';
    }).join('');
  }
  crOpts.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (!b) return; draft[b.dataset.k] = b.dataset.v; crOpts.querySelectorAll('[data-k="' + b.dataset.k + '"]').forEach(o => o.setAttribute('aria-pressed', String(o === b))); });
  $('#crRand').addEventListener('click', () => { draft = AV.random(); renderCreator(); });
  $('#crCopy').addEventListener('click', () => {
    const code = JSON.stringify(draft), b = $('#crCopy');
    try { navigator.clipboard.writeText(code).then(() => { b.textContent = '✅ Copiado'; setTimeout(() => b.textContent = '📋 Copiar código', 1800); }, () => toast(code)); } catch (e) { toast(code); }
  });
  $('#crOk').addEventListener('click', () => {
    const first = creatorFirst || !player.cfg;
    player.cfg = AV.norm(draft); store.set('avatar', player.cfg); creatorFirst = false;
    ['#creator'].forEach(s => { $(s).hidden = true; }); cv.focus({ preventScroll: true });
    toast('✅ Avatar guardado');
    if (first) intro();
  });
  function openCreator(first) { creatorFirst = !!first; draft = AV.norm(player.cfg || draft); renderCreator(); $('#crTitle').textContent = first ? 'Antes de entrar, crea tu avatar' : 'Edita tu avatar'; openPanel($('#creator')); }
  $('#btnAvatar').addEventListener('click', () => openCreator(false));
  const crF = $('#crFace'), crS = $('#crSprite');
  crF.width = 240 * SC; crF.height = 240 * SC; crS.width = 150 * SC; crS.height = 120 * SC;
  const crFq = crF.getContext('2d'), crSq = crS.getContext('2d');
  function drawCreator() {
    crFq.setTransform(SC, 0, 0, SC, 0, 0); crFq.clearRect(0, 0, 240, 240);
    crFq.save(); crFq.translate(120, 108); crFq.scale(1.32, 1.32); AV.portrait(crFq, draft, { mouth: 0, blink: blinkT > 0, t: t }); crFq.restore();
    crSq.setTransform(SC, 0, 0, SC, 0, 0); crSq.clearRect(0, 0, 150, 120);
    const dirs = ['down', 'side', 'up', 'side'], di = (t / 90 | 0) % 4;
    crSq.fillStyle = 'rgba(0,0,0,.45)'; crSq.beginPath(); crSq.ellipse(75, 108, 22, 6, 0, 0, 7); crSq.fill();
    crSq.save(); crSq.translate(75, 108); crSq.scale(1.7, 1.7); AV.sprite(crSq, draft, { dir: dirs[di], flip: di === 3, phase: t * 0.25, moving: true }); crSq.restore();
  }

  /* ---------- terminal ---------- */
  const tOut = $('#termOut'), tIn = $('#termInput'), hist = []; let hi = 0;
  const CMDS = ['help', 'whoami', 'ls', 'cat', 'proyectos', 'skills', 'formacion', 'contacto', 'cv', 'tour', 'avatar', 'nmap', 'sudo', 'clear', 'exit'];
  const esc = UI.esc, P = s => s.replace(/✏️/g, '');
  function tp(html, cls) { const d = document.createElement('div'); d.className = 'ln ' + (cls || ''); d.innerHTML = html; tOut.appendChild(d); tOut.scrollTop = tOut.scrollHeight; }
  function openTerm() {
    if (!tOut.childElementCount) {
      tp('<span class="g">adrian-soc</span> <span class="d">v1.0 · Debian/GNU Linux · conectado como reclutador</span>');
      tp('Bienvenido a la terminal de ' + esc(D.nombre) + '. Escribe <span class="c">help</span> para ver los comandos.');
      tp('');
    }
    openPanel($('#term')); tIn.focus();
  }
  function projectText(p) {
    return '<span class="c">' + esc(P(p.titulo)) + '</span>  <span class="d">[' + esc(p.estado) + ']</span>\n' + esc(P(p.resumen)) + '\n' +
      p.puntos.map(x => '  <span class="g">›</span> ' + esc(P(x))).join('\n') + (p.roadmap ? '\n<span class="d">hoja de ruta:</span>\n' + p.roadmap.map(r => '  ' + (r[1] ? '<span class="g">[x]</span> ' : '<span class="d">[ ]</span> ') + esc(r[0])).join('\n') : '') + (p.tech.length ? '\n<span class="d">stack:</span> ' + esc(p.tech.join(', ')) : '');
  }
  function run(raw) {
    const line = raw.trim(); tp('<span class="cmd"><b>reclutador@adrian-soc</b>:~$ ' + esc(line) + '</span>');
    if (!line) return;
    hist.push(line); hi = hist.length;
    const [cmd, ...args] = line.split(/\s+/), arg = args.join(' ').toLowerCase();
    const c = D.contacto;
    switch (cmd.toLowerCase()) {
      case 'help': case 'ayuda':
        tp([['whoami', 'quién es Adrián'], ['ls', 'listar archivos'], ['cat ‹archivo›', 'leer un archivo (prueba cat caldesberry)'], ['proyectos', 'lista de proyectos'], ['skills', 'tecnologías y nivel'], ['formacion', 'formación y certificados'], ['contacto', 'cómo contactarle'], ['cv', 'abrir el CV en PDF'], ['tour', 'tour guiado por mi avatar'], ['avatar', 'editar tu avatar'], ['clear / exit', 'limpiar / salir']].map(([a, b]) => '  <span class="c">' + a.padEnd(18, ' ') + '</span> ' + b).join('\n') + '\n<span class="d">  …y algún comando secreto 😉</span>');
        break;
      case 'whoami':
        tp('<span class="g">' + esc(P(D.nombreCompleto)) + '</span>\n' + esc(D.rol) + '\n📍 ' + esc(D.ubicacion) + '\n🟢 ' + esc(D.estado)); break;
      case 'ls':
        if (/proyectos/.test(arg)) tp(D.proyectos.filter(p => !p.borrador).map(p => '<span class="c">' + p.id + '.md</span>').join('   '));
        else tp('<span class="c">proyectos/</span>   skills.txt   formacion.txt   contacto.txt   <span class="g">cv.pdf</span>');
        break;
      case 'cat': {
        const id = arg.replace(/^proyectos\//, '').replace(/\.(md|txt)$/, '');
        const p = D.proyectos.find(x => x.id === id);
        if (p) tp(projectText(p));
        else if (id === 'skills') run.skills();
        else if (id === 'formacion') run.form();
        else if (id === 'contacto') run.cont();
        else if (id === 'cv' || id === 'cv.pdf') tp('<span class="a">Es un PDF, no se puede leer con cat 😅</span> Usa <span class="c">cv</span>.');
        else tp('cat: ' + esc(arg || '') + ': No existe el archivo. Prueba <span class="c">ls proyectos</span>.', 'r');
        break;
      }
      case 'proyectos': tp(D.proyectos.filter(p => !p.borrador).map(p => '<span class="g">›</span> <span class="c">' + p.id.padEnd(10, ' ') + '</span> ' + esc(P(p.titulo)) + ' <span class="d">[' + esc(p.estado) + ']</span>').join('\n') + '\n<span class="d">Lee uno con: cat &lt;id&gt;</span>'); break;
      case 'skills': run.skills(); break;
      case 'formacion': case 'formación': run.form(); break;
      case 'contacto': case 'ping': run.cont(); break;
      case 'cv': tp('Abriendo CV… <a href="' + esc(D.cvPdf) + '" target="_blank" rel="noopener">' + esc(D.cvPdf) + ' ↗</a>'); break;
      case 'tour': closeModals(); tourStart(1); break;
      case 'avatar': $('#term').hidden = true; openCreator(false); break;
      case 'nmap':
        tp('Starting Nmap 7.95 ( https://nmap.org )\nNmap scan report for <span class="c">' + esc(arg || 'adrian') + '</span>\nHost is up (0.001s latency).\n\nPORT      STATE  SERVICE\n<span class="g">22/tcp    open   curiosidad</span>\n<span class="g">80/tcp    open   ganas-de-aprender</span>\n<span class="g">443/tcp   open   trabajo-en-equipo</span>\n<span class="g">1337/tcp  open   hack-the-box</span>\n<span class="r">8080/tcp  closed excusas</span>\n\nNmap done: 1 IP address (1 host up) scanned in 0.42 seconds');
        break;
      case 'sudo':
        if (/contrat|hire/.test(arg)) {
          tp('[sudo] contraseña para reclutador: ********');
          setTimeout(() => tp('<span class="g">✅ Acceso concedido.</span> Excelente decisión. Abriendo el contacto de ' + esc(D.nombre) + '…'), 650);
          setTimeout(() => { closeModals(); openZone('contacto'); }, 1700);
        } else tp('reclutador no está en el archivo sudoers. Este incidente será reportado. 🚨\n<span class="d">Pista: sudo contratar</span>', 'a');
        break;
      case 'rm': tp('Buen intento 😏 Permiso denegado: este sistema está bastionado.', 'r'); break;
      case 'hack': case 'hackear': tp('Solo hackeo en laboratorios legales como Hack The Box. 😇', 'a'); break;
      case 'clear': tOut.innerHTML = ''; break;
      case 'exit': case 'salir': closeModals(); break;
      default: tp(esc(cmd) + ': comando no encontrado. Prueba <span class="c">help</span>.', 'r');
    }
  }
  run.skills = () => tp(D.skills.map(g => '<span class="m">' + esc(g.grupo) + '</span>\n' + g.items.map(([n, l]) => '  ' + esc(n).padEnd(28, ' ') + ' <span class="g">' + '■'.repeat(l) + '</span><span class="d">' + '□'.repeat(3 - l) + ' ' + UI.LV[l] + '</span>').join('\n')).join('\n\n'));
  run.form = () => tp(D.formacion.map(f => '<span class="c">' + esc(P(f.fechas)) + '</span>  ' + esc(P(f.titulo)) + ' · ' + esc(P(f.centro))).join('\n') + '\n' + D.certificaciones.map(x => '<span class="g">✓</span> ' + esc(P(x.titulo)) + ' <span class="d">(' + esc(P(x.entidad)) + ', ' + esc(P(x.fecha)) + ')</span>').join('\n'));
  run.cont = () => tp('✉️  ' + esc(P(c0().email)) + '\n🐙 <a href="' + esc(c0().github) + '" target="_blank" rel="noopener">' + esc(P(c0().github)) + '</a>\n💼 <a href="' + esc(c0().linkedin) + '" target="_blank" rel="noopener">' + esc(P(c0().linkedin)) + '</a>');
  const c0 = () => D.contacto;
  $('#termForm').addEventListener('submit', e => { e.preventDefault(); const v = tIn.value; tIn.value = ''; run(v); });
  tIn.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') { if (hi > 0) { hi--; tIn.value = hist[hi]; } e.preventDefault(); }
    else if (e.key === 'ArrowDown') { if (hi < hist.length) { hi++; tIn.value = hist[hi] || ''; } e.preventDefault(); }
    else if (e.key === 'Tab') { e.preventDefault(); const v = tIn.value.trim(); if (!v.includes(' ')) { const m = CMDS.filter(c => c.startsWith(v)); if (m.length === 1) tIn.value = m[0] + ' '; else if (m.length > 1) tp(m.join('   '), 'd'); } }
  });

  /* ---------- dibujo dinámico ---------- */
  function wall() {
    /* pantalla gigante: logs + barras */
    x.save(); x.font = 'bold 10px "IBM Plex Mono", monospace'; x.fillStyle = '#00e5ff'; x.fillText('ADRIAN.SEC // LIVE FEED', 272, 22);
    for (let i = 0; i < 10; i++) { const h = 4 + Math.abs(Math.sin(t * 0.04 + i * 1.7)) * 10; R(440 + i * 6, 24 - h, 4, h, '#00ff9c'); }
    x.beginPath(); x.rect(266, 28, 236, 58); x.clip(); x.font = '10px "IBM Plex Mono", monospace';
    const L = D.logs, off = (t * 0.35) % 14, b = (t * 0.35 / 14) | 0;
    for (let i = 0; i < 6; i++) { const s = L[(i + b) % L.length]; x.fillStyle = s[2] === 'O' ? '#00ff9c' : s[2] === 'W' ? '#ffb300' : s[2] === '!' ? '#ff3b6b' : '#00e5ff'; x.fillText(s, 270, 42 + i * 14 - off); }
    x.restore();
    /* letrero de neón con parpadeo */
    const fl = reduce ? 1 : ((t % 400) < 6 ? 0.35 : 1);
    x.save(); x.globalAlpha = fl; x.font = 'bold 22px "Chakra Petch", sans-serif'; x.textAlign = 'center'; x.shadowColor = '#ff3bd4'; x.shadowBlur = 18; x.fillStyle = '#ff7be3'; x.fillText(D.nombre.toUpperCase(), 650, 46); x.shadowBlur = 0;
    x.font = '9px "IBM Plex Mono", monospace'; x.fillStyle = '#00e5ff'; x.fillText('// CYBERSECURITY', 650, 62); x.restore();
  }
  function along(pa, u) { let L = 0; const ls = []; for (let i = 1; i < pa.length; i++) { const l = Math.hypot(pa[i][0] - pa[i - 1][0], pa[i][1] - pa[i - 1][1]); ls.push(l); L += l; } let d = u * L; for (let i = 0; i < ls.length; i++) { if (d <= ls[i]) { const k = d / ls[i]; return [pa[i][0] + (pa[i + 1][0] - pa[i][0]) * k, pa[i][1] + (pa[i + 1][1] - pa[i][1]) * k]; } d -= ls[i]; } return pa[pa.length - 1]; }
  const motes = Array.from({ length: 28 }, () => ({ x: Math.random() * W, y: 104 + Math.random() * 440, vx: (Math.random() - 0.5) * 0.2, vy: -0.1 - Math.random() * 0.2 }));
  let blinkT = 0, nextBlink = 2400;

  function tag(txt, cx, cy, bgc, fgc) { x.font = 'bold 10px "IBM Plex Mono", monospace'; x.textAlign = 'center'; const w = x.measureText(txt).width + 12; rr(cx - w / 2, cy, w, 15, 4, bgc); x.fillStyle = fgc; x.fillText(txt, cx, cy + 11); x.textAlign = 'left'; }
  function drawChar(a, label, col, isGuide) {
    x.save(); x.translate(a.x, a.y);
    glow(0, -4, 28, isGuide ? 'rgba(255,59,212,.45)' : 'rgba(0,229,255,.45)', 0.8);
    x.scale(1.12, 1.12);
    AV.sprite(x, a.cfg || AV.DEF, { dir: a.dir, flip: a.flip, phase: a.phase, moving: a.moving, blink: blinkT > 0 });
    x.restore();
    tag(label, a.x, a.y - 84, col, isGuide ? '#1a0216' : '#03140c');
    if (isGuide && !dlg.hidden && (!say.done || speaking)) { /* bocadillo pequeño sobre la cabeza */
      rr(a.x + 10, a.y - 104, 26, 16, 6, '#f2f7ff'); x.fillStyle = '#0a1020'; for (let i = 0; i < 3; i++) { x.globalAlpha = 0.35 + 0.65 * (((t >> 3) + i) % 3 === 0 ? 1 : 0); x.fillRect(a.x + 15 + i * 6, a.y - 97, 3, 3); } x.globalAlpha = 1;
      x.beginPath(); x.moveTo(a.x + 14, a.y - 89); x.lineTo(a.x + 12, a.y - 84); x.lineTo(a.x + 20, a.y - 89); x.fillStyle = '#f2f7ff'; x.fill();
    }
  }

  function draw() {
    x.setTransform(SC, 0, 0, SC, 0, 0);
    x.drawImage(bg, 0, 0, W, H);
    wall();
    PATHS.forEach((pa, i) => { const q = along(pa, ((t * 0.005) + i * 0.33) % 1); glow(q[0], q[1], 14, 'rgba(0,255,156,.9)', 1); });
    if (marker) { marker.t++; const r = 6 + (marker.t % 30) / 3; x.strokeStyle = 'rgba(0,255,156,' + (1 - (marker.t % 30) / 30) + ')'; x.lineWidth = 2; x.beginPath(); x.ellipse(marker.x, marker.y, r, r * 0.45, 0, 0, 7); x.stroke(); if (!player.path) marker = null; }
    E.forEach(e => { if (e.solid) R(e.x + 2, e.y + e.h - 4, e.w - 2, 8, 'rgba(0,0,0,.4)'); });
    x.fillStyle = 'rgba(0,0,0,.45)'; [player, guide].forEach(a => { x.beginPath(); x.ellipse(a.x, a.y, 13, 5, 0, 0, 7); x.fill(); });
    const L = E.map(e => ({ k: e.y + e.h, f: () => e.fn(e) }));
    L.push({ k: player.y, f: () => drawChar(player, 'TÚ', '#00ff9c', false) });
    L.push({ k: guide.y + 0.1, f: () => drawChar(guide, 'ADRIÁN CALDERÓN · GUÍA', '#ff3bd4', true) });
    L.sort((a, b) => a.k - b.k).forEach(i => i.f());
    /* resaltado de zona: la cercana o la del tour */
    const hz = (near && near.type === 'zone') ? zoneById[near.id] : (tour.zone ? zoneById[tour.zone] : null);
    if (hz) {
      const b = bbox(hz), bx = b.x - 6, by = b.y - 6, bw = b.w + 12, bh = b.h + 12;
      x.save(); x.strokeStyle = '#00ff9c'; x.lineWidth = 2; x.shadowColor = '#00ff9c'; x.shadowBlur = 14; x.setLineDash([8, 5]); x.lineDashOffset = -t * 0.4; x.strokeRect(bx, by, bw, bh); x.restore();
      const label = ZT[hz.id] + (near && near.type === 'zone' ? '  [E]' : '');
      x.font = 'bold 12px "IBM Plex Mono", monospace'; const tw = x.measureText(label).width + 16;
      const lx = Math.min(Math.max(bx + bw / 2, tw / 2 + 4), W - tw / 2 - 4), ly = by - 24 < 6 ? by + bh + 6 : by - 24;
      rr(lx - tw / 2, ly, tw, 19, 4, '#00ff9c'); x.fillStyle = '#03140c'; x.textAlign = 'center'; x.fillText(label, lx, ly + 13.5); x.textAlign = 'left';
    }
    if (!reduce) motes.forEach(m => { m.x += m.vx; m.y += m.vy; if (m.y < 100) { m.y = H; m.x = Math.random() * W; } x.fillStyle = 'rgba(0,229,255,.4)'; x.fillRect(m.x, m.y, 2, 2); });
    for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.x += s.vx; s.y += s.vy; s.vy += 0.06; s.l--; if (s.l <= 0) { sparks.splice(i, 1); continue; } x.globalAlpha = Math.min(1, s.l / 30); x.fillStyle = s.c; x.fillRect(s.x, s.y, 3, 3); }
    x.globalAlpha = 1;
    x.drawImage(ovl, 0, 0, W, H);
  }

  function drawFace(talking) {
    fq.setTransform(SC, 0, 0, SC, 0, 0); fq.clearRect(0, 0, FS, FS);
    const mouth = talking ? 0.2 + 0.8 * Math.abs(Math.sin(t * 0.32)) * (0.55 + 0.45 * Math.sin(t * 0.11)) : 0;
    fq.save(); fq.translate(FS / 2, 66 + (reduce ? 0 : Math.sin(t * 0.04))); fq.scale(0.86, 0.86);
    AV.portrait(fq, guide.cfg, { mouth, blink: blinkT > 0, t, look: talking ? 0 : Math.sin(t * 0.01) * 0.6 }); fq.restore();
  }

  /* ---------- bucle ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(now - last, 50); last = now; t++;
    const paused = anyModal();

    /* jugador */
    const dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), dy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
    player.moving = false;
    if (!paused && (dx || dy)) {
      const v = 160 * dt / 1000 * (dx && dy ? 0.7071 : 1);
      const nx = player.x + dx * v; if (free(nx, player.y)) player.x = nx;
      const ny = player.y + dy * v; if (free(player.x, ny)) player.y = ny;
      face(player, dx, dy); player.moving = true;
    } else if (!paused && player.path) {
      player.moving = follow(player, 170, dt);
      if (!player.path && player.onArrive) { const cb = player.onArrive; player.onArrive = null; cb(); }
    }
    if (player.moving) player.phase += dt * 0.016;

    /* guía */
    guide.moving = !paused && follow(guide, 150, dt);
    if (guide.moving) guide.phase += dt * 0.015;
    else if (!tour.on || tour.phase === 'talk') { const ddx = player.x - guide.x, ddy = player.y - guide.y; if (Math.hypot(ddx, ddy) < 160) face(guide, ddx, ddy); }
    if (tour.on && tour.phase === 'walk' && !guide.path) showStep();

    /* texto del bocadillo */
    if (!say.done) {
      say.shown += dt * 0.038;
      const n = Math.min(say.chars.length, say.shown | 0);
      if (dlgText.textContent.length !== n) dlgText.textContent = say.chars.slice(0, n).join('');
      if (n >= say.chars.length) say.done = true;
    }
    if (tour.on && tour.auto && tour.phase === 'talk' && say.done && !speaking && !paused) { tour.wait += dt; if (tour.wait > 2800) nextStep(); }

    /* cercanía */
    let n = null;
    if (Math.hypot(player.x - guide.x, player.y - guide.y) < 44 && !tour.on) n = { type: 'guide', id: 'adri' };
    else { const z = E.find(e => e.id && hit(foot(player.x, player.y), e, 24)); if (z) { n = { type: 'zone', id: z.id }; if (player.moving) visit(z.id); } }
    near = n; setStrip(n);

    nextBlink -= dt; if (nextBlink <= 0) { blinkT = 130; nextBlink = 2400 + Math.random() * 2600; } if (blinkT > 0) blinkT -= dt;

    draw();
    if (!dlg.hidden) drawFace(!say.done || speaking);
    if (!$('#creator').hidden) drawCreator();
    requestAnimationFrame(loop);
  }

  /* ---------- arranque ---------- */
  build(); buildGrid();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => build());
  hud.textContent = '🧭 0/' + ZONAS.length;
  requestAnimationFrame(loop);
  if (player.cfg) intro(); else openCreator(true);
})();
