import books from '../src/books.json';
import { amazonUrl } from './affiliate.js';

const $ = (s, r = document) => r.querySelector(s);

/* ---------- the room, in design units (the stage is 1600 x 900) ---------- */
const STAGE_W = 1600, STAGE_H = 900, FLOOR = 680;
const PAD = 14, ROW_H = 120, CORNICE = 24;
const TABLE_TOP = 770;
// Books that lie on the table. Put book ids here to choose them yourself; empty = the newest "currently reading".
const TABLE_PICKS = [];

const SHELF_LABEL = { read: 'Read', favourite: 'Read · a favourite', toread: 'To read', reading: 'Reading now' };

/* ---------- split the CSV export into the five places books can sit ---------- */
const by = (shelf) => books.filter((b) => b.shelf === shelf);
const newest = (a, b) => (b.added.localeCompare(a.added)) || (b.id - a.id);
const readingAll = by('currently-reading').sort(newest);
const onTable = TABLE_PICKS.length ? TABLE_PICKS.map((id) => books.find((b) => b.id === id)).filter(Boolean) : readingAll.slice(0, 6);
const tableIds = new Set(onTable.map((b) => b.id));
const alpha = (a, b) => a.title.localeCompare(b.title);
const read = by('read');
const units = [
  { key: 'read', name: 'Read', shelf: 'read', x: 40, w: 440, list: read.filter((b) => b.rating < 5).sort(alpha), kind: 'case' },
  { key: 'favourites', name: 'Favourites', shelf: 'favourite', x: 620, w: 360, list: read.filter((b) => b.rating >= 5).sort(alpha), kind: 'case' },
  { key: 'toread', name: 'To read', shelf: 'toread', x: 1120, w: 440, list: by('to-read').sort(alpha), kind: 'case' },
  { key: 'crate', name: 'In progress', shelf: 'reading', x: 70, w: 400, list: readingAll.filter((b) => !tableIds.has(b.id)), kind: 'crate' },
];

/* ---------- spines ---------- */
const PALETTE = [
  ['#6b2d2d', '#F3EBD8'], ['#2f4a3a', '#F3EBD8'], ['#2b3a55', '#F3EBD8'], ['#8a6a2f', '#1b140a'],
  ['#3a3a42', '#F3EBD8'], ['#7a4a2a', '#F3EBD8'], ['#4a2f4f', '#F3EBD8'], ['#5a5f3a', '#F3EBD8'], ['#d9cfb4', '#241c0c'],
];
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const spineW = (b) => clamp(Math.round((b.pages || 280) / 16) + 12, 24, 42);
const spineH = (b) => 72 + (hash(b.title) % 26) + Math.min(6, Math.round((b.pages || 0) / 200));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const colour = (b) => PALETTE[hash(b.author + b.title) % PALETTE.length];

function spine(b, extra = '') {
  const [bg, fg] = colour(b);
  return `<button class="spine${extra}" type="button" tabindex="-1" data-id="${b.id}" style="--w:${spineW(b)}px;--h:${spineH(b)}px;--bg:${bg};--fg:${fg}" aria-label="${esc(b.title)}, ${esc(b.author)}"><span>${esc(b.title)}</span></button>`;
}

function rowsFor(list, innerW) {
  const rows = [[]]; let used = 0;
  list.forEach((b) => {
    const w = spineW(b) + 1;
    if (used + w > innerW && rows[rows.length - 1].length) { rows.push([]); used = 0; }
    rows[rows.length - 1].push(b); used += w;
  });
  return rows;
}

/* ---------- build the room ---------- */
const room = $('#room');
const rects = {};
let html = '';

units.forEach((u) => {
  const rows = rowsFor(u.list, u.w - PAD * 2);
  const crate = u.kind === 'crate';
  const h = crate ? rows.length * (ROW_H - 10) + 26 : rows.length * ROW_H + PAD + CORNICE;
  const bottom = crate ? 890 : FLOOR;
  u.h = h; u.y = bottom - h;
  rects[u.key] = { x: u.x, y: u.y, w: u.w, h };
  html += `<section class="unit ${crate ? 'crate' : 'case'}" data-unit="${u.key}" style="left:${u.x}px;top:${u.y}px;width:${u.w}px;height:${h}px" aria-label="${u.name}, ${u.list.length} books">
    <div class="rows" style="padding:${crate ? 14 : CORNICE}px ${PAD}px ${crate ? 12 : PAD}px">${rows.map((r) => `<div class="row">${r.map((b) => spine(b)).join('')}</div>`).join('')}</div>
    <button class="hit" type="button" data-zoom="${u.key}" aria-label="Look closer: ${u.name}, ${u.list.length} books"></button>
    <p class="label">${u.name} <b>${u.list.length}</b></p>
  </section>`;
});

// the table: two flat stacks, one leaning book, a lamp
const flat = (b, x, y, i) => {
  const [bg, fg] = colour(b);
  const w = 150 + (hash(b.title) % 50);
  return `<button class="spine flat" type="button" tabindex="-1" data-id="${b.id}" style="left:${x + ((i * 7) % 14)}px;top:${y}px;--fw:${w}px;--bg:${bg};--fg:${fg}" aria-label="${esc(b.title)}, ${esc(b.author)}"><span>${esc(b.title)}</span></button>`;
};
const tb = onTable;
let tableHtml = `<section class="unit table" data-unit="table" style="left:560px;top:620px;width:480px;height:270px" aria-label="The table, ${tb.length} books">`;
tb.slice(0, 3).forEach((b, i) => { tableHtml += flat(b, 70, TABLE_TOP - 24 * (i + 1) - 620, i); });
tb.slice(3, 5).forEach((b, i) => { tableHtml += flat(b, 250, TABLE_TOP - 24 * (i + 1) - 620, i + 3); });
if (tb[5]) {
  const [bg, fg] = colour(tb[5]);
  tableHtml += `<button class="spine lean" type="button" tabindex="-1" data-id="${tb[5].id}" style="left:392px;top:${TABLE_TOP - 112 - 620}px;--w:34px;--h:112px;--bg:${bg};--fg:${fg}" aria-label="${esc(tb[5].title)}, ${esc(tb[5].author)}"><span>${esc(tb[5].title)}</span></button>`;
}
tableHtml += `<div class="lamp" aria-hidden="true"><i class="glow"></i><i class="shade"></i><i class="stem"></i></div>
  <div class="top" aria-hidden="true"></div><div class="leg l1" aria-hidden="true"></div><div class="leg l2" aria-hidden="true"></div>
  <button class="hit" type="button" data-zoom="table" aria-label="Look closer: the table, ${tb.length} books"></button>
  <p class="label">On the table <b>${tb.length}</b></p></section>`;
rects.table = { x: 560, y: TABLE_TOP - 140, w: 480, h: 190 };
html += tableHtml;
room.innerHTML = html;

/* ---------- small-screen list ---------- */
const listView = $('#list-view');
const allUnits = [{ key: 'table', name: 'On the table', shelf: 'reading', list: onTable }, ...units];
listView.innerHTML = allUnits.map((u) => `<section><h2>${u.name} <b>${u.list.length}</b></h2><ul>${u.list.map((b) => `<li><button type="button" data-id="${b.id}" data-shelf="${u.shelf}"><span class="t">${esc(b.title)}</span><span class="a">${esc(b.author)}</span></button></li>`).join('')}</ul></section>`).join('');

/* ---------- fit the stage to the window ---------- */
const fit = $('#fit'), camera = $('#camera'), viewport = $('#viewport');
let s = 1;
function resize() {
  s = Math.min(innerWidth / STAGE_W, innerHeight / STAGE_H);
  fit.style.transform = `translate(-50%, -50%) scale(${s})`;
}
addEventListener('resize', resize); resize();

/* ---------- camera: step up to a shelf ---------- */
const back = $('.back'), hint = $('#hint');
let current = null;
const narrow = () => innerWidth <= 700;
function zoom(key) {
  current = key;
  const r = rects[key];
  const z = Math.min(3.2, 1180 / (r.w + 80), 800 / (r.h + 60));
  // aim a little left of centre so the detail card has room on the right
  const cx = card.hidden ? 700 : 610;
  const tx = cx - (r.x + r.w / 2) * z, ty = 450 - (r.y + r.h / 2) * z;
  camera.style.transform = `translate(${tx}px, ${ty}px) scale(${z})`;
  document.body.classList.add('zoomed');
  back.hidden = false; hint.hidden = true;
  document.querySelectorAll('.unit').forEach((el) => {
    const on = el.dataset.unit === key;
    el.classList.toggle('active', on);
    el.querySelectorAll('.spine').forEach((sp) => { sp.tabIndex = on ? 0 : -1; });
    el.querySelector('.hit').tabIndex = on ? -1 : 0;
  });
}
function reset() {
  current = null;
  camera.style.transform = '';
  document.body.classList.remove('zoomed');
  back.hidden = true; hint.hidden = false;
  closeCard();
  document.querySelectorAll('.unit').forEach((el) => {
    el.classList.remove('active');
    el.querySelectorAll('.spine').forEach((sp) => { sp.tabIndex = -1; });
    el.querySelector('.hit').tabIndex = 0;
  });
}

/* ---------- detail card ---------- */
const card = $('#card'), tip = $('#tip');
const byId = new Map(books.map((b) => [b.id, b]));
function shelfOf(b) {
  if (b.shelf === 'read') return b.rating >= 5 ? 'favourite' : 'read';
  return b.shelf === 'to-read' ? 'toread' : 'reading';
}
function openCard(id) {
  const b = byId.get(+id); if (!b) return;
  $('#card-shelf').textContent = SHELF_LABEL[shelfOf(b)];
  $('#card-title').textContent = b.title;
  $('#card-sub').textContent = b.subtitle; $('#card-sub').hidden = !b.subtitle;
  $('#card-author').textContent = b.author;
  const stars = $('#card-stars');
  stars.hidden = !b.rating;
  stars.textContent = '★'.repeat(Math.round(b.rating)) + '☆'.repeat(5 - Math.round(b.rating));
  stars.setAttribute('aria-label', `${b.rating} out of 5 stars`);
  $('#card-meta').textContent = [b.year, b.pages ? `${b.pages} pages` : ''].filter(Boolean).join(' · ');
  $('#card-buy').href = amazonUrl(b);
  card.hidden = false; tip.hidden = true;
  if (current && !narrow()) zoom(current);   // re-aim so the card never covers the shelf
}
function closeCard() { card.hidden = true; }
$('.card-close').addEventListener('click', () => { closeCard(); if (current) zoom(current); });

/* ---------- events ---------- */
room.addEventListener('click', (e) => {
  const z = e.target.closest('[data-zoom]');
  if (z) { zoom(z.dataset.zoom); return; }
  const sp = e.target.closest('.spine');
  if (sp && sp.closest('.unit.active')) openCard(sp.dataset.id);
});
listView.addEventListener('click', (e) => { const b = e.target.closest('button[data-id]'); if (b) openCard(b.dataset.id); });
back.addEventListener('click', reset);
addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (!card.hidden) { closeCard(); if (current) zoom(current); } else if (current) reset(); } });
viewport.addEventListener('click', (e) => { if (current && !e.target.closest('.unit, .card, .back')) reset(); });

// tooltip with the full title while hovering or focusing a spine
function showTip(sp) {
  const b = byId.get(+sp.dataset.id); if (!b) return;
  tip.innerHTML = `<b>${esc(b.title)}</b><span>${esc(b.author)}</span>`;
  tip.hidden = false;
  const r = sp.getBoundingClientRect();
  const w = tip.offsetWidth;
  tip.style.left = `${clamp(r.left + r.width / 2 - w / 2, 8, innerWidth - w - 8)}px`;
  tip.style.top = `${Math.max(8, r.top - tip.offsetHeight - 10)}px`;
}
room.addEventListener('pointerover', (e) => { const sp = e.target.closest('.spine'); if (sp && sp.closest('.unit.active')) showTip(sp); });
room.addEventListener('pointerout', (e) => { if (e.target.closest('.spine')) tip.hidden = true; });
room.addEventListener('focusin', (e) => { const sp = e.target.closest('.spine'); if (sp && sp.closest('.unit.active')) showTip(sp); });
room.addEventListener('focusout', () => { tip.hidden = true; });
