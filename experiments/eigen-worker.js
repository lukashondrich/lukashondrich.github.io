// Web Worker: computes 5x5 complex matrix eigenvalues
// Uses QR algorithm for small complex matrices

// ---- Complex number helpers ----
function cadd(a, b) { return [a[0]+b[0], a[1]+b[1]]; }
function csub(a, b) { return [a[0]-b[0], a[1]-b[1]]; }
function cmul(a, b) { return [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]]; }
function cdiv(a, b) {
  const d = b[0]*b[0]+b[1]*b[1];
  return [(a[0]*b[0]+a[1]*b[1])/d, (a[1]*b[0]-a[0]*b[1])/d];
}
function cabs(a) { return Math.sqrt(a[0]*a[0]+a[1]*a[1]); }
function cneg(a) { return [-a[0], -a[1]]; }
function cconj(a) { return [a[0], -a[1]]; }
function csqrt(a) {
  const r = cabs(a);
  if (r === 0) return [0, 0];
  const t = Math.atan2(a[1], a[0]) / 2;
  const sr = Math.sqrt(r);
  return [sr * Math.cos(t), sr * Math.sin(t)];
}

// ---- 5x5 Complex Matrix operations ----
// Matrix stored as flat array of [re, im] pairs, row-major: mat[i*N+j] = [re, im]
const N = 5;

function matCreate() {
  const m = new Array(N * N);
  for (let i = 0; i < N * N; i++) m[i] = [0, 0];
  return m;
}

function matCopy(src) {
  const m = new Array(N * N);
  for (let i = 0; i < N * N; i++) m[i] = [src[i][0], src[i][1]];
  return m;
}

function matGet(m, i, j) { return m[i * N + j]; }
function matSet(m, i, j, v) { m[i * N + j] = v; }

// QR decomposition using Householder reflections for complex matrices
// Returns eigenvalues via iterated QR
function eigenvalues(mat) {
  const A = matCopy(mat);
  const maxIter = 80;

  for (let iter = 0; iter < maxIter; iter++) {
    // Wilkinson shift: use bottom-right element
    const shift = matGet(A, N-1, N-1);

    // Subtract shift from diagonal
    for (let i = 0; i < N; i++) {
      matSet(A, i, i, csub(matGet(A, i, i), shift));
    }

    // QR decomposition via Givens rotations
    const cs = []; // store rotation params
    for (let j = 0; j < N - 1; j++) {
      const a = matGet(A, j, j);
      const b = matGet(A, j + 1, j);
      const r = csqrt(cadd(cmul(a, cconj(a)), cmul(b, cconj(b))));
      if (cabs(r) < 1e-14) {
        cs.push([[1, 0], [0, 0]]);
        continue;
      }
      const c = cdiv(a, r);
      const s = cdiv(b, r);
      cs.push([c, s]);

      // Apply rotation to rows j and j+1
      for (let k = 0; k < N; k++) {
        const aj = matGet(A, j, k);
        const aj1 = matGet(A, j + 1, k);
        matSet(A, j, k, cadd(cmul(cconj(c), aj), cmul(cconj(s), aj1)));
        matSet(A, j + 1, k, csub(cmul(c, aj1), cmul(s, aj)));
      }
    }

    // R * Q (apply rotations from the right)
    for (let j = 0; j < N - 1; j++) {
      const [c, s] = cs[j];
      for (let k = 0; k < N; k++) {
        const ak_j = matGet(A, k, j);
        const ak_j1 = matGet(A, k, j + 1);
        matSet(A, k, j, cadd(cmul(ak_j, c), cmul(ak_j1, s)));
        matSet(A, k, j + 1, csub(cmul(ak_j1, cconj(c)), cmul(ak_j, cconj(s))));
      }
    }

    // Add shift back
    for (let i = 0; i < N; i++) {
      matSet(A, i, i, cadd(matGet(A, i, i), shift));
    }
  }

  // Eigenvalues are on the diagonal
  const eigs = [];
  for (let i = 0; i < N; i++) {
    const d = matGet(A, i, i);
    eigs.push(d);
  }
  return eigs;
}

// ---- Matrix definitions (same as Python repo) ----
function makeMatrix(arr) {
  // arr is array of [re, im] pairs in row-major order
  return arr;
}

const matrix_0 = makeMatrix([
  [1,0], [-1,0], [0,-1], [0,-1], [0,-1],
  [-1,0], [1,0], [0,1], [-1,0], [0,1],
  [1,0], [0,1], [0,0], [1,0], [0,0],
  [-1,0], [0,-1], [-1,0], [2,0], [-1,0],
  [0,0], [0,0], [1,0], [0,0], [1,0]
]);

const matrix_1 = makeMatrix([
  [0,0], [1,0], [-1,0], [8,0], [0,0],
  [0,0], [1,0], [0,0], [1,0], [0,0],
  [-1,0], [1,0], [-1,0], [1,0], [-1,0],
  [0,0], [1,0], [0,0], [1,0], [0,0],
  [0,0], [0,1], [-1,0], [0,1], [0,0]
]);

const matrix_2 = makeMatrix([
  [0,0], [1,0], [-1,0], [8,0], [4,0],
  [0,0], [1,0], [0,0], [1,0], [4,0],
  [-1,0], [1,0], [-1,0], [1,0], [-1,0],
  [0,0], [1,0], [0,0], [1,0], [4,0],
  [0,0], [0,1], [-1,0], [0,1], [4,0]
]);

const matrices = [matrix_0, matrix_1, matrix_2];

function interpolateAndSample(alpha) {
  // alpha 0..3 maps to the cycle: m0->m1->m2->m0
  const totalPairs = 3;
  const pairIdx = Math.floor(alpha) % totalPairs;
  const t = alpha - Math.floor(alpha);

  const m0 = matrices[pairIdx];
  const m1 = matrices[(pairIdx + 1) % totalPairs];

  // Interpolate
  const mat = matCreate();
  for (let i = 0; i < N * N; i++) {
    mat[i] = [(1 - t) * m0[i][0] + t * m1[i][0], (1 - t) * m0[i][1] + t * m1[i][1]];
  }

  // Random perturbation on entries [0,0] and [3,3]
  const a1 = Math.random() * Math.PI * 2;
  const a2 = Math.random() * Math.PI * 2;
  matSet(mat, 0, 0, [Math.cos(a1), Math.sin(a1)]);
  matSet(mat, 3, 3, [Math.cos(a2), Math.sin(a2)]);

  return eigenvalues(mat);
}

// ---- Worker message handling ----
self.onmessage = function(e) {
  const { type, alpha, count } = e.data;

  if (type === 'compute') {
    const points = [];
    for (let i = 0; i < count; i++) {
      const eigs = interpolateAndSample(alpha);
      for (const eig of eigs) {
        points.push(eig[0], eig[1]); // re, im
      }
    }
    self.postMessage({ type: 'points', points: new Float32Array(points) }, []);
  }
};
