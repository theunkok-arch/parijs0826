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

/* Gevuld slot wordt een knop, leeg slot blijft zichtbaar als plek waar
   de link nog moet komen. Zo blijft de kaart-layout altijd hetzelfde. */
function linkBtn(url, label, iconName, extraClass = '') {
  if (!url) {
    return h`<span class="btn btn-slot ${extraClass}" aria-disabled="true" title="${label} nog toevoegen">${icon(iconName)}${label}</span>`;
  }
  return h`<a class="btn ${extraClass}" href="${url}" target="_blank" rel="noopener">${icon(iconName)}${label}</a>`;
}

function itemCard(item) {
  const links = item.links || {};
  return h`
    <article class="card" id="item-${item.id}">
      <div class="card-top">
        <span class="time-chip">${item.time}</span>
        <h3>${item.title}</h3>
      </div>
      ${item.desc ? h`<p class="desc">${item.desc}</p>` : ''}
      ${item.address ? h`<p class="address">${item.address}</p>` : ''}
      ${item.check ? h`<p class="check"><strong>Nog checken:</strong> ${item.check}</p>` : ''}
      <div class="btnrow">
        ${item.mapsUrl ? linkBtn(item.mapsUrl, 'Kaart', 'pin', 'btn-maps') : ''}
        ${LINK_SLOTS.map((slot) => linkBtn(links[slot.key], slot.label, slot.icon, 'btn-social'))}
      </div>
    </article>`;
}

function routeCard(route) {
  if (!route) return '';
  let body;
  if (route.embedUrl) {
    body = h`<div class="route-embed"><iframe src="${route.embedUrl}" loading="lazy" title="Routekaart ${route.title}" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>`;
  } else {
    body = h`<div class="route-empty"><span>Routekaart volgt</span><small>Zet een Google Maps embed-link in <code>route.embedUrl</code> of een GPX-bestand in <code>route.gpxUrl</code>.</small></div>`;
  }
  return h`
    <section class="routecard">
      <p class="route-label">Route</p>
      <h3>${route.title}</h3>
      ${route.summary ? h`<p class="route-summary">${route.summary}</p>` : ''}
      ${body}
      <div class="btnrow">
        ${route.mapsUrl ? linkBtn(route.mapsUrl, 'Open in Maps', 'route', 'btn-maps') : ''}
        ${route.gpxUrl ? linkBtn(route.gpxUrl, 'GPX', 'download') : ''}
      </div>
    </section>`;
}

function dayView(day) {
  return h`
    <section class="view day-view" id="view-${day.id}" data-accent="${day.accent}" hidden>
      <header class="view-head">
        <h2>${day.label} <span class="view-date">${formatDate(day.date)}</span></h2>
        <span class="accent-bar"></span>
        <p class="view-sub">${day.sub}</p>
        ${day.intro ? h`<p class="view-intro">${day.intro}</p>` : ''}
      </header>
      ${routeCard(day.route)}
      ${day.items.map(itemCard)}
    </section>`;
}

function homeView(data) {
  const { overview, meta, days } = data;
  return h`
    <section class="view" id="view-start" data-accent="sky">
      <section class="hero">
        <p class="hero-dates">${meta.dates}</p>
        <h2>${overview.headline}</h2>
        <p class="hero-intro">${overview.intro}</p>
        <div class="stats">
          ${overview.stats.map((s) => h`<div class="stat"><span class="stat-value">${s.value}</span><span class="stat-label">${s.label}</span></div>`)}
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
        <article class="card" id="praktisch-${p.id}">
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
          ${p.mapsUrl ? h`<div class="btnrow">${linkBtn(p.mapsUrl, 'Kaart', 'pin', 'btn-maps')}</div>` : ''}
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

/* ---------- Delen ---------- */

async function share(meta) {
  const btn = $('#share-btn');
  const url = meta.url || location.href;
  const done = () => {
    btn.textContent = 'Gekopieerd';
    setTimeout(() => { btn.textContent = 'Deel'; }, 2000);
  };
  if (navigator.share) {
    try { await navigator.share({ title: meta.title, text: meta.subtitle, url }); } catch { /* geannuleerd */ }
    return;
  }
  try { await navigator.clipboard.writeText(url); done(); } catch { /* geen toegang */ }
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

  $('#main').addEventListener('click', (e) => {
    const card = e.target.closest('[data-goto]');
    if (card) showView(card.dataset.goto);
  });

  window.addEventListener('hashchange', () => showView(location.hash.slice(1) || 'start'));
  $('#share-btn').addEventListener('click', () => share(data.meta));

  showView(firstViewId(data));
}

init();
