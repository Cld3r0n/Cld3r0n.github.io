/* Avatares: retrato detallado (diálogos, portada) y sprite pequeño (oficina).
   Todo dibujado con Canvas 2D, sin imágenes externas. */
(function () {
  'use strict';

  const OPC = {
    piel:       { label: 'Tono de piel',  tipo: 'color', vals: ['#f7dcc5', '#efc6a3', '#dba57e', '#bd8158', '#8f5b3b', '#5c3825'] },
    peloEstilo: { label: 'Peinado',       tipo: 'chip',  vals: ['corto', 'rapado', 'rizos', 'largo', 'cresta', 'coleta', 'flequillo'] },
    peloColor:  { label: 'Color de pelo', tipo: 'color', vals: ['#17110f', '#3b2416', '#6e4224', '#b07a3c', '#e6c77e', '#c8ccd8', '#ff3bd4', '#00d9f2'] },
    ojos:       { label: 'Ojos',          tipo: 'color', vals: ['#3b2416', '#4d7a36', '#2f6fb0', '#6f8fa0', '#1d1d1d'] },
    ropa:       { label: 'Ropa',          tipo: 'chip',  vals: ['sudadera', 'chaqueta', 'camiseta'] },
    ropaColor:  { label: 'Color de ropa', tipo: 'color', vals: ['#1b2342', '#26262e', '#0f3d3a', '#47205a', '#7a1f2b', '#d9dee8', '#0aa5bd'] },
    accesorio:  { label: 'Accesorio',     tipo: 'chip',  vals: ['ninguno', 'gafas', 'visor', 'auriculares', 'gorra', 'capucha'] },
    barba:      { label: 'Vello facial',  tipo: 'chip',  vals: ['ninguno', 'barba', 'perilla', 'bigote'] }
  };
  const DEF = { piel: '#efc6a3', peloEstilo: 'corto', peloColor: '#3b2416', ojos: '#3b2416', ropa: 'sudadera', ropaColor: '#1b2342', accesorio: 'auriculares', barba: 'ninguno' };

  function norm(c) {
    const o = {};
    for (const k in OPC) {
      const v = c && c[k];
      const ok = OPC[k].tipo === 'color' ? /^#[0-9a-f]{6}$/i.test(v || '') : OPC[k].vals.includes(v);
      o[k] = ok ? v : DEF[k];
    }
    return o;
  }
  function random() {
    const o = {};
    for (const k in OPC) { const v = OPC[k].vals; o[k] = v[Math.random() * v.length | 0]; }
    if (Math.random() < 0.55) o.barba = 'ninguno';
    return o;
  }
  function shade(h, a) {
    const n = parseInt(h.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = a < 0 ? 0 : 255, p = Math.abs(a);
    r = Math.round((f - r) * p + r); g = Math.round((f - g) * p + g); b = Math.round((f - b) * p + b);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  function ell(q, x, y, rx, ry, f) { q.beginPath(); q.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); q.fillStyle = f; q.fill(); }
  function rrp(q, x, y, w, h, r) { if (q.roundRect) q.roundRect(x, y, w, h, r); else q.rect(x, y, w, h); }
  function rrf(q, x, y, w, h, r, f) { q.beginPath(); rrp(q, x, y, w, h, r); q.fillStyle = f; q.fill(); }

  /* ---------- RETRATO ----------
     Origen = centro de la cabeza. La cabeza mide ~100 unidades de alto;
     el torso llega hasta y≈150. Escala con q.scale() antes de llamar. */
  function portrait(q, cfg, o) {
    o = o || {};
    const c = norm(cfg), m = Math.max(0, Math.min(1, o.mouth || 0)), t = o.t || 0, look = o.look || 0;
    const skin = c.piel, sd = shade(skin, -0.14), sdd = shade(skin, -0.32), sl = shade(skin, 0.14);
    const hair = c.peloColor, hd = shade(hair, -0.35), hl = shade(hair, 0.25);
    const cl = c.ropaColor, cd = shade(cl, -0.4), cL = shade(cl, 0.2);
    const hs = c.peloEstilo, acc = c.accesorio;
    q.save(); q.lineCap = 'round'; q.lineJoin = 'round';

    /* capa trasera */
    if (acc === 'capucha') ell(q, 0, -2, 61, 66, cd);
    else {
      if (hs === 'largo') {
        q.beginPath(); q.moveTo(-45, -24); q.bezierCurveTo(-52, 30, -48, 66, -30, 76); q.lineTo(30, 76);
        q.bezierCurveTo(48, 66, 52, 30, 45, -24); q.closePath(); q.fillStyle = hd; q.fill();
      }
      if (hs === 'coleta') { q.save(); q.translate(36, -24); q.rotate(0.5); ell(q, 8, 26, 13, 34, hd); q.restore(); }
      if (hs === 'rizos') for (let a = Math.PI * 0.85; a <= Math.PI * 2.15; a += 0.3) ell(q, Math.cos(a) * 45, -8 + Math.sin(a) * 48, 13, 13, hd);
      if (c.ropa === 'sudadera') ell(q, 0, 50, 52, 20, cd);
    }

    /* torso */
    let g = q.createLinearGradient(0, 56, 0, 150); g.addColorStop(0, cL); g.addColorStop(1, cd);
    q.beginPath(); q.moveTo(-98, 160); q.bezierCurveTo(-96, 96, -72, 66, -30, 58); q.lineTo(30, 58);
    q.bezierCurveTo(72, 66, 96, 96, 98, 160); q.closePath(); q.fillStyle = g; q.fill();

    /* cuello */
    q.fillStyle = sd; q.fillRect(-13, 24, 26, 40);
    ell(q, 0, 42, 13, 6, 'rgba(0,0,0,.18)');

    /* cuello de la prenda */
    if (c.ropa === 'sudadera') {
      q.beginPath(); q.moveTo(-34, 58); q.quadraticCurveTo(0, 96, 34, 58); q.lineWidth = 11; q.strokeStyle = cd; q.stroke();
      q.lineWidth = 2; q.strokeStyle = '#e9edf3';
      q.beginPath(); q.moveTo(-9, 78); q.lineTo(-11, 110); q.moveTo(9, 78); q.lineTo(11, 112); q.stroke();
      q.fillStyle = '#00e5ff'; q.fillRect(-13, 109, 4, 7); q.fillRect(9, 111, 4, 7);
    } else if (c.ropa === 'chaqueta') {
      q.beginPath(); q.moveTo(-26, 58); q.lineTo(0, 112); q.lineTo(26, 58); q.closePath(); q.fillStyle = '#0c0f16'; q.fill();
      q.font = 'bold 12px monospace'; q.fillStyle = '#00ff9c'; q.fillText('>_', -7, 92);
      q.fillStyle = cL;
      q.beginPath(); q.moveTo(-32, 58); q.lineTo(-4, 110); q.lineTo(-30, 108); q.lineTo(-48, 72); q.closePath(); q.fill();
      q.beginPath(); q.moveTo(32, 58); q.lineTo(4, 110); q.lineTo(30, 108); q.lineTo(48, 72); q.closePath(); q.fill();
      ell(q, -32, 88, 3.2, 3.2, '#ff3bd4');
    } else {
      q.beginPath(); q.moveTo(-24, 58); q.quadraticCurveTo(0, 78, 24, 58); q.lineWidth = 5; q.strokeStyle = cd; q.stroke();
      q.font = 'bold 14px monospace'; q.fillStyle = '#00ff9c'; q.fillText('>_', 26, 106);
    }
    /* luz de borde neón */
    q.beginPath(); q.moveTo(30, 58); q.bezierCurveTo(72, 66, 96, 96, 98, 160); q.lineWidth = 2.2; q.strokeStyle = 'rgba(0,229,255,.6)'; q.stroke();
    q.beginPath(); q.moveTo(-30, 58); q.bezierCurveTo(-72, 66, -96, 96, -98, 160); q.lineWidth = 2; q.strokeStyle = 'rgba(255,59,212,.35)'; q.stroke();

    /* orejas */
    ell(q, -38, 6, 7, 11, sd); ell(q, 38, 6, 7, 11, sd); ell(q, -38, 6, 3.5, 6, sdd); ell(q, 38, 6, 3.5, 6, sdd);

    /* cabeza */
    g = q.createRadialGradient(-12, -18, 6, 0, 0, 54); g.addColorStop(0, sl); g.addColorStop(0.7, skin); g.addColorStop(1, sd);
    q.beginPath(); q.moveTo(-37, -6); q.bezierCurveTo(-38, 30, -22, 47, 0, 48); q.bezierCurveTo(22, 47, 38, 30, 37, -6);
    q.bezierCurveTo(37, -40, 20, -50, 0, -50); q.bezierCurveTo(-20, -50, -37, -40, -37, -6); q.closePath(); q.fillStyle = g; q.fill();
    ell(q, -22, 19, 7, 4, 'rgba(230,90,90,.13)'); ell(q, 22, 19, 7, 4, 'rgba(230,90,90,.13)');

    /* barba */
    if (c.barba === 'barba') {
      q.beginPath(); q.moveTo(-36, 4); q.bezierCurveTo(-36, 30, -22, 51, 0, 52); q.bezierCurveTo(22, 51, 36, 30, 36, 4);
      q.bezierCurveTo(32, 22, 22, 36, 0, 37); q.bezierCurveTo(-22, 36, -32, 22, -36, 4); q.closePath();
      q.globalAlpha = 0.93; q.fillStyle = hair; q.fill(); q.globalAlpha = 1;
    } else if (c.barba === 'perilla') ell(q, 0, 42, 9, 7, hair);

    /* ojos */
    const ey = 2;
    for (const s of [-1, 1]) {
      const ex = s * 15;
      if (o.blink) {
        q.beginPath(); q.moveTo(ex - 8, ey); q.quadraticCurveTo(ex, ey + 3, ex + 8, ey); q.lineWidth = 2; q.strokeStyle = sdd; q.stroke();
      } else {
        ell(q, ex, ey, 8, 5.6, '#f8f5f2');
        ell(q, ex + look * 2, ey + 0.5, 4.3, 4.3, c.ojos);
        ell(q, ex + look * 2, ey + 0.5, 2, 2, '#0a0a0a');
        ell(q, ex + look * 2 + 1.5, ey - 1, 1.2, 1.2, '#fff');
        q.beginPath(); q.moveTo(ex - 8.6, ey - 1); q.quadraticCurveTo(ex, ey - 8.5, ex + 8.6, ey - 1); q.lineWidth = 1.9; q.strokeStyle = sdd; q.stroke();
      }
    }
    /* cejas (se levantan un poco al hablar) */
    const br = m > 0.15 ? -1.6 : 0;
    q.lineWidth = 3.8; q.strokeStyle = hd;
    for (const s of [-1, 1]) { q.beginPath(); q.moveTo(s * 7, -11 + br); q.quadraticCurveTo(s * 15, -15.5 + br, s * 23, -11 + br); q.stroke(); }
    /* nariz */
    q.beginPath(); q.moveTo(-1, 6); q.quadraticCurveTo(-5, 16, -3, 17); q.quadraticCurveTo(0, 19.5, 4, 17);
    q.lineWidth = 1.7; q.strokeStyle = sdd; q.stroke();

    /* boca */
    const my = 28;
    if (m < 0.08) {
      q.beginPath(); q.moveTo(-9, my); q.quadraticCurveTo(0, my + 5, 9, my); q.lineWidth = 2.5; q.strokeStyle = shade(skin, -0.45); q.stroke();
    } else {
      const rx = 7 + m * 3, ry = 1.6 + m * 6.2, cy = my + ry * 0.4;
      q.save(); q.beginPath(); q.ellipse(0, cy, rx, ry, 0, 0, Math.PI * 2); q.fillStyle = '#3a0d16'; q.fill(); q.clip();
      q.fillStyle = '#f3f1ee'; q.fillRect(-rx, cy - ry, rx * 2, Math.min(3.2, ry * 0.6));
      ell(q, 0, cy + ry * 0.75, rx * 0.7, ry * 0.55, '#d25a6e'); q.restore();
      q.beginPath(); q.ellipse(0, cy, rx, ry, 0, 0, Math.PI * 2); q.lineWidth = 1.6; q.strokeStyle = shade(skin, -0.4); q.stroke();
    }
    if (c.barba !== 'ninguno') {
      q.beginPath(); q.moveTo(-13, my - 1); q.quadraticCurveTo(-6, my - 9, 0, my - 6); q.quadraticCurveTo(6, my - 9, 13, my - 1);
      q.quadraticCurveTo(6, my - 4, 0, my - 3); q.quadraticCurveTo(-6, my - 4, -13, my - 1); q.closePath(); q.fillStyle = hair; q.fill();
    }

    hairFront(q, hs, hair, hd, hl);

    /* luz de borde en la cabeza */
    q.beginPath(); q.arc(0, -4, 47, -1.1, 0.8); q.lineWidth = 2; q.strokeStyle = 'rgba(0,229,255,.32)'; q.stroke();

    accessory(q, acc, cl, cd, cL, t);
    q.restore();
  }

  function hairFront(q, hs, col, hd, hl) {
    const g = q.createLinearGradient(-30, -64, 30, 0); g.addColorStop(0, hl); g.addColorStop(0.5, col); g.addColorStop(1, hd);
    const skull = () => { q.moveTo(-38, -4); q.bezierCurveTo(-40, -38, -20, -52, 0, -52); q.bezierCurveTo(20, -52, 40, -38, 38, -4); q.bezierCurveTo(34, -20, 20, -28, 0, -28); q.bezierCurveTo(-20, -28, -34, -20, -38, -4); q.closePath(); };
    q.fillStyle = g; q.beginPath();
    switch (hs) {
      case 'rapado': q.globalAlpha = 0.78; skull(); break;
      case 'cresta':
        q.globalAlpha = 0.5; skull(); q.fill(); q.globalAlpha = 1; q.fillStyle = g; q.beginPath();
        q.moveTo(-12, -30); q.lineTo(-15, -56); q.lineTo(-8, -50); q.lineTo(-6, -78); q.lineTo(0, -56); q.lineTo(4, -86);
        q.lineTo(8, -56); q.lineTo(14, -74); q.lineTo(14, -50); q.lineTo(19, -58); q.lineTo(13, -30); q.closePath(); break;
      case 'coleta':
        q.moveTo(-38, -2); q.bezierCurveTo(-42, -42, -20, -56, 0, -56); q.bezierCurveTo(20, -56, 42, -42, 38, -2);
        q.bezierCurveTo(34, -22, 18, -30, 0, -30); q.bezierCurveTo(-18, -30, -34, -22, -38, -2); q.closePath(); break;
      case 'rizos':
        q.moveTo(-40, 0); q.bezierCurveTo(-46, -44, -20, -60, 0, -58); q.bezierCurveTo(20, -60, 46, -44, 40, 0);
        q.bezierCurveTo(34, -20, 20, -26, 0, -24); q.bezierCurveTo(-20, -26, -34, -20, -40, 0); q.closePath(); break;
      case 'largo':
        q.moveTo(-42, 48); q.bezierCurveTo(-48, -30, -26, -58, 0, -57); q.bezierCurveTo(26, -58, 48, -30, 42, 48); q.lineTo(34, 48);
        q.bezierCurveTo(36, 10, 30, -18, 4, -32); q.lineTo(-2, -32); q.bezierCurveTo(-26, -20, -36, 10, -34, 48); q.closePath(); break;
      case 'flequillo':
        q.moveTo(-39, 4); q.bezierCurveTo(-46, -40, -22, -60, 2, -58); q.bezierCurveTo(30, -58, 48, -36, 40, 2); q.lineTo(40, 15);
        q.bezierCurveTo(30, 4, 18, -2, 6, -8); q.bezierCurveTo(-8, -14, -22, -18, -34, -10); q.closePath(); break;
      default: /* corto */
        q.moveTo(-39, 2); q.bezierCurveTo(-46, -40, -22, -60, 2, -58); q.bezierCurveTo(30, -58, 48, -38, 39, 2);
        q.lineTo(36, -12); q.lineTo(30, -24); q.lineTo(22, -19); q.lineTo(14, -28); q.lineTo(4, -21); q.lineTo(-6, -29);
        q.lineTo(-16, -21); q.lineTo(-26, -26); q.lineTo(-33, -12); q.closePath();
    }
    q.fill(); q.globalAlpha = 1;
    if (hs === 'rizos') for (let a = Math.PI * 1.06; a <= Math.PI * 1.95; a += 0.22) { ell(q, Math.cos(a) * 38, -14 + Math.sin(a) * 40, 9, 9, col); ell(q, Math.cos(a) * 38 - 2, -16 + Math.sin(a) * 40, 3, 3, hl); }
    if (hs === 'coleta') { q.fillStyle = '#ff3bd4'; q.fillRect(34, -26, 6, 5); }
    if (hs === 'corto' || hs === 'largo' || hs === 'flequillo') {
      q.strokeStyle = 'rgba(255,255,255,.14)'; q.lineWidth = 1.3; q.beginPath();
      q.moveTo(-18, -50); q.quadraticCurveTo(-10, -40, -12, -28); q.moveTo(10, -54); q.quadraticCurveTo(18, -44, 20, -30); q.stroke();
    }
  }

  function accessory(q, acc, cl, cd, cL, t) {
    let g;
    switch (acc) {
      case 'gafas':
        q.lineWidth = 2.6; q.strokeStyle = '#14161c'; q.fillStyle = 'rgba(0,229,255,.12)';
        for (const s of [-1, 1]) { q.beginPath(); rrp(q, s * 15 - 11, -6, 22, 15, 5); q.fill(); q.stroke(); }
        q.beginPath(); q.moveTo(-4, 0); q.quadraticCurveTo(0, -3, 4, 0); q.moveTo(-26, -2); q.lineTo(-37, -4); q.moveTo(26, -2); q.lineTo(37, -4); q.stroke();
        q.strokeStyle = 'rgba(255,255,255,.4)'; q.lineWidth = 1.2; q.beginPath(); q.moveTo(-22, -3); q.lineTo(-17, -3); q.moveTo(8, -3); q.lineTo(13, -3); q.stroke();
        break;
      case 'visor':
        q.save(); q.shadowColor = '#00e5ff'; q.shadowBlur = 16;
        g = q.createLinearGradient(-42, 0, 42, 0); g.addColorStop(0, 'rgba(0,229,255,.8)'); g.addColorStop(0.5, 'rgba(140,250,255,.92)'); g.addColorStop(1, 'rgba(0,229,255,.8)');
        q.fillStyle = g; q.beginPath(); rrp(q, -42, -9, 84, 19, 9); q.fill(); q.restore();
        q.fillStyle = 'rgba(255,255,255,.7)'; q.fillRect(-38 + ((t * 1.2) % 74), -8, 3, 17);
        q.fillStyle = 'rgba(5,20,30,.6)'; q.fillRect(-42, -1, 84, 1.3);
        break;
      case 'auriculares':
        q.lineWidth = 7; q.strokeStyle = '#161b2a'; q.beginPath(); q.arc(0, -4, 50, Math.PI * 1.04, Math.PI * 1.96); q.stroke();
        q.lineWidth = 1.6; q.strokeStyle = '#00e5ff'; q.beginPath(); q.arc(0, -4, 53, Math.PI * 1.12, Math.PI * 1.88); q.stroke();
        for (const s of [-1, 1]) { q.beginPath(); rrp(q, s > 0 ? 36 : -51, -9, 15, 30, 6); q.fillStyle = '#161b2a'; q.fill(); q.strokeStyle = '#ff3bd4'; q.lineWidth = 2; q.stroke(); }
        break;
      case 'gorra':
        q.beginPath(); q.moveTo(-43, -16); q.bezierCurveTo(-46, -64, 46, -64, 43, -16); q.closePath(); q.fillStyle = '#141a2e'; q.fill();
        q.strokeStyle = '#00e5ff'; q.lineWidth = 2; q.beginPath(); q.moveTo(-42, -22); q.quadraticCurveTo(0, -30, 42, -22); q.stroke();
        ell(q, 0, -16, 47, 8, '#0b0f1c');
        q.font = 'bold 12px monospace'; q.fillStyle = '#00ff9c'; q.fillText('>_', -8, -36);
        break;
      case 'capucha':
        g = q.createLinearGradient(-60, -60, 60, 60); g.addColorStop(0, cL); g.addColorStop(1, cd);
        q.beginPath(); q.ellipse(0, -2, 61, 66, 0, 0, Math.PI * 2); q.moveTo(40, 6); q.ellipse(0, 6, 40, 52, 0, 0, Math.PI * 2);
        q.fillStyle = g; q.fill('evenodd');
        q.strokeStyle = 'rgba(0,0,0,.45)'; q.lineWidth = 5; q.beginPath(); q.ellipse(0, 6, 41, 53, 0, Math.PI * 1.05, Math.PI * 1.95); q.stroke();
        q.strokeStyle = 'rgba(0,229,255,.55)'; q.lineWidth = 2; q.beginPath(); q.ellipse(0, -2, 61, 66, 0, -1.2, 0.6); q.stroke();
        break;
    }
  }

  /* ---------- SPRITE ----------
     Origen = pies. Mide ~58 unidades de alto. dir: down | up | side. */
  function sprite(q, cfg, o) {
    o = o || {};
    const c = norm(cfg), dir = o.dir || 'down', ph = o.phase || 0, mv = !!o.moving;
    const s = mv ? Math.sin(ph) : 0, bob = mv ? Math.abs(Math.cos(ph)) * 1.4 : 0;
    const skin = c.piel, hair = c.peloColor, hl = shade(hair, 0.2), cl = c.ropaColor, cd = shade(cl, -0.38), cL = shade(cl, 0.18);
    const pants = '#1a2038', acc = c.accesorio, hs = c.peloEstilo;
    q.save(); if (o.flip) q.scale(-1, 1); q.translate(0, -bob); q.lineCap = 'round';

    /* piernas */
    if (dir === 'side') {
      rrf(q, -4 - s * 4, -17, 7, 17, 2, shade(pants, -0.25)); rrf(q, -3 + s * 4, -17, 7, 17, 2, pants);
      rrf(q, -4 - s * 4, -4, 10, 4, 2, '#0b0f1a'); rrf(q, -3 + s * 4, -4, 10, 4, 2, '#0b0f1a');
      q.fillStyle = '#00e5ff'; q.fillRect(-3 + s * 4, -2, 9, 1.2);
    } else {
      const l = -17 - Math.max(0, s) * 3, r = -17 + Math.min(0, s) * 3;
      rrf(q, -7, l, 6, 17, 2, pants); rrf(q, 1, r, 6, 17, 2, pants);
      rrf(q, -8, l + 13, 8, 4, 2, '#0b0f1a'); rrf(q, 0, r + 13, 8, 4, 2, '#0b0f1a');
      q.fillStyle = '#00e5ff'; q.fillRect(-8, l + 15, 8, 1.2); q.fillRect(0, r + 15, 8, 1.2);
    }

    /* cuerpo y brazos */
    const bg = q.createLinearGradient(0, -38, 0, -14); bg.addColorStop(0, cL); bg.addColorStop(1, cd);
    if (dir === 'side') {
      rrf(q, -3 - s * 5, -35, 5, 16, 2.5, cd);
      rrf(q, -8, -38, 16, 24, 6, bg);
      rrf(q, -2 + s * 5, -35, 5, 16, 2.5, cL); ell(q, 0.5 + s * 5, -18.5, 2.7, 2.7, skin);
      if (c.ropa === 'sudadera') rrf(q, -9, -39, 9, 6, 3, cd);
    } else {
      rrf(q, -15, -35 + s * 2, 5, 16, 2.5, cd); rrf(q, 10, -35 - s * 2, 5, 16, 2.5, cd);
      ell(q, -12.5, -18.5 + s * 2, 2.7, 2.7, skin); ell(q, 12.5, -18.5 - s * 2, 2.7, 2.7, skin);
      rrf(q, -10, -38, 20, 24, 6, bg);
      if (dir === 'down') {
        if (c.ropa === 'sudadera') { rrf(q, -7, -39, 14, 4, 2, cd); q.strokeStyle = '#e9edf3'; q.lineWidth = 1; q.beginPath(); q.moveTo(-2.5, -35); q.lineTo(-3, -28); q.moveTo(2.5, -35); q.lineTo(3, -28); q.stroke(); }
        else if (c.ropa === 'chaqueta') { q.fillStyle = '#0c0f16'; q.beginPath(); q.moveTo(-5, -38); q.lineTo(0, -24); q.lineTo(5, -38); q.closePath(); q.fill(); }
        else { q.fillStyle = '#00ff9c'; q.fillRect(-4, -30, 2, 2); q.fillRect(-1, -30, 4, 1); }
      } else if (c.ropa === 'sudadera') ell(q, 0, -36, 8, 4, cd);
    }

    /* cabeza */
    const hy = -48;
    if (acc === 'capucha') ell(q, 0, hy, 12.6, 12.8, cd);
    ell(q, 0, hy, 10, 10.6, skin);
    if (dir === 'side') ell(q, -2, hy + 1, 2.2, 3.2, shade(skin, -0.18));

    /* pelo */
    q.fillStyle = hair;
    if (hs === 'largo') {
      if (dir === 'down') { rrf(q, -11.5, hy - 4, 4.5, 17, 2, hair); rrf(q, 7, hy - 4, 4.5, 17, 2, hair); }
      else if (dir === 'up') rrf(q, -10.5, hy, 21, 14, 4, hair);
      else rrf(q, -11, hy - 3, 9, 17, 3, hair);
    }
    if (hs === 'coleta' && dir !== 'down') ell(q, dir === 'up' ? 0 : -11, hy + 4, 3.5, 6, hair);
    q.globalAlpha = hs === 'rapado' ? 0.75 : hs === 'cresta' ? 0.55 : 1; q.fillStyle = hair; q.beginPath();
    if (dir === 'up') q.ellipse(0, hy, 10.7, 11, 0, 0, Math.PI * 2);
    else if (dir === 'side') { q.arc(0, hy, 10.7, Math.PI * 0.62, Math.PI * 1.92); q.lineTo(6, hy - 4); q.lineTo(-3, hy + 3); q.closePath(); }
    else { q.arc(0, hy, 10.8, Math.PI * 1.02, Math.PI * 1.98); q.lineTo(9, hy - 3); q.quadraticCurveTo(0, hy - 6.5, -9, hy - 3); q.closePath(); }
    q.fill(); q.globalAlpha = 1;
    if (hs === 'cresta') { q.fillStyle = hair; q.beginPath(); q.moveTo(-3, hy - 9); q.lineTo(-1, hy - 19); q.lineTo(2, hy - 12); q.lineTo(4, hy - 18); q.lineTo(4, hy - 9); q.closePath(); q.fill(); }
    if (hs === 'rizos') for (let a = Math.PI * 1.05; a < Math.PI * 1.98; a += 0.42) ell(q, Math.cos(a) * 10, hy + Math.sin(a) * 10, 3.6, 3.6, hair);
    if (hs === 'flequillo' && dir === 'down') { q.fillStyle = hair; q.beginPath(); q.moveTo(-9, hy - 4); q.lineTo(9, hy - 4); q.lineTo(8, hy + 1); q.closePath(); q.fill(); }
    if (hs !== 'rapado' && dir !== 'up') { q.fillStyle = hl; q.globalAlpha = 0.35; q.fillRect(-4, hy - 10, 5, 1.5); q.globalAlpha = 1; }

    /* cara */
    if (dir !== 'up' && acc !== 'visor') {
      const blink = o.blink;
      q.fillStyle = '#16121a';
      if (dir === 'down') {
        if (blink) { q.fillRect(-5, hy + 1, 3, 0.9); q.fillRect(2, hy + 1, 3, 0.9); }
        else { ell(q, -3.6, hy + 1, 1.4, 1.9, '#16121a'); ell(q, 3.6, hy + 1, 1.4, 1.9, '#16121a'); }
        q.fillStyle = shade(skin, -0.42); q.fillRect(-2, hy + 6, 4, 1);
      } else {
        if (blink) q.fillRect(4, hy + 1, 3, 0.9); else ell(q, 5.2, hy + 1, 1.4, 1.9, '#16121a');
        q.fillStyle = shade(skin, -0.42); q.fillRect(5, hy + 6, 3, 1);
      }
      if (c.barba !== 'ninguno') { q.fillStyle = hair; q.globalAlpha = 0.85; if (dir === 'down') q.fillRect(-4, hy + 5, 8, c.barba === 'barba' ? 5 : 2); else q.fillRect(2, hy + 5, 8, c.barba === 'barba' ? 5 : 2); q.globalAlpha = 1; }
    }

    /* accesorios */
    if (acc === 'visor' && dir !== 'up') {
      q.save(); q.shadowColor = '#00e5ff'; q.shadowBlur = 8;
      rrf(q, dir === 'down' ? -9 : 1, hy - 2, dir === 'down' ? 18 : 10, 5, 2, '#5ff2ff'); q.restore();
    }
    if (acc === 'gafas' && dir !== 'up') {
      q.strokeStyle = '#0d0f14'; q.lineWidth = 1.1;
      if (dir === 'down') { q.strokeRect(-6.2, hy - 1.2, 5, 4); q.strokeRect(1.2, hy - 1.2, 5, 4); }
      else q.strokeRect(3, hy - 1.2, 5, 4);
    }
    if (acc === 'auriculares') {
      q.strokeStyle = '#161b2a'; q.lineWidth = 2.4; q.beginPath();
      if (dir === 'side') { q.arc(0, hy, 11.4, Math.PI * 1.1, Math.PI * 1.9); q.stroke(); rrf(q, -4, hy - 3, 6, 8, 2, '#161b2a'); q.fillStyle = '#ff3bd4'; q.fillRect(-2, hy - 1, 2, 4); }
      else { q.arc(0, hy, 11.4, Math.PI * 1.05, Math.PI * 1.95); q.stroke(); rrf(q, -13, hy - 3, 4, 8, 2, '#161b2a'); rrf(q, 9, hy - 3, 4, 8, 2, '#161b2a'); q.fillStyle = '#ff3bd4'; q.fillRect(-12.5, hy, 1.4, 3); q.fillRect(11, hy, 1.4, 3); }
    }
    if (acc === 'gorra') {
      q.fillStyle = '#141a2e'; q.beginPath(); q.arc(0, hy - 1, 11, Math.PI, 0); q.closePath(); q.fill();
      q.fillStyle = '#00e5ff'; q.fillRect(-10, hy - 3, 20, 1);
      if (dir === 'down') ell(q, 0, hy - 1, 11.5, 2.6, '#0b0f1c');
      else if (dir === 'side') rrf(q, 4, hy - 3, 11, 3, 1.5, '#0b0f1c');
    }
    if (acc === 'capucha') {
      if (dir === 'up') ell(q, 0, hy, 12.6, 12.8, cd);
      else { q.strokeStyle = cL; q.lineWidth = 2.6; q.beginPath(); if (dir === 'down') q.arc(0, hy + 1, 11.4, Math.PI * 0.95, Math.PI * 2.05); else q.arc(0, hy + 1, 11.4, Math.PI * 0.8, Math.PI * 1.8); q.stroke(); }
    }
    q.restore();
  }

  window.AVATAR = { OPC, DEF, norm, random, portrait, sprite, shade };
})();
