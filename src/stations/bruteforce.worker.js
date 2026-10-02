// Real exhaustive search, run in the browser: enumerate every string over
// `chars`, shortest first, until we hit `target` or run out of time.
self.onmessage = ({ data: { target, chars, maxMs } }) => {
  const n = chars.length;
  const start = performance.now();
  let tries = 0;
  let lastReport = start;
  for (let len = 1; len <= target.length; len++) {
    const idx = new Array(len).fill(0);
    const buf = new Array(len).fill(chars[0]);
    while (true) {
      tries++;
      if (len === target.length && buf.join('') === target) {
        self.postMessage({ done: true, found: true, tries, ms: performance.now() - start });
        return;
      }
      if ((tries & 0x3ffff) === 0) {
        const now = performance.now();
        if (now - start > maxMs) { self.postMessage({ done: true, found: false, tries, ms: now - start }); return; }
        if (now - lastReport > 80) { self.postMessage({ done: false, tries, ms: now - start, current: buf.join('') }); lastReport = now; }
      }
      // odometer increment
      let i = len - 1;
      while (i >= 0) {
        idx[i]++;
        if (idx[i] < n) { buf[i] = chars[idx[i]]; break; }
        idx[i] = 0; buf[i] = chars[0]; i--;
      }
      if (i < 0) break;
    }
  }
  self.postMessage({ done: true, found: false, tries, ms: performance.now() - start });
};
