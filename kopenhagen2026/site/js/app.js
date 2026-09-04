/* Kopenhagen 2026 - alles wordt gerenderd vanuit data/reis.json.
   Wil je het programma wijzigen? Pas alleen dat bestand aan. */

import { h, raw, mount } from './html.js';

const DATA_URL = 'data/reis.json';

const ICONS = {
  pin: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/></svg>',
  route: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 21 4l-7.5 18-2.3-8.2L3 11.5z"/></svg>',
  globe: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  insta: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  tiktok: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4v9.5a4 4 0 1 1-3.2-3.92"/><path d="M15 4a4.5 4.5 0 0 0 4.5 4.5"/></svg>',
  phone: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4 5.2 2 2 0 0 1 6.5 3z"/></svg>',
  download: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7.5 11 12 15.5 16.5 11M5 19h14"/></svg>',
};

/* Een linkslot toevoegen? Eén regel hieronder, en de sleutel in reis.json. */
const LINK_SLOTS = [
  { key: 'web', label: 'Website', icon: 'globe' },
  { key: 'insta', label: 'Instagram', icon: 'insta' },
  { key: 'tiktok', label: 'TikTok', icon: 'tiktok' },
];

const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

const $ = (sel) => document.querySelector(sel);

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

function todayIso() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

/* ---------- Bouwstenen ---------- */

function icon(name) {
  return raw(ICONS[name] || '');
}

/* Een rij zonder knoppen laten we helemaal weg, anders blijft er marge staan. */
function btnRow(buttons, extraClass = '') {
  const filled = buttons.filter(Boolean);
  if (!filled.length) return '';
  return h`<div class="btnrow ${extraClass}">${filled}</div>`;
}

/* Zonder URL geen knop: een grijze dode knop is alleen maar ruis. */
function linkBtn(url, label, iconName, extraClass = '') {
  if (!url) return '';
  return h`<a class="btn ${extraClass}" href="${url}" target="_blank" rel="noopener">${icon(iconName)}${label}</a>`;
}

/* Foto's staan in img/. De .webp-bron wordt alleen aangeboden als het bestand
   er echt is (webp: true in de data): een <picture> valt namelijk NIET terug op
   de <img> wanneer de gekozen <source> 404't, dan blijft het beeld leeg.
   Ontbreekt de foto helemaal, dan haalt het error-vangnet in init() hem weg. */
function picture(image, shape) {
  if (!image || !image.file) return '';
  const jpg = h`<img src="img/${image.file}.jpg" alt="${image.alt}" loading="lazy" decoding="async">`;
  const pic = image.webp
    ? h`<picture class="media media-${shape}"><source srcset="img/${image.file}.webp" type="image/webp">${jpg}</picture>`
    : h`<picture class="media media-${shape}">${jpg}</picture>`;
  // Een credit staat bij de foto waar hij bij hoort, niet op elke pagina.
  if (!image.credit) return pic;
  const c = image.credit;
  return h`${pic}<p class="fotocredit">${c.url
    ? h`<a href="${c.url}" target="_blank" rel="noopener">${c.text}</a>`
    : c.text}</p>`;
}

function placeCard(place) {
  const l = place.links || {};
  return h`
    <article class="place">
      <p class="place-role">${place.role}</p>
      <h4>${place.name}</h4>
      <p class="place-desc">${place.desc}</p>
      ${place.address ? h`<p class="address">${place.address}</p>` : ''}
      ${btnRow([
        place.mapsUrl ? linkBtn(place.mapsUrl, 'Kaart', 'pin', 'btn-maps') : '',
        place.phone ? h`<a class="btn" href="tel:${place.phone.replace(/\s/g, '')}">${icon('phone')}Bellen</a>` : '',
        ...LINK_SLOTS.map((slot) => linkBtn(l[slot.key], slot.label, slot.icon, 'btn-social')),
      ])}
    </article>`;
}

function itemCard(item) {
  const links = item.links || {};
  // lege slots alleen bij een echte locatie, anders wordt het ruis op logistieke regels
  const showSlots = Boolean(item.mapsUrl) || LINK_SLOTS.some((slot) => links[slot.key]);
  return h`
    <article class="card${item.img ? ' has-media' : ''}" id="item-${item.id}">
      ${picture(item.img, 'card')}
      <div class="card-top">
        <span class="time-chip">${item.time}</span>
        <h3>${item.title}</h3>
      </div>
      ${item.desc ? h`<p class="desc">${item.desc}</p>` : ''}
      ${item.address ? h`<p class="address">${item.address}</p>` : ''}
      ${item.warn ? h`<p class="warn"><strong>Let op:</strong> ${item.warn}</p>` : ''}
      ${item.check ? h`<p class="check"><strong>Nog checken:</strong> ${item.check}</p>` : ''}
      ${btnRow([
        item.mapsUrl ? linkBtn(item.mapsUrl, 'Kaart', 'pin', 'btn-maps') : '',
        ...(showSlots ? LINK_SLOTS.map((slot) => linkBtn(links[slot.key], slot.label, slot.icon, 'btn-social')) : []),
      ])}
      ${item.places && item.places.length ? h`<div class="places">${item.places.map(placeCard)}</div>` : ''}
    </article>`;
}

function routeCard(r) {
  return h`
    <section class="routecard">
      <div class="route-head">
        <p class="route-label">Route</p>
        <span class="route-mode">${r.mode}</span>
      </div>
      <h3>${r.title}</h3>
      ${r.summary ? h`<p class="route-summary">${r.summary}</p>` : ''}
      ${r.via && r.via.length ? h`<ol class="route-via">${r.via.map((v) => h`<li>${v}</li>`)}</ol>` : ''}
      ${r.embedUrl ? h`<div class="route-embed"><iframe src="${r.embedUrl}" loading="lazy" title="Routekaart ${r.title}" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>` : ''}
      ${btnRow([
        r.mapsUrl ? linkBtn(r.mapsUrl, 'Route in Maps', 'route', 'btn-maps') : '',
        r.gpxUrl ? linkBtn(r.gpxUrl, 'GPX', 'download') : '',
      ])}
    </section>`;
}

function dayView(day) {
  return h`
    <section class="view day-view" id="view-${day.id}" data-accent="${day.accent}" hidden>
      <header class="view-head">
        <h2>${day.label} <span class="view-date">${formatDate(day.date)}</span></h2>
        <span class="accent-bar"></span>
        <p class="view-sub">${day.sub}</p>
      </header>
      ${picture(day.hero, 'hero')}
      ${day.intro ? h`<p class="view-intro">${day.intro}</p>` : ''}
      ${(day.routes || []).map(routeCard)}
      ${day.items.map(itemCard)}
      ${day.outro ? h`<p class="outro">${day.outro}</p>` : ''}
    </section>`;
}

function homeView(data) {
  const { overview, meta, days } = data;
  return h`
    <section class="view" id="view-start" data-accent="sky">
      <section class="hero">
        <div class="hero-media">
          ${picture(meta.hero, 'hero')}
          <div class="hero-overlay">
            <p class="hero-dates">${meta.dates}</p>
            <h2>${overview.headline}</h2>
          </div>
        </div>
        <div class="hero-body">
          <p class="hero-intro">${overview.intro}</p>
          <div class="stats">
            ${overview.stats.map((s) => h`<div class="stat"><span class="stat-value">${s.value}</span><span class="stat-label">${s.label}</span></div>`)}
          </div>
        </div>
      </section>

      <h3 class="section-title">Zo ziet de week eruit</h3>
      <div class="daylist">
        ${days.map((day) => h`
          <button class="daycard" type="button" data-goto="${day.id}" data-accent="${day.accent}">
            <span class="daycard-date">${day.label} ${formatDate(day.date)}</span>
            <span class="daycard-title">${day.sub}</span>
            <span class="daycard-count">${day.items.length} ${day.items.length === 1 ? 'onderdeel' : 'onderdelen'}</span>
          </button>`)}
      </div>

      <h3 class="section-title">Waar we naar uitkijken</h3>
      <ul class="highlights">
        ${overview.highlights.map((t) => h`<li>${t}</li>`)}
      </ul>
    </section>`;
}

function praktischView(data) {
  return h`
    <section class="view" id="view-praktisch" data-accent="sand" hidden>
      <header class="view-head">
        <h2>Praktisch</h2>
        <span class="accent-bar"></span>
        <p class="view-sub">De dingen die vastliggen of vooraf geregeld moeten zijn.</p>
      </header>
      ${data.praktisch.map((p) => h`
        <article class="card${p.img ? ' has-media' : ''}" id="praktisch-${p.id}">
          ${picture(p.img, 'card')}
          <h3>${p.title}</h3>
          <p class="desc">${p.text}</p>
          ${p.rows && p.rows.length ? h`
            <dl class="rows">
              ${p.rows.map((r) => h`
                <div class="row">
                  <dt>${r.label}</dt>
                  <dd>${r.href ? h`<a href="${r.href}">${r.value}</a>` : r.value}</dd>
                </div>`)}
            </dl>` : ''}
          ${btnRow([
            p.mapsUrl ? linkBtn(p.mapsUrl, 'Kaart', 'pin', 'btn-maps') : '',
            ...LINK_SLOTS.map((slot) => linkBtn((p.links || {})[slot.key], slot.label, slot.icon, 'btn-social')),
          ])}
        </article>`)}
    </section>`;
}

/* ---------- Navigatie ---------- */

function navView(data) {
  const today = todayIso();
  return h`
    <button class="daytab" type="button" data-view="start">Start</button>
    ${data.days.map((day) => h`
      <button class="daytab ${day.date === today ? 'is-today' : ''}" type="button" data-view="${day.id}" data-accent="${day.accent}">
        ${day.short} ${Number(day.date.split('-')[2])}
      </button>`)}
    <button class="daytab" type="button" data-view="praktisch" data-accent="sand">Praktisch</button>`;
}

function showView(id) {
  const target = document.getElementById(`view-${id}`) ? id : 'start';
  document.querySelectorAll('.view').forEach((view) => {
    view.hidden = view.id !== `view-${target}`;
  });
  document.querySelectorAll('.daytab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === target);
  });
  if (location.hash.slice(1) !== target) location.hash = target;
  window.scrollTo({ top: 0 });
}

function firstViewId(data) {
  const fromHash = location.hash.slice(1);
  if (fromHash) return fromHash;
  const today = data.days.find((day) => day.date === todayIso());
  return today ? today.id : 'start';
}

/* ---------- Start ---------- */

async function init() {
  let data;
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`status ${res.status}`);
    data = await res.json();
  } catch (err) {
    mount($('#main'), h`<p class="loading">Het programma kon niet geladen worden. Ververs de pagina.<br><small>${err.message}</small></p>`);
    return;
  }

  document.title = data.meta.title;
  $('#site-title').textContent = data.meta.title;
  $('#site-subtitle').textContent = data.meta.subtitle;
  $('#footer-status').textContent = data.meta.status;

  mount($('#daynav'), navView(data));
  mount($('#main'), h`${homeView(data)}${data.days.map(dayView)}${praktischView(data)}`);

  $('#daynav').addEventListener('click', (e) => {
    const tab = e.target.closest('.daytab');
    if (tab) showView(tab.dataset.view);
  });

  // Ontbreekt een fotobestand, dan halen we het beeld weg in plaats van
  // een gebroken plaatje te tonen. Error-events bubbelen niet, vandaar capture.
  $('#main').addEventListener('error', (e) => {
    const el = e.target;
    if (el.tagName !== 'IMG') return;
    const heroHolder = el.closest('.hero-media');
    const pic = el.closest('picture');
    if (pic) pic.remove();
    if (heroHolder) heroHolder.classList.add('no-media');
  }, true);

  $('#main').addEventListener('click', (e) => {
    const card = e.target.closest('[data-goto]');
    if (card) showView(card.dataset.goto);
  });

  window.addEventListener('hashchange', () => showView(location.hash.slice(1) || 'start'));

  showView(firstViewId(data));
}

init();
