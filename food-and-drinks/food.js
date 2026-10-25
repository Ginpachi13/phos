import data from '../src/places.json';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// only ever link to http(s) addresses
const safe = (u) => (/^https?:\/\//i.test(u || '') ? esc(u) : '');

const cities = data.cities.filter((c) => c.places.length);

$('#tiles').innerHTML = cities.map((c) => `
  <a class="tile" href="#${esc(c.id)}">
    <span class="tile-name">${esc(c.name)}</span>
    <span class="tile-meta">${esc(c.region)} · ${c.places.length} ${c.places.length === 1 ? 'place' : 'places'}</span>
    <span class="tile-go" aria-hidden="true">↓</span>
  </a>`).join('');

const card = (p) => {
  const maps = safe(p.mapsUrl), site = safe(p.websiteUrl), img = safe(p.imageUrl);
  return `
  <article class="card">
    ${img ? `<figure class="photo"><img src="${img}" alt="${esc(p.imageAlt || p.name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">${site ? `<figcaption>Photo: <a href="${site}" target="_blank" rel="noopener noreferrer">${esc(p.name)} website</a></figcaption>` : ''}</figure>` : ''}
    <div class="body">
    ${p.recommendedBy ? `<p class="by">Recommended by <b>${esc(p.recommendedBy)}</b></p>` : ''}
    <h3>${esc(p.name)}</h3>
    <p class="where"><span class="chip">${esc(p.type)}</span> ${esc(p.area)}</p>
    <p class="desc">${esc(p.description)}</p>
    <div class="links">
      ${maps ? `<a href="${maps}" target="_blank" rel="noopener noreferrer">View on Maps <span aria-hidden="true">↗</span></a>` : ''}
      ${site ? `<a href="${site}" target="_blank" rel="noopener noreferrer">Website <span aria-hidden="true">↗</span></a>` : ''}
    </div>
    </div>
  </article>`;
};

$('#cities').innerHTML = cities.map((c) => `
  <section class="city" id="${esc(c.id)}" aria-labelledby="${esc(c.id)}-h">
    <div class="city-head"><h2 id="${esc(c.id)}-h">${esc(c.name)}</h2><p>${esc(c.region)}</p></div>
    <div class="cards">${c.places.map(card).join('')}</div>
    <a class="top" href="#destinations">↑ All destinations</a>
  </section>`).join('');

// if a venue has moved or removed its photo, hide the picture and keep the card
$('#cities').addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG') e.target.closest('.photo')?.remove();
}, true);
