// Bohemian eigenvalue particle background
// Live-computed from 5x5 complex matrices via Web Worker
(function() {
  const PARAMS = {
    dotSize: 0.3,
    dotSizeVariance: 0.9,
    dotColor: [150, 125, 115],
    dotOpacityMax: 0.99,
    maxParticles: 80000,
    mobileMaxParticles: 20000,
    lifetimeMin: 12,
    lifetimeMax: 27,
    fadeInRatio: 0.12,
    fadeOutRatio: 0.2,
    initialBatch: 15000,
    tickleBatch: 1000,
    tickleInterval: 100,
    mobileInitialBatch: 4000,
    mobileTickleBatch: 300,
    zoom: 4,
    cycleDuration: 180,
    viewMinX: -5, viewMaxX: 5,
    viewMinY: -5, viewMaxY: 5,
  };

  // Create background canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-bg';
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
  const maxP = isMobile ? PARAMS.mobileMaxParticles : PARAMS.maxParticles;
  const initBatch = isMobile ? PARAMS.mobileInitialBatch : PARAMS.initialBatch;
  const tickBatch = isMobile ? PARAMS.mobileTickleBatch : PARAMS.tickleBatch;

  // ---- Coordinate mapping ----
  function toScreen(ex, ey) {
    const bw = PARAMS.viewMaxX - PARAMS.viewMinX;
    const bh = PARAMS.viewMaxY - PARAMS.viewMinY;
    const dataAspect = bw / bh;
    const screenAspect = W / H;
    let scale;
    if (screenAspect > dataAspect) {
      scale = H / bh * PARAMS.zoom;
    } else {
      scale = W / bw * PARAMS.zoom;
    }
    const cx = (W - bw * scale) / 2;
    const cy = (H - bh * scale) / 2;
    return [
      (ex - PARAMS.viewMinX) * scale + cx,
      (ey - PARAMS.viewMinY) * scale + cy
    ];
  }

  // ---- Particle system ----
  const PX = new Float32Array(maxP);
  const PY = new Float32Array(maxP);
  const BIRTH = new Float32Array(maxP);
  const LIFE = new Float32Array(maxP);
  const SIZE = new Float32Array(maxP);
  let pCount = 0;
  let spawnQueue = [];

  function spawnFromQueue(now) {
    const budget = Math.min(spawnQueue.length, maxP - pCount, 200);
    for (let s = 0; s < budget; s++) {
      const [sx, sy] = spawnQueue.shift();
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
      const i = pCount;
      PX[i] = sx;
      PY[i] = sy;
      BIRTH[i] = now;
      LIFE[i] = PARAMS.lifetimeMin + Math.random() * (PARAMS.lifetimeMax - PARAMS.lifetimeMin);
      SIZE[i] = PARAMS.dotSize * (1 - PARAMS.dotSizeVariance + Math.random() * PARAMS.dotSizeVariance * 2);
      pCount++;
    }
  }

  function removeParticle(i) {
    pCount--;
    PX[i] = PX[pCount];
    PY[i] = PY[pCount];
    BIRTH[i] = BIRTH[pCount];
    LIFE[i] = LIFE[pCount];
    SIZE[i] = SIZE[pCount];
  }

  // ---- Web Worker ----
  const worker = new Worker('js/eigen-worker.js');
  let workerBusy = false;
  let currentAlpha = 0;

  worker.onmessage = function(e) {
    if (e.data.type === 'points') {
      const pts = e.data.points;
      for (let i = 0; i < pts.length; i += 2) {
        const [sx, sy] = toScreen(pts[i], pts[i + 1]);
        spawnQueue.push([sx, sy]);
      }
      workerBusy = false;
    }
  };

  function requestBatch(count) {
    if (workerBusy) return;
    workerBusy = true;
    worker.postMessage({ type: 'compute', alpha: currentAlpha, count: count });
  }

  // Initial fill
  requestBatch(initBatch);

  // Continuous trickle
  setInterval(function() {
    if (spawnQueue.length < 2000) {
      requestBatch(tickBatch);
    }
  }, PARAMS.tickleInterval);

  // ---- Animation loop ----
  let startTime = 0;
  let prevFrame = 0;

  function animate(timestamp) {
    requestAnimationFrame(animate);
    const now = timestamp / 1000;
    if (!startTime) startTime = now;
    if (now - prevFrame < 0.030) return;
    prevFrame = now;

    // Update interpolation alpha (0..3 cycles through 3 matrix pairs)
    currentAlpha = ((now - startTime) / PARAMS.cycleDuration) * 3;

    // Spawn from queue
    spawnFromQueue(now);

    // Clear (transparent — body background shows through)
    ctx.clearRect(0, 0, W, H);

    // Draw particles
    const col = PARAMS.dotColor.join(',');
    let i = 0;
    while (i < pCount) {
      const age = now - BIRTH[i];
      const life = LIFE[i];
      if (age >= life) {
        removeParticle(i);
        continue;
      }
      const ageRatio = age / life;
      let opacity;
      if (ageRatio < PARAMS.fadeInRatio) {
        opacity = ageRatio / PARAMS.fadeInRatio;
      } else if (ageRatio > (1 - PARAMS.fadeOutRatio)) {
        opacity = (1 - ageRatio) / PARAMS.fadeOutRatio;
      } else {
        opacity = 1;
      }
      opacity *= PARAMS.dotOpacityMax;
      ctx.beginPath();
      ctx.arc(PX[i], PY[i], SIZE[i], 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + col + ',' + opacity + ')';
      ctx.fill();
      i++;
    }
  }

  requestAnimationFrame(animate);
})();
