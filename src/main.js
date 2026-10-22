import Lenis from 'lenis';
import { Stage } from './stage.js';
import { CHAPTERS, GOLD_STOPS } from './chapters.js';
import { Sound } from './sound.js';

const $ = (s, r = document) => r.querySelector(s);
const html = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(pointer: coarse)').matches;
const N = CHAPTERS.length;

/* ---------- letters ---------- */
function letters(el, text = el.textContent, gold = false) {
  el.textContent = '';
  const total = [...text].length; let i = 0;
  // group letters by word so lines only break between words
  text.split(/(\s+)/).forEach((part) => {
    if (!part) return;
    if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(' ')); i += part.length; return; }
    const w = document.createElement('span'); w.className = 'word';
    [...part].forEach((c) => {
      const s = document.createElement('span');
      s.className = 'letter'; s.textContent = c;
      s.style.setProperty('--d', Math.floor(Math.random() * 10));
      s.style.setProperty('--i', i);
      if (gold) s.style.color = GOLD_STOPS[Math.min(GOLD_STOPS.length - 1, Math.floor((i / total) * GOLD_STOPS.length))];
      w.appendChild(s); i++;
    });
    el.appendChild(w);
  });
}
function split(el) {
  const text = el.textContent; el.textContent = '';
  [...text].forEach((c, i) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; s.style.setProperty('--i', i); el.appendChild(s); });
}

/* ---------- build DOM pieces ---------- */
const track = $('#track');
CHAPTERS.forEach((c) => { const d = document.createElement('section'); d.className = 'chapter'; d.dataset.id = c.id; track.appendChild(d); });

const names = $('.chapter-names');
CHAPTERS.forEach((c, i) => {
  const n = document.createElement('span'); n.className = 'chapter-name'; n.dataset.i = i;
  [...c.rail].forEach((ch, k) => { const s = document.createElement('span'); s.className = 'chapter-letter'; s.textContent = ch; s.style.setProperty('--i', k); n.appendChild(s); });
  names.appendChild(n);
});
const counter = $('.progress-counter-item');
CHAPTERS.forEach((c, i) => {
  const p = document.createElement('span'); p.className = 'pci'; p.dataset.i = i;
  const num = String(i + 1).padStart(2, '0');
  p.innerHTML = `<span class="pci-digit">${num[0]}</span><span class="pci-digit">${num[1]}</span>`;
  counter.appendChild(p);
});

const capWrap = $('.story-captions');
const captions = CHAPTERS.map((c) => {
  if (!c.caption) return null;
  const el = document.createElement('div'); el.className = 'caption';
  const v = document.createElement('p'); v.className = 'vert'; letters(v, c.caption.vert);
  const p = document.createElement('p'); p.className = 'plain';
  p.innerHTML = (c.caption.tag ? `<span class="tag">${c.caption.tag}</span>` : '') + c.caption.plain;
  el.append(v, p); capWrap.appendChild(el); return el;
});

document.querySelectorAll('[data-split]').forEach(split);
const subtitle = $('[data-subtitle]'); letters(subtitle);
const loaderLine = $('.loader-line'); letters(loaderLine);
document.querySelectorAll('[data-gold]').forEach((el) => letters(el, el.textContent, true));

/* ---------- stage ---------- */
const stage = new Stage($('#stage'), CHAPTERS);
const sound = new Sound();

/* ---------- loader: real progress over fonts + scene media ---------- */
const pctEl = $('#pct');
let shown = 0, target = 0;
const wide = innerWidth / innerHeight > 1.15 && innerWidth > 980;
if (wide) html.classList.add('carved');
const jobs = [document.fonts.ready, ...CHAPTERS.map((c, i) => stage.loadMedia(i, i === 0 && wide ? '/scenes/01t' : `/scenes/${String(i + 1).padStart(2, '0')}`, !!c.video))];
let done = 0;
jobs.forEach((j) => Promise.resolve(j).finally(() => { done++; target = done / jobs.length; }));
const minTime = new Promise((r) => setTimeout(r, reduced ? 300 : 2600));
(function tickPct() {
  shown += (target - shown) * 0.08;
  pctEl.textContent = Math.round(shown * 100);
  if (shown < 0.995) requestAnimationFrame(tickPct); else pctEl.textContent = '100';
})();
Promise.all([Promise.allSettled(jobs), minTime]).then(async () => {
  target = 1;
  await wait(900);
  $('.loader-mark').classList.add('gone');
  await wait(900);
  loaderLine.classList.add('show');               // "This is a world made of light."
  await wait(reduced ? 600 : 3200);
  loaderLine.classList.remove('show'); loaderLine.classList.add('exit');
  await wait(1200);
  $('#loader').classList.add('fade-out');
  titleReady = true; html.classList.add('title-ready');   // scrolling works from this moment
  intro = 1;
  await wait(1400);
  html.classList.add('ui-on');
  $('.main-title-container').classList.add('show');
  subtitle.classList.add('show');
  if (!started) landingOn(true);   // the signup screen is the landing page; the story starts on scroll or PLAY

});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- step scroll ----------
   One gesture = one step. A wheel flick, a swipe or the arrow keys glide the
   page to the next stop (the title, each caption at its fullest, the end).
   The page never free-scrolls, so every input does something clear. */
const chapterH = () => innerHeight * 2.3;
const stops = () => [0, ...CHAPTERS.slice(0, -1).map((c, i) => chapterH() * (i + (i === 0 ? 0.5 : 0.45))), chapterH() * (N - 1 + 0.35)];
let pull = 0, pullTarget = 0, kick = 0, dir = 1, titleReady = false, started = false, step = 0, gliding = false, accum = 0, lastInput = 0, waitGap = false, playing = false, playTimer = 0;
const GLIDE = 1.5;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function goTo(i, user = true) {
  if (!started || panelOpen) return;
  const s = stops(); i = Math.max(0, Math.min(s.length - 1, i));
  if (i === step && !gliding) return;
  dir = i > step ? 1 : -1;
  step = i; gliding = true; waitGap = true; accum = 0; pullTarget = 0;
  kick = 1;                                             // a short pulse of light and zoom
  if (navigator.vibrate) { try { navigator.vibrate(10); } catch {} }
  if (user) { html.classList.add('stepped'); if (playing) setPlay(false); }
  lenis.scrollTo(s[i], { duration: GLIDE, easing: ease, force: true, onComplete: () => { gliding = false; playTimer = performance.now(); } });
  sound.whoosh && sound.whoosh();
}
const lenis = new Lenis({
  duration: GLIDE, smoothWheel: true,
  virtualScroll: (data) => {
    const e = data.event;
    if (!started && titleReady && (e.type === 'wheel' || e.type === 'touchmove')) {
      if (e.cancelable) e.preventDefault();
      const d = Math.abs(data.deltaY) > Math.abs(data.deltaX) ? data.deltaY : data.deltaX;
      if (d > 0) { begin(); goTo(1); }          // scrolling down starts the story right away
      return false;
    }
    if (!started || panelOpen || joinPanel.classList.contains('show')) return false;
    // block native scrolling for wheel and swipe moves only; a tap must still become a click
    if (e.cancelable && (e.type === 'wheel' || e.type === 'touchmove')) e.preventDefault();
    if (e.type === 'touchstart' || e.type === 'touchend') return false;
    const now = performance.now(), gap = now - lastInput; lastInput = now;
    if (gliding) return false;
    if (waitGap && gap < 160) return false;   // trackpad inertia tail after a glide
    waitGap = false;
    if (gap > 260) accum = 0;                  // a new gesture
    accum += Math.abs(data.deltaY) > Math.abs(data.deltaX) ? data.deltaY : data.deltaX;
    const th = e.type.includes('touch') ? 70 : 90;
    const atEdge = (accum < 0 && step === 0) || (accum > 0 && step === stops().length - 1);
    // the scene leans with the gesture before the step fires; at the ends it only stretches a little
    pullTarget = Math.max(-1, Math.min(1, accum / th)) * (atEdge ? 0.35 : 1);
    if (!atEdge && Math.abs(accum) > th) goTo(step + Math.sign(accum));
    return false;
  },
});
addEventListener('keydown', (e) => {
  if (!started && titleReady && ['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key) && !e.target.closest('input, textarea, button, a')) { e.preventDefault(); begin(); goTo(1); return; }
  if (!started || panelOpen || e.target.closest('input, textarea, button, a')) return;
  const k = e.key;
  if (['ArrowDown', 'PageDown', ' '].includes(k)) { e.preventDefault(); goTo(step + 1); }
  else if (['ArrowUp', 'PageUp'].includes(k)) { e.preventDefault(); goTo(step - 1); }
  else if (k === 'Home') { e.preventDefault(); goTo(0); }
  else if (k === 'End') { e.preventDefault(); goTo(stops().length - 1); }
});
// keep the right stop when the window changes size
addEventListener('resize', () => { if (started) lenis.scrollTo(stops()[step], { immediate: true, force: true }); });

/* ---------- play: step through the story on its own ---------- */
const playBtn = $('[data-play]');
function setPlay(on) {
  playing = on; playTimer = performance.now();
  playBtn.classList.toggle('on', on); playBtn.setAttribute('aria-pressed', String(on));
  playBtn.querySelector('.pl-txt').textContent = on ? 'PAUSE' : 'PLAY';
  if (on && step >= stops().length - 1) goTo(0, false);
}
playBtn.addEventListener('click', (e) => { e.stopPropagation(); if (!started) begin(); setPlay(!playing); });
const PLAY_HOLD = 7000;   // ms on each stop

/* ---------- chapter strip: all 9 chapters, click to jump ---------- */
const strip = $('.chapter-strip');
CHAPTERS.forEach((c, i) => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'cs-dot'; b.dataset.i = i;
  b.innerHTML = `<span class="cs-bar"></span><span class="cs-label">${String(i + 1).padStart(2, '0')} ${c.rail}</span>`;
  b.setAttribute('aria-label', `Chapter ${i + 1}: ${c.rail}`);
  b.addEventListener('click', (e) => { e.stopPropagation(); if (!started) begin(); goTo(i + 1); });
  strip.appendChild(b);
});

/* ---------- gesture meter: an arc at the cursor, glows at the screen edges ---------- */
const gauge = $('.gauge'), gaugeArc = $('.g-arc'), GAUGE_C = 2 * Math.PI * 26;
const edgeF = $('.edge-glow.fwd'), edgeB = $('.edge-glow.back');

/* ---------- custom cursor: gold dot + ring (the real cursor is hidden) ---------- */
const cur = $('.cursor');
let cx = innerWidth / 2, cy = innerHeight / 2, rx = cx, ry = cy;
addEventListener('pointermove', (e) => {
  cx = e.clientX; cy = e.clientY; cur.classList.add('on');
  const t = e.target.closest && e.target.closest('button, a, input, label, .htibtn, #start-button');
  cur.classList.toggle('big', !!t);
}, { passive: true });
document.addEventListener('pointerleave', () => cur.classList.remove('on'));
(function moveCursor() {
  rx += (cx - rx) * 0.18; ry += (cy - ry) * 0.18;
  cur.style.setProperty('--x', `${cx}px`); cur.style.setProperty('--y', `${cy}px`);
  cur.style.setProperty('--rx', `${rx}px`); cur.style.setProperty('--ry', `${ry}px`);
  requestAnimationFrame(moveCursor);
})();

/* ---------- start button chases the cursor ---------- */
const startBtn = $('#start-button');
const holdBtn = $('.htibtn');
let mx = innerWidth * 0.62, my = innerHeight * 0.45;
const place = (el, x, y) => { el.style.transform = `translate3d(${x - 60}px, ${y - 60}px, 0)`; };
place(startBtn, mx, my);
addEventListener('pointermove', (e) => {
  mx = e.clientX; my = e.clientY;
  // step aside over the header and the join panel so they stay easy to use
  const overUI = !!(e.target.closest && e.target.closest('header, .join-panel, .logo-header'));
  startBtn.classList.toggle('away', overUI); holdBtn.classList.toggle('away', overUI);
  stage.setMouse(mx, my);
  if (!touch) { place(startBtn, mx, my); if (!holding) place(holdBtn, mx, my); }
}, { passive: true });
if (touch) { place(startBtn, innerWidth / 2, innerHeight * 0.74); }

let landing = false;
function landingOn(on) {
  landing = on;
  endScreen.classList.toggle('show', on); logoHeader.classList.toggle('end', on);
  html.classList.toggle('landing', on);
}
function begin() {
  if (started) return;
  started = true;
  startBtn.classList.remove('show'); startBtn.classList.add('hide');
  landingOn(false);
  lenis.start();
  html.classList.add('begun');
  sound.start();
  $('[data-sound]').classList.add('is-playing'); $('[data-sound]').classList.remove('off'); $('[data-sound]').setAttribute('aria-pressed', 'true');
  $('.scroll-hint').classList.add('show');
}
startBtn.addEventListener('click', begin);
['pointerdown', 'keydown', 'touchend'].forEach((t) => addEventListener(t, () => sound.unlock && sound.unlock(), { passive: true }));
// a click anywhere on the title also starts, so a missed click never strands the reader
addEventListener('click', (e) => { if (!started && titleReady && !e.target.closest('header, .join-panel, .chapter-strip, #end-screen')) { begin(); goTo(1); } });

/* ---------- sound toggle ---------- */
$('[data-sound]').addEventListener('click', (e) => {
  const b = e.currentTarget; const on = sound.toggle();
  b.classList.toggle('is-playing', on); b.classList.toggle('off', !on); b.setAttribute('aria-pressed', String(on));
});

/* ---------- hold to illuminate ---------- */
const reveal = $('.reveal');
const fill = $('.pc-fill');
const CIRC = 414.69;
let holding = false, holdP = 0, panelOpen = false, holdFor = -1;
const HOLD_MS = 1600;
function openPanel(i) {
  const r = CHAPTERS[i].reveal; if (!r) return;
  panelOpen = true; holdFor = i;
  $('.reveal-kicker').textContent = r.kicker;
  const t = $('.reveal-title'); letters(t, r.title, true); t.classList.remove('show');
  $('.reveal-body').innerHTML = r.html;
  const bg = $('.reveal-bg'); const ext = bg.canPlayType('video/mp4; codecs="avc1.640028"') ? 'mp4' : 'webm';
  const clip = `/scenes/${String(i + 1).padStart(2, '0')}.${ext}`;
  if (!bg.src.endsWith(clip)) bg.src = clip; bg.playbackRate = 0.5; bg.play().catch(() => {});
  reveal.querySelectorAll('.reveal-body video').forEach((v) => { v.muted = true; v.play().catch(() => {}); });
  reveal.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => { reveal.classList.add('show'); t.classList.add('show'); });
  holdBtn.classList.remove('show');
  lenis.stop(); sound.reveal();
}
function closePanel() {
  panelOpen = false;
  reveal.classList.remove('show'); reveal.setAttribute('aria-hidden', 'true');
  setTimeout(() => { if (!panelOpen) $('.reveal-bg').pause(); }, 1800);
  lenis.start();
}
reveal.querySelector('.reveal-close').addEventListener('click', closePanel);
reveal.addEventListener('click', (e) => { if (e.target === reveal) closePanel(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && panelOpen) closePanel(); });
holdBtn.addEventListener('pointerdown', (e) => {
  if (touch) { openPanel(currentCh); return; }
  holding = true; holdBtn.setPointerCapture(e.pointerId); sound.holdStart();
});
const release = () => { if (holding) { holding = false; sound.holdStop(); } };
holdBtn.addEventListener('pointerup', release); holdBtn.addEventListener('pointercancel', release);
holdBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(currentCh); } });

/* ---------- join forms ---------- */
const joinPanel = $('.join-panel');
const joinBtn = $('[data-open-join]');
function setJoin(open) {
  joinPanel.classList.toggle('show', open);
  joinPanel.setAttribute('aria-hidden', String(!open));
  joinBtn.setAttribute('aria-expanded', String(open));
  if (open) setTimeout(() => joinPanel.querySelector('input[type=email]').focus({ preventScroll: true }), 120);
  if (open) lenis.stop(); else if (started && !panelOpen) lenis.start();
}
joinBtn.addEventListener('click', (e) => { e.stopPropagation(); setJoin(!joinPanel.classList.contains('show')); });
$('.join-close').addEventListener('click', () => setJoin(false));
addEventListener('pointerdown', (e) => { if (joinPanel.classList.contains('show') && !e.target.closest('.join-panel, [data-open-join]')) setJoin(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && joinPanel.classList.contains('show')) setJoin(false); });
document.querySelectorAll('[data-join]').forEach((f) => f.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = f.querySelector('.join-msg');
  const email = f.email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'Please enter a valid email.'; return; }
  if (!f.consent.checked) { msg.textContent = 'Please tick the box so I can send you the newsletter.'; return; }
  const body = { email, consent: true, ts: new Date().toISOString(), source: f.closest('#end-screen') ? 'close' : 'hero' };
  try {
    const r = await fetch('/api/subscribe', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(r.status);
    msg.textContent = "You're on the list. I'll write when the first issue is ready.";
    f.reset();
  } catch { msg.textContent = 'That did not go through. Please try again in a moment.'; }
}));

/* ---------- main loop ---------- */
let stripCh = -1, intro = 0, currentCh = -1, prevCaption = -1, last = performance.now(), endShown = false, endSince = 0;
const title = $('.main-title-container');
const rail = $('.section-progress');
const hint = $('.scroll-hint');
const endScreen = $('#end-screen');
const logoHeader = $('.logo-header');

function setChapter(i) {
  if (i === currentCh) return;
  currentCh = i;
  names.querySelectorAll('.chapter-name').forEach((n) => { const k = +n.dataset.i; n.classList.toggle('current', k === i); n.classList.toggle('past', k < i); });
  counter.querySelectorAll('.pci').forEach((p) => { const k = +p.dataset.i; p.classList.toggle('current', k === i); p.classList.toggle('past', k < i); });
}

function raf(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  // play mode: hold on each stop, then glide on
  if (playing && !gliding && !panelOpen && now - playTimer > PLAY_HOLD) {
    if (step < stops().length - 1) goTo(step + 1, false); else setPlay(false);
  }
  // gesture spring: follow the input, ease back when it stops
  if (now - lastInput > 90 && !gliding) pullTarget *= 0.82;
  pull += (pullTarget - pull) * 0.22;
  kick *= 0.9;
  html.style.setProperty('--pull', pull.toFixed(3));
  gauge.classList.toggle('on', Math.abs(pull) > 0.04);
  gauge.classList.toggle('up', pull < 0);
  gaugeArc.style.strokeDashoffset = String(GAUGE_C * (1 - Math.min(1, Math.abs(pull))));
  edgeF.style.opacity = String(Math.max(0, pull)); edgeB.style.opacity = String(Math.max(0, -pull));
  lenis.raf(now);

  const chH = innerHeight * 2.3;
  const y = lenis.animatedScroll;
  const pos = Math.max(0, Math.min(N - 0.0001, y / chH));
  const a = Math.floor(pos), local = pos - a;
  // the last 22% of a chapter blends into the next one
  const mix = a < N - 1 ? Math.max(0, (local - 0.78) / 0.22) : 0;
  setChapter(local > 0.9 && a < N - 1 ? a + 1 : a);

  // title only on the opening stretch
  if (started) { const hideTitle = y > innerHeight * 0.35; title.classList.toggle('hide', hideTitle); html.classList.toggle('story-on', hideTitle); }

  // captions show between 18% and 72% of a chapter (the first chapter waits for the title to clear)
  const capIdx = (local > (a === 0 ? 0.3 : 0.18) && local < 0.72 && started) ? a : -1;
  if (capIdx !== prevCaption) {
    if (prevCaption >= 0 && captions[prevCaption]) { const c = captions[prevCaption]; c.classList.remove('show'); c.classList.add('exit'); c.querySelector('.vert').classList.remove('show'); }
    if (capIdx >= 0 && captions[capIdx]) { const c = captions[capIdx]; c.classList.remove('exit'); c.classList.add('show'); c.querySelector('.vert').classList.add('show'); sound.tick(); }
    prevCaption = capIdx;
  }

  // hold button from 40% to 78% of chapters that have a panel
  const canHold = started && !panelOpen && CHAPTERS[a].reveal && local > 0.4 && local < 0.78;
  holdBtn.classList.toggle('show', !!canHold);
  if (touch && canHold) place(holdBtn, innerWidth / 2, innerHeight - 140);
  if (!canHold) { holding = false; }
  holdP = holding ? Math.min(1, holdP + (dt * 1000) / HOLD_MS) : Math.max(0, holdP - dt * 2.5);
  fill.style.strokeDashoffset = String(CIRC * (1 - holdP));
  if (holdP >= 1 && holding) { holding = false; holdP = 0; openPanel(a); }

  // end screen
  const atEnd = a === N - 1 && local > 0.12;
  if (atEnd !== endShown) {
    endShown = atEnd; endSince = now;
    endScreen.classList.toggle('show', atEnd); logoHeader.classList.toggle('end', atEnd); rail.classList.toggle('hide', atEnd);
    hint.classList.toggle('show', !atEnd && started);
  }

  // strip + next-chapter hint
  if (a !== stripCh) { stripCh = a;
    strip.querySelectorAll('.cs-dot').forEach((d) => { const k = +d.dataset.i; d.classList.toggle('current', k === a); d.classList.toggle('past', k < a); });
    const nx = CHAPTERS[a + 1]; $('.sh-text').textContent = nx ? `NEXT · ${nx.rail}` : 'THE END';
  }
  window.__phos = { y, pos, a, local, endShown, started, step, gliding, playing };
  stage.frame(now / 1000, a, local, mix, { intro, pull, kick, dir: gliding ? dir : 0, vel: Math.min(1, Math.abs(lenis.velocity) / 45), travel: pos + pull * 0.06, play: intro === 1, cursor: !touch, rate: started ? 0.27 : 0.5, open: (atEnd || landing) ? 1 : 0 });
  sound.update(a, local);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

