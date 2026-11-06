(function () {
  'use strict';

  var root = document.querySelector('.rootx');
  if (!root) { return; }

  var state = { dark: true, active: 0, open: 0, nav: true };

  /* Every control in the markup carries data-act; features register here. */
  var acts = {};
  function on(name, fn) { acts[name] = fn; }
  root.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el) { return; }
    var fn = acts[el.getAttribute('data-act')];
    if (fn) { fn(el); }
  });

  /* ------------------------------------------------ kinetic grid canvas --- */

  var canvas = document.getElementById('kgcanvas');
  var mouse = { x: -9999, y: -9999 };
  var target = { x: -9999, y: -9999 };
  var ripples = [];
  var size = { w: 0, h: 0 };

  function warp(gx, gy, col, row, cols, rows) {
    var INFLUENCE = 260, MAXWARP = 24;
    var em = 1.5;
    var colPin = Math.min(col / em, (cols - 1 - col) / em, 1);
    var rowPin = Math.min(row / em, (rows - 1 - row) / em, 1);
    var pin = colPin * colPin * rowPin * rowPin;

    var dx = gx - mouse.x;
    var dy = gy - mouse.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var proximity = Math.max(0, 1 - dist / INFLUENCE) * pin;

    var rx = 0, ry = 0;
    for (var i = 0; i < ripples.length; i++) {
      var r = ripples[i];
      var rdx = gx - r.x, rdy = gy - r.y;
      var rdist = Math.sqrt(rdx * rdx + rdy * rdy);
      var waveWidth = 55;
      var diff = rdist - r.radius;
      if (Math.abs(diff) < waveWidth) {
        var strength = (1 - Math.abs(diff) / waveWidth) * r.opacity * 18 * pin;
        var rangle = Math.atan2(rdy, rdx);
        var sign = diff < 0 ? -1 : 1;
        rx += Math.cos(rangle) * strength * sign * -1;
        ry += Math.sin(rangle) * strength * sign * -1;
      }
    }

    if (dist < INFLUENCE && dist > 0 && pin > 0) {
      var t = dist / INFLUENCE;
      var eased = t < 0.01 ? 0 : (1 - t) * (1 - t) * Math.min(1, dist / 60);
      var amt = eased * MAXWARP * pin;
      var angle = Math.atan2(dy, dx);
      return { x: gx - Math.cos(angle) * amt + rx, y: gy - Math.sin(angle) * amt + ry, p: proximity };
    }
    return { x: gx + rx, y: gy + ry, p: proximity };
  }

  function draw(now) {
    if (!canvas) { return; }
    var ctx = canvas.getContext('2d');
    if (!ctx) { return; }
    var W = size.w, H = size.h;
    var dark = state.dark;

    var theme = dark
      ? { bg: '#161618', dotTex: 'rgba(255,255,255,0.06)',
          lineBase: [255, 255, 255, 0.19], lineActive: [74, 158, 255, 0.95],
          nodeBase: [255, 255, 255, 0.30], nodeActive: [74, 158, 255, 1.0],
          glow: '74,158,255', ripple: '100,180,255' }
      : { bg: '#EDEFEF', dotTex: 'rgba(21,24,23,0.08)',
          lineBase: [21, 24, 23, 0.19], lineActive: [46, 91, 186, 0.9],
          nodeBase: [21, 24, 23, 0.30], nodeActive: [46, 91, 186, 1.0],
          glow: '46,91,186', ripple: '46,91,186' };

    var mix = function (a, b, t) {
      var r = Math.round(a[0] + (b[0] - a[0]) * t);
      var g = Math.round(a[1] + (b[1] - a[1]) * t);
      var bl = Math.round(a[2] + (b[2] - a[2]) * t);
      var al = a[3] + (b[3] - a[3]) * t;
      return 'rgba(' + r + ',' + g + ',' + bl + ',' + al.toFixed(3) + ')';
    };

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = theme.dotTex;
    for (var x = 14; x < W; x += 28) {
      for (var y = 14; y < H; y += 28) {
        ctx.beginPath();
        ctx.arc(x, y, 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (var i = ripples.length - 1; i >= 0; i--) {
      var rp = ripples[i];
      var age = (now - rp.born) / 1000;
      rp.radius = Math.max(0, age * 400);
      rp.opacity = Math.max(0, 1 - age * 1.2);
      if (rp.opacity <= 0) { ripples.splice(i, 1); }
    }

    var CELL = 55;
    var cols = Math.max(2, Math.ceil(W / CELL)) + 1;
    var rows = Math.max(2, Math.ceil(H / CELL)) + 1;
    var cellW = W / (cols - 1);
    var cellH = H / (rows - 1);

    var pts = [];
    for (var row = 0; row < rows; row++) {
      pts[row] = [];
      for (var col = 0; col < cols; col++) {
        pts[row][col] = warp(col * cellW, row * cellH, col, row, cols, rows);
      }
    }

    ctx.lineCap = 'butt';
    var seg = function (p1, p2) {
      var avg = (p1.p + p2.p) / 2;
      var t = avg * avg * (3 - 2 * avg);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = mix(theme.lineBase, theme.lineActive, t);
      ctx.lineWidth = 0.8 + 0.7 * t;
      ctx.stroke();
    };
    for (var row2 = 0; row2 < rows; row2++) {
      for (var col2 = 0; col2 < cols - 1; col2++) { seg(pts[row2][col2], pts[row2][col2 + 1]); }
    }
    for (var col3 = 0; col3 < cols; col3++) {
      for (var row3 = 0; row3 < rows - 1; row3++) { seg(pts[row3][col3], pts[row3 + 1][col3]); }
    }

    for (var row4 = 0; row4 < rows; row4++) {
      for (var col4 = 0; col4 < cols; col4++) {
        var p = pts[row4][col4];
        var tn = p.p * p.p * (3 - 2 * p.p);
        var rad = 1.8 + 1.4 * tn;
        if (tn > 0.3) {
          var glowR = rad + 6 * ((tn - 0.3) / 0.7);
          var grd = ctx.createRadialGradient(p.x, p.y, rad * 0.5, p.x, p.y, glowR);
          grd.addColorStop(0, 'rgba(' + theme.glow + ',' + (tn * 0.3).toFixed(3) + ')');
          grd.addColorStop(1, 'rgba(' + theme.glow + ',0)');
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = mix(theme.nodeBase, theme.nodeActive, tn);
        ctx.fill();
      }
    }

    for (var k = 0; k < ripples.length; k++) {
      var rr = ripples[k];
      ctx.beginPath();
      ctx.arc(rr.x, rr.y, Math.max(0, rr.radius), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(' + theme.ripple + ',' + (rr.opacity * 0.28).toFixed(3) + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  if (canvas) {
    var setSize = function () {
      var w = window.innerWidth;
      var h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      size = { w: w, h: h };
    };
    setSize();
    window.addEventListener('resize', setSize);
    window.addEventListener('mousemove', function (e) { target = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('click', function (e) {
      ripples.push({ x: e.clientX, y: e.clientY, radius: 0, opacity: 1, born: performance.now() });
    });

    var animate = function (now) {
      mouse.x = mouse.x + (target.x - mouse.x) * 0.08;
      mouse.y = mouse.y + (target.y - mouse.y) * 0.08;
      draw(now);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  /* ------------------------------------------------------------- drawer --- */

  var drawer = root.querySelector('.drawer');

  var HANDLE =
    '<button class="handle thin" type="button" data-act="openNav" aria-label="Open navigation">' +
    '<span class="pulse" aria-hidden="true"></span>' +
    '<svg class="harrow" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">' +
    '<path d="M6 3.2 10.8 8 6 12.8" fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round"></path></svg></button>';

  function syncNav() {
    var open = state.nav;
    if (drawer) {
      drawer.style.transform = 'translateY(-50%) translateX(' + (open ? '0px' : '-130px') + ')';
      drawer.style.opacity = open ? '1' : '0';
    }
    var handle = root.querySelector('.handle');
    if (open) {
      if (handle) { handle.remove(); }
    } else if (!handle && canvas) {
      canvas.insertAdjacentHTML('afterend', HANDLE);
    }
  }

  on('closeNav', function () { state.nav = false; syncNav(); });
  on('openNav', function () { state.nav = true; syncNav(); });

  /* Clicking away closes the drawer. This listens for the click rather than
     covering the page with an overlay to catch it, so the click still reaches
     whatever sits under it: the first click on Email opens the mail client
     instead of being spent dismissing the drawer. */
  document.addEventListener('click', function (e) {
    if (!state.nav) { return; }
    if (drawer && drawer.contains(e.target)) { return; }
    if (e.target.closest && e.target.closest('.handle')) { return; }
    state.nav = false;
    syncNav();
  });

  syncNav();

  /* ---------------------------------------------------------- nav dots --- */

  function syncNodes() {
    var nodes = root.querySelectorAll('.node');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].classList.toggle('on', state.active === i);
    }
  }

  on('pick', function (el) {
    state.active = Array.prototype.indexOf.call(root.querySelectorAll('.node'), el);
    syncNodes();
  });
  syncNodes();

  /* --------------------------------------------------------- accordion --- */

  function syncAcc() {
    var rows = root.querySelectorAll('.accrow');
    for (var i = 0; i < rows.length; i++) {
      var head = rows[i].querySelector('.acchead');
      var body = rows[i].querySelector('.accbody');
      var open = state.open === i;
      if (head) { head.setAttribute('aria-expanded', open ? 'true' : 'false'); }
      if (!body) { continue; }
      body.style.maxHeight = open ? (rows[i].hasAttribute('data-rich') ? '860px' : '360px') : '0px';
      body.style.opacity = open ? '1' : '0';
    }
  }

  on('toggle', function (el) {
    var row = el.closest('.accrow');
    var i = Array.prototype.indexOf.call(root.querySelectorAll('.accrow'), row);
    state.open = state.open === i ? -1 : i;
    syncAcc();
  });
  syncAcc();

  /* ----------------------------------------------------------- magnets --- */

  root.addEventListener('mousemove', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-mag]') : null;
    if (!btn) { return; }
    var label = btn.querySelector('.magIn');
    if (!label) { return; }
    var r = btn.getBoundingClientRect();
    var dx = (e.clientX - (r.left + r.width / 2)) / 3;
    var dy = (e.clientY - (r.top + r.height / 2)) / 3;
    label.style.transform = 'translate(' +
      Math.max(-13, Math.min(13, dx)).toFixed(1) + 'px, ' +
      Math.max(-7, Math.min(7, dy)).toFixed(1) + 'px)';
  }, true);

  root.addEventListener('mouseout', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-mag]') : null;
    if (!btn || (e.relatedTarget && btn.contains(e.relatedTarget))) { return; }
    var label = btn.querySelector('.magIn');
    if (label) { label.style.transform = 'translate(0.0px, 0.0px)'; }
  }, true);

  /* ------------------------------------------------------------- theme --- */

  var SUN =
    '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">' +
    '<circle cx="8" cy="8" r="3.1" fill="none" stroke="currentColor" stroke-width="1.3"></circle>' +
    '<path d="M8 .9v2M8 13.1v2M.9 8h2M13.1 8h2M3 3l1.4 1.4M11.6 11.6 13 13M13 3l-1.4 1.4M4.4 11.6 3 13" ' +
    'stroke="currentColor" stroke-width="1.3" stroke-linecap="round"></path></svg>';

  var MOON =
    '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">' +
    '<path d="M13 9.6A5.4 5.4 0 0 1 6.4 3a5.5 5.5 0 1 0 6.6 6.6Z" fill="none" ' +
    'stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"></path></svg>';

  /* The board recomputed every themed colour on re-render and wrote it into an
     inline style. Static markup carries a data- hook instead, repainted here. */
  function recolour(dark) {
    var swatch = {
      accent: dark ? '#4A9EFF' : '#2E5BBA',
      prod: dark ? '#7FC9A0' : '#19603F',
      prev: dark ? '#E0B463' : '#8A5B0F',
      arch: dark ? '#9AA2A0' : '#585F5D',
      mark2: dark ? '#86A4C4' : '#3F6B8F'
    };
    var tinted = root.querySelectorAll('[data-tint]');
    for (var i = 0; i < tinted.length; i++) {
      var el = tinted[i];
      var c = swatch[el.getAttribute('data-tint')];
      if (!c) { continue; }
      if (el.hasAttribute('data-tint-bg')) { el.style.background = c; }
      else { el.style.color = c; }
    }

    var shades = dark
      ? ['#202426', '#1E4160', '#2E6FA8', '#4A9EFF', '#8CC3FF']
      : ['#DEE2E1', '#B9CCE8', '#7FA3D8', '#4472C4', '#2E5BBA'];
    var cells = root.querySelectorAll('.hcell[data-lvl]');
    for (var j = 0; j < cells.length; j++) {
      cells[j].style.background = shades[+cells[j].getAttribute('data-lvl')];
    }
  }

  function syncTheme() {
    var dark = state.dark;
    root.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    var btn = root.querySelector('[data-act="toggleTheme"]');
    if (btn) {
      btn.innerHTML = dark ? SUN : MOON;
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    }
    recolour(dark);
  }

  on('toggleTheme', function () { state.dark = !state.dark; syncTheme(); });
  syncTheme();

  /* ---------------------------------------------------------- activity --- */

  /* The graph in the markup is a snapshot taken when the page was committed;
     a scheduled workflow refreshes data/activity.json, which this picks up.
     If the fetch fails the snapshot stands, so the section is never empty. */
  var heat = root.querySelector('.heat');
  if (heat) {
    fetch('data/activity.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.levels || !d.levels.length) { return; }
        var cells = heat.querySelectorAll('.hcell');
        if (cells.length !== d.levels.length) {
          var html = '';
          for (var n = 0; n < d.levels.length; n++) { html += '<span class="hcell"></span>'; }
          heat.innerHTML = html;
          cells = heat.querySelectorAll('.hcell');
        }
        for (var i = 0; i < cells.length; i++) {
          cells[i].setAttribute('data-lvl', d.levels[i]);
        }
        var stats = { commits: d.commits, repos: d.repos, streak: d.streak };
        for (var key in stats) {
          var el = root.querySelector('[data-stat="' + key + '"]');
          if (el && stats[key] != null) { el.textContent = stats[key]; }
        }
        recolour(state.dark);
      })
      .catch(function () { /* snapshot in the markup stands */ });
  }
})();
