/* DesignMaxxing film engine.
   Every film is a deterministic function of time: window.seek(t) puts every element where it
   belongs at second t. render.mjs captures frames with a headless browser and encodes them
   with ffmpeg. No transitions, no timers, no randomness that is not seeded.
   Art is made in code: engraving-style contour lines, pattern fields, silk lines, pixel dissolves. */
(function () {
  var F = (window.F = {});
  F.W = 1440; F.H = 900;
  F.clamp = function (x, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return Math.max(a, Math.min(b, x)); };
  F.seg = function (t, a, b) { return F.clamp((t - a) / (b - a)); };
  F.lerp = function (a, b, t) { return a + (b - a) * t; };
  F.ease = {
    inOut: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    out: function (t) { return 1 - Math.pow(1 - t, 3); },
    outExpo: function (t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); },
    back: function (t) { var c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    smooth: function (t) { return t * t * (3 - 2 * t); }
  };
  F.e = function (t, a, b, kind) { return F.ease[kind || 'inOut'](F.seg(t, a, b)); };
  function hex(c) { c = c.replace('#', ''); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; }
  F.mix = function (a, b, t) { var A = hex(a), B = hex(b); return 'rgb(' + A.map(function (v, i) { return Math.round(v + (B[i] - v) * t); }).join(',') + ')'; };
  F.rand = function (seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

  /* ---------- DOM helpers ---------- */
  F.el = function (parent, tag, cls, css) { var e = document.createElement(tag); if (cls) e.className = cls; if (css) e.style.cssText = css; parent.appendChild(e); return e; };
  F.img = function (parent, src, cls, css) { var i = F.el(parent, 'img', cls, css); i.src = src; i.alt = ''; return i; };
  F.box = function (el, x, y, w, h) { el.style.left = x + 'px'; el.style.top = y + 'px'; if (w !== undefined) el.style.width = w + 'px'; if (h !== undefined) el.style.height = h + 'px'; };
  F.show = function (el, o, tf) { el.style.opacity = o; el.style.visibility = o <= 0.001 ? 'hidden' : 'visible'; if (tf !== undefined) el.style.transform = tf; };
  F.canvas = function (parent, w, h, css) {
    var c = F.el(parent, 'canvas', '', css || 'position:absolute;left:0;top:0;width:100%;height:100%');
    c.width = w || F.W; c.height = h || F.H; return c.getContext('2d');
  };
  F.type = function (text, t, a, b) { return text.slice(0, Math.round(text.length * F.seg(t, a, b))); };

  /* ---------- art: engraving-style contour lines, masked into a soft blob ---------- */
  F.engrave = function (ctx, t, o) {
    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = o.color; ctx.lineWidth = o.lw || 1;
    var sp = o.spacing || 8, amp = o.amp || 28, W = ctx.canvas.width, H = ctx.canvas.height, k = o.speed === undefined ? 1 : o.speed;
    for (var y = -60; y < H + 60; y += sp) {
      ctx.globalAlpha = (o.alpha || 0.3) * (0.5 + 0.5 * Math.sin(y * 0.027 + t * 0.3 * k));
      ctx.beginPath();
      for (var x = -10; x <= W + 10; x += 9) {
        var yy = y + amp * (Math.sin(x * 0.0042 + y * 0.006 + t * 0.25 * k) + 0.6 * Math.sin(x * 0.011 - y * 0.004 - t * 0.18 * k) + 0.35 * Math.sin((x + y) * 0.019 + t * 0.4 * k));
        if (x === -10) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    // cross-hatching in the "shadow" bands, the way engravings build tone
    ctx.globalAlpha = (o.alpha || 0.3) * 0.7;
    for (var y2 = 0; y2 < H; y2 += 22) {
      for (var x2 = 0; x2 < W; x2 += 22) {
        var v = Math.sin(x2 * 0.006 + t * 0.2 * k) + Math.cos(y2 * 0.008 - t * 0.15 * k) + Math.sin((x2 - y2) * 0.004);
        if (v > 1.15) { ctx.beginPath(); ctx.moveTo(x2, y2 + 10); ctx.lineTo(x2 + 10, y2); ctx.moveTo(x2 + 6, y2 + 14); ctx.lineTo(x2 + 14, y2 + 6); ctx.stroke(); }
      }
    }
    ctx.globalAlpha = 1;
    if (o.mask) {
      ctx.globalCompositeOperation = 'destination-in';
      var g = ctx.createRadialGradient(o.mask.x, o.mask.y, 0, o.mask.x, o.mask.y, o.mask.r);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.6, 'rgba(0,0,0,.7)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  };

  /* ---------- art: pattern fields ---------- */
  F.pattern = function (ctx, t, o, keep) {
    ctx.save();
    if (!keep) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalAlpha = o.alpha === undefined ? 0.25 : o.alpha;
    ctx.fillStyle = o.color; ctx.strokeStyle = o.color; ctx.lineWidth = o.lw || 1.4;
    var g = o.gap || 40, ox = ((t * (o.vx || 6)) % g + g) % g, oy = ((t * (o.vy || 0)) % g + g) % g, W = ctx.canvas.width, H = ctx.canvas.height, r = o.r || 2.2;
    for (var row = -1, y = -g; y < H + g; y += g, row++) {
      for (var x = -g; x < W + g; x += g) {
        var X = x + ox + (o.stagger && row % 2 ? g / 2 : 0), Y = y + oy;
        if (o.kind === 'dots') { ctx.beginPath(); ctx.arc(X, Y, r, 0, 6.3); ctx.fill(); }
        else if (o.kind === 'diamonds') { ctx.beginPath(); ctx.moveTo(X, Y - r * 2.4); ctx.lineTo(X + r * 1.6, Y); ctx.lineTo(X, Y + r * 2.4); ctx.lineTo(X - r * 1.6, Y); ctx.closePath(); ctx.stroke(); }
        else if (o.kind === 'plus') { ctx.beginPath(); ctx.moveTo(X - r * 2, Y); ctx.lineTo(X + r * 2, Y); ctx.moveTo(X, Y - r * 2); ctx.lineTo(X, Y + r * 2); ctx.stroke(); }
        else if (o.kind === 'brackets') { var s = r * 2.6; ctx.beginPath(); ctx.moveTo(X - s + 3, Y - s); ctx.lineTo(X - s, Y - s); ctx.lineTo(X - s, Y + s); ctx.lineTo(X - s + 3, Y + s); ctx.moveTo(X + s - 3, Y - s); ctx.lineTo(X + s, Y - s); ctx.lineTo(X + s, Y + s); ctx.lineTo(X + s - 3, Y + s); ctx.stroke(); }
      }
    }
    ctx.restore();
  };

  /* ---------- art: silk lines (the hero motif) ---------- */
  var STOPS = [[220, 243, 107], [255, 157, 61], [255, 111, 177], [47, 85, 255]];
  function stopCol(u, a) {
    var s = F.clamp(u, 0, 0.999) * (STOPS.length - 1), i = Math.floor(s), f = s - i, A = STOPS[i], B = STOPS[i + 1];
    return 'rgba(' + Math.round(F.lerp(A[0], B[0], f)) + ',' + Math.round(F.lerp(A[1], B[1], f)) + ',' + Math.round(F.lerp(A[2], B[2], f)) + ',' + a + ')';
  }
  F.silk = function (ctx, t, o) {
    var W = ctx.canvas.width, H = ctx.canvas.height, N = o.n || 90, M = 70, m = Math.min(W, H);
    ctx.clearRect(0, 0, W, H);
    var dx = o.x1 - o.x0, dy = o.y1 - o.y0, L = Math.sqrt(dx * dx * W * W + dy * dy * H * H) || 1, nx = -(dy * H) / L, ny = (dx * W) / L, ph = t * 0.5;
    ctx.lineWidth = o.lw || 1.1;
    for (var i = 0; i < N; i++) {
      var u = i / (N - 1); ctx.beginPath();
      for (var j = 0; j <= M; j++) {
        var s = j / M;
        var cx = W * (o.x0 + dx * s) + Math.sin(s * 5.2 + ph * 0.7) * W * 0.045;
        var cy = H * (o.y0 + dy * s) + Math.cos(s * 4.1 + ph * 0.55) * H * 0.1;
        var wf = (o.wid || 0.55) * (0.28 + 0.72 * Math.pow(Math.abs(Math.sin(s * Math.PI * 1.35 + ph * 0.45 + 0.6)), 1.3));
        var off = (u - 0.5) * wf * m + Math.sin(u * 6.2 + s * 9 + ph) * 3;
        if (j) ctx.lineTo(cx + nx * off, cy + ny * off); else ctx.moveTo(cx + nx * off, cy + ny * off);
      }
      ctx.strokeStyle = stopCol(u, o.a || 0.5); ctx.stroke();
    }
  };

  /* ---------- images drawn into canvases (cover, anchored) and pixel dissolves ---------- */
  F.cover = function (img, w, h, ax, ay) {
    var iw = img.naturalWidth, ih = img.naturalHeight, s = Math.max(w / iw, h / ih), dw = iw * s, dh = ih * s;
    var x = (w - dw) * (ax === undefined ? 0.5 : ax), y = (h - dh) * (ay === undefined ? 0 : ay);
    return { x: x, y: y, w: dw, h: dh, map: function (u, v) { return [x + u * dw, y + v * dh]; } };
  };
  var tmp = document.createElement('canvas'), tctx = tmp.getContext('2d');
  F.drawPixel = function (ctx, img, w, h, block, ax, ay) {
    var c = F.cover(img, w, h, ax, ay);
    ctx.clearRect(0, 0, w, h);
    if (block <= 1.01) { ctx.imageSmoothingEnabled = true; ctx.drawImage(img, c.x, c.y, c.w, c.h); return c; }
    var sw = Math.max(1, Math.ceil(w / block)), sh = Math.max(1, Math.ceil(h / block));
    tmp.width = sw; tmp.height = sh; tctx.imageSmoothingEnabled = true;
    tctx.drawImage(img, c.x / block, c.y / block, c.w / block, c.h / block);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(tmp, 0, 0, sw * block, sh * block);
    return c;
  };
  /* swap A -> B through a pixel mosaic: blocks grow, the image swaps at the peak, blocks shrink */
  F.pixelSwap = function (ctx, A, B, w, h, p, ax, ay) {
    var peak = Math.sin(Math.PI * F.clamp(p));
    var block = 1 + Math.round(peak * peak * 46);
    return F.drawPixel(ctx, p < 0.5 ? A : B, w, h, block, ax, ay);
  };

  /* ---------- shared bits: grain overlay and a cursor ---------- */
  F.grain = function (parent, alpha) {
    F.el(parent, 'div', '', 'position:absolute;inset:0;pointer-events:none;z-index:50;opacity:' + (alpha || 0.07) + ";background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")");
  };
  F.cursor = function (parent) {
    var c = F.el(parent, 'div', 'cursor', 'position:absolute;z-index:40;width:30px;height:30px;transform-origin:4px 4px');
    c.innerHTML = "<svg viewBox='0 0 24 24' width='30' height='30'><path d='M4 3l14 7-6 2-2 6z' fill='#0a0b0d' stroke='#fff' stroke-width='1.6' stroke-linejoin='round'/></svg>";
    var ring = F.el(parent, 'div', '', 'position:absolute;z-index:39;width:60px;height:60px;margin:-30px 0 0 -30px;border-radius:50%;border:2px solid #2f55ff;opacity:0');
    return { el: c, ring: ring };
  };
  F.click = function (cur, x, y, t, tc) {
    var down = F.seg(t, tc - 0.08, tc) * (1 - F.seg(t, tc + 0.05, tc + 0.18));
    cur.el.style.left = x + 'px'; cur.el.style.top = y + 'px'; cur.el.style.transform = 'scale(' + (1 - 0.15 * down) + ')';
    var r = F.seg(t, tc, tc + 0.6);
    cur.ring.style.left = (x + 4) + 'px'; cur.ring.style.top = (y + 4) + 'px';
    cur.ring.style.opacity = r > 0 && r < 1 ? (1 - r) * 0.9 : 0; cur.ring.style.transform = 'scale(' + (0.3 + r * 1.2) + ')';
  };

  /* ---------- boot: wait for fonts and images, then expose seek ---------- */
  F.boot = function (duration, render) {
    window.DURATION = duration;
    window.seek = function (t) { render(Math.max(0, Math.min(duration, t))); };
    var imgs = Array.prototype.slice.call(document.images);
    window.ready = Promise.all([document.fonts ? document.fonts.ready : Promise.resolve()].concat(imgs.map(function (i) { return i.decode ? i.decode().catch(function () {}) : Promise.resolve(); })))
      .then(function () { render(0); return true; });
    var q = new URLSearchParams(location.search);
    if (q.has('t')) window.ready.then(function () { render(parseFloat(q.get('t'))); });
    else if (q.has('play')) window.ready.then(function () { var t0 = performance.now(); (function loop() { render(((performance.now() - t0) / 1000) % duration); requestAnimationFrame(loop); })(); });
  };
})();
