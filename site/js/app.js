/* Parijs0826 — rendert alles client-side vanuit data/data.json */
(function () {
  'use strict';

  var DATA = null;
  var activeView = null;

  var URGENCY_ORDER = ['boek-vandaag', 'vooraf-aangeraden', 'op-de-dag', 'beslismoment', 'kan-ter-plekke'];
  var URGENCY_LABEL = {
    'boek-vandaag': 'BOEK NU',
    'vooraf-aangeraden': 'Vooraf aangeraden',
    'op-de-dag': 'Op de dag',
    'beslismoment': 'Beslismoment',
    'kan-ter-plekke': 'Kan ter plekke'
  };

  var BOOKED_KEY = 'parijs0826-geboekt';

  var ICONS = {
    check: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5 10 18 20 6"/></svg>',
    pin: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/></svg>',
    route: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 21 4l-7.5 18-2.3-8.2L3 11.5z"/></svg>',
    globe: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
    ticket: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M4 8a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2.5a1.5 1.5 0 0 0 0 3V16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2.5a1.5 1.5 0 0 0 0-3V8z"/></svg>'
  };

  function $(sel) { return document.querySelector(sel); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function dayShort(label) { return label.slice(0, 2); }

  function formatDate(iso) {
    var months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni',
      'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
    var p = iso.split('-');
    return parseInt(p[2], 10) + ' ' + months[parseInt(p[1], 10) - 1];
  }

  /* ---------- Cards ---------- */

  function socialBtns(social) {
    if (!social) return '';
    var h = '';
    if (social.tiktok) h += '<a class="btn btn-social" href="' + esc(social.tiktok) + '" target="_blank" rel="noopener">TikTok</a>';
    if (social.insta) h += '<a class="btn btn-social" href="' + esc(social.insta) + '" target="_blank" rel="noopener">Instagram</a>';
    if (social.featured && social.featured.url) {
      h += '<a class="btn btn-viral" href="' + esc(social.featured.url) + '" target="_blank" rel="noopener" title="' + esc(social.featured.label || '') + '">Viral</a>';
    }
    return h;
  }

  function itemCard(item, day, showDayLabel) {
    var h = '<article class="card">';

    if (showDayLabel) {
      h += '<span class="day-label bg-' + esc(day.color) + '">' + esc(day.label) + '</span>';
    }

    h += '<div class="card-top">';
    h += '<span class="time-chip chip-' + esc(day.color) + '">' + esc(item.time) + '</span>';
    h += '<h3>' + esc(item.title) + '</h3>';
    h += '</div>';

    h += '<p class="desc">' + esc(item.desc) + '</p>';
    if (item.why) {
      var whys = Array.isArray(item.why) ? item.why : [item.why];
      h += '<div class="why bg-' + esc(day.color) + '"><p class="why-label">Waarom hierheen</p>';
      whys.forEach(function (w) { h += '<p class="why-text">' + esc(w) + '</p>'; });
      h += '</div>';
    }
    if (item.address) h += '<p class="address">' + esc(item.address) + '</p>';
    if (item.warn) h += '<div class="warn"><strong>Let op:</strong> ' + esc(item.warn) + '</div>';

    if (item.options) {
      var lastGroup = null;
      item.options.forEach(function (o) {
        if (o.group && o.group !== lastGroup) {
          h += '<p class="option-group">' + esc(o.group) + '</p>';
          lastGroup = o.group;
        }
        h += '<div class="option">';
        h += '<p class="option-name">' + esc(o.name) + '</p>';
        h += '<p class="option-note">' + esc(o.note) + '</p>';
        if (o.why) h += '<p class="option-why">' + esc(o.why) + '</p>';
        var ob = '';
        if (o.mapsUrl) ob += '<a class="btn" href="' + esc(o.mapsUrl) + '" target="_blank" rel="noopener">' + ICONS.pin + 'Kaart</a>';
        if (o.web) ob += '<a class="btn" href="' + esc(o.web) + '" target="_blank" rel="noopener">' + ICONS.globe + 'Reserveer</a>';
        ob += socialBtns(o.social);
        if (ob) h += '<div class="btnrow option-btns">' + ob + '</div>';
        h += '</div>';
      });
    }

    var btns = '';
    if (item.mapsUrl) btns += '<a class="btn" href="' + esc(item.mapsUrl) + '" target="_blank" rel="noopener">' + ICONS.pin + 'Kaart</a>';
    if (item.routeUrl) btns += '<a class="btn" href="' + esc(item.routeUrl) + '" target="_blank" rel="noopener">' + ICONS.route + 'Route</a>';
    if (item.web) btns += '<a class="btn" href="' + esc(item.web) + '" target="_blank" rel="noopener">' + ICONS.globe + 'Site</a>';
    if (item.ticketRef) btns += '<button class="btn" type="button" data-ticketref="' + esc(item.ticketRef) + '">' + ICONS.ticket + 'Ticket</button>';
    btns += socialBtns(item.social);
    if (btns) h += '<div class="btnrow">' + btns + '</div>';

    if (item.planB) {
      var pbText = typeof item.planB === 'string' ? item.planB : item.planB.text;
      h += '<details class="planb"><summary>Plan B</summary><div class="planb-body">';
      h += '<p>' + esc(pbText) + '</p>';
      if (item.planB.mapsUrl) h += '<a class="btn" href="' + esc(item.planB.mapsUrl) + '" target="_blank" rel="noopener">' + ICONS.pin + 'Kaart</a>';
      h += '</div></details>';
    }

    h += '</article>';
    return h;
  }

  function getBooked() {
    try { return JSON.parse(localStorage.getItem(BOOKED_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveBooked(ids) {
    try { localStorage.setItem(BOOKED_KEY, JSON.stringify(ids)); } catch (e) { /* private mode */ }
  }

  function ticketCard(t) {
    var h = '<article class="ticket-card" id="ticket-' + esc(t.id) + '">';
    h += '<div class="ticket-head">';
    h += '<span class="badge badge-' + esc(t.urgency) + '">' + esc(URGENCY_LABEL[t.urgency] || t.urgency) + '</span>';
    h += '<button class="booked-toggle" type="button" data-booked="' + esc(t.id) + '" aria-pressed="false">' + ICONS.check + 'Geboekt</button>';
    h += '</div>';
    h += '<h3>' + esc(t.title) + '</h3>';
    h += '<p class="ticket-meta"><strong>Wanneer:</strong> ' + esc(t.when) + '</p>';
    h += '<p class="ticket-meta"><strong>Prijs:</strong> ' + esc(t.price) + '</p>';
    h += '<p class="ticket-note">' + esc(t.note) + '</p>';
    if (t.links) {
      h += '<div class="btnrow ticket-links">';
      t.links.forEach(function (l) {
        h += '<a class="btn" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + ICONS.globe + esc(l.label) + '</a>';
      });
      h += '</div>';
    } else if (t.url) {
      h += '<a class="btn-book" href="' + esc(t.url) + '" target="_blank" rel="noopener">Boek tickets</a>';
    }
    h += '</article>';
    return h;
  }

  /* ---------- Render ---------- */

  function renderHeader() {
    $('#site-title').textContent = DATA.meta.title;
    $('#site-subtitle').textContent = DATA.meta.subtitle;
    $('#footer-checked').textContent = DATA.meta.checked;
  }

  function renderNav() {
    var h = '';
    DATA.days.forEach(function (day) {
      h += '<button class="daytab" type="button" data-view="' + esc(day.id) + '" data-color="' + esc(day.color) + '">'
        + esc(dayShort(day.label)) + '</button>';
    });
    h += '<button class="daytab" type="button" data-view="tickets" data-color="tickets">Tickets</button>';
    $('#daynav').innerHTML = h;
  }

  function renderDays() {
    var h = '';
    DATA.days.forEach(function (day) {
      h += '<div class="day-section" id="day-' + esc(day.id) + '" hidden>';
      h += '<div class="day-header">';
      h += '<h2>' + esc(day.label) + ' <span class="day-date">' + esc(formatDate(day.date)) + '</span></h2>';
      h += '<span class="day-accent bg-' + esc(day.color) + '"></span>';
      h += '<p class="day-sub">' + esc(day.sub) + '</p>';
      h += '</div>';
      day.items.forEach(function (item) { h += itemCard(item, day, false); });
      h += '</div>';
    });
    $('#days').innerHTML = h;
  }

  function renderTickets() {
    var sorted = DATA.tickets.slice().sort(function (a, b) {
      return URGENCY_ORDER.indexOf(a.urgency) - URGENCY_ORDER.indexOf(b.urgency);
    });

    var h = '<h2 class="section-title">Tickets</h2>';
    h += '<p class="booked-counter" id="booked-counter"></p>';
    sorted.forEach(function (t) { h += ticketCard(t); });

    h += '<h2 class="section-title">Praktisch</h2>';
    DATA.praktisch.forEach(function (p) {
      h += '<div class="praktisch-card"><h3>' + esc(p.title) + '</h3><p>' + esc(p.text) + '</p></div>';
    });

    $('#tickets-view').innerHTML = h;
    updateBookedUI();
  }

  function updateBookedUI() {
    var booked = getBooked();
    var valid = booked.filter(function (id) {
      return DATA.tickets.some(function (t) { return t.id === id; });
    });
    DATA.tickets.forEach(function (t) {
      var card = $('#ticket-' + t.id);
      if (!card) return;
      var isBooked = valid.indexOf(t.id) !== -1;
      card.classList.toggle('booked', isBooked);
      var btn = card.querySelector('.booked-toggle');
      if (btn) btn.setAttribute('aria-pressed', isBooked ? 'true' : 'false');
    });
    var counter = $('#booked-counter');
    if (counter) counter.textContent = valid.length + ' van ' + DATA.tickets.length + ' geregeld';
  }

  function toggleBooked(id) {
    var booked = getBooked();
    var i = booked.indexOf(id);
    if (i === -1) booked.push(id); else booked.splice(i, 1);
    saveBooked(booked);
    updateBookedUI();
  }

  /* ---------- Views ---------- */

  function showView(id) {
    activeView = id;
    $('#search-view').hidden = true;
    $('#tickets-view').hidden = (id !== 'tickets');
    $('#days').hidden = (id === 'tickets');

    DATA.days.forEach(function (day) {
      var el = $('#day-' + day.id);
      if (el) el.hidden = (day.id !== id);
    });

    document.querySelectorAll('.daytab').forEach(function (tab) {
      var isActive = tab.getAttribute('data-view') === id;
      tab.className = 'daytab' + (isActive ? ' active-' + tab.getAttribute('data-color') : '');
    });

    window.scrollTo({ top: 0 });
  }

  function goToTicket(refId) {
    var input = $('#search');
    if (input.value) { input.value = ''; }
    showView('tickets');
    var el = $('#ticket-' + refId);
    if (!el) return;
    setTimeout(function () {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('flash');
      setTimeout(function () { el.classList.remove('flash'); }, 2000);
    }, 60);
  }

  /* ---------- NU/STRAKS tijdens het weekend zelf ---------- */

  function todayIso() {
    var n = new Date();
    var m = n.getMonth() + 1, d = n.getDate();
    return n.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
  }

  function markToday() {
    var day = null;
    DATA.days.forEach(function (d) { if (d.date === todayIso()) day = d; });
    if (!day) return null;

    var n = new Date();
    var nowMin = n.getHours() * 60 + n.getMinutes();
    var nowIdx = -1;
    day.items.forEach(function (item, i) {
      var p = item.time.split(':');
      if (parseInt(p[0], 10) * 60 + parseInt(p[1], 10) <= nowMin) nowIdx = i;
    });
    var nextIdx = nowIdx + 1 < day.items.length ? nowIdx + 1 : -1;

    var cards = document.querySelectorAll('#day-' + day.id + ' .card');
    var target = null;
    if (nowIdx >= 0 && cards[nowIdx]) {
      cards[nowIdx].classList.add('is-now');
      cards[nowIdx].querySelector('.card-top').insertAdjacentHTML('afterbegin', '<span class="live-badge live-now">NU</span>');
      target = cards[nowIdx];
    }
    if (nextIdx >= 0 && cards[nextIdx]) {
      cards[nextIdx].querySelector('.card-top').insertAdjacentHTML('afterbegin', '<span class="live-badge live-next">STRAKS</span>');
      if (!target) target = cards[nextIdx];
    }
    return { day: day, target: target };
  }

  /* ---------- Zoeken ---------- */

  function runSearch(query) {
    var q = query.trim().toLowerCase();
    if (!q) {
      showView(activeView || DATA.days[0].id);
      return;
    }

    var results = [];
    DATA.days.forEach(function (day) {
      day.items.forEach(function (item) {
        var optText = (item.options || []).map(function (o) { return o.name + ' ' + o.note; }).join(' ');
        var hay = (item.title + ' ' + item.desc + ' ' + optText + ' ' + (item.tags || []).join(' ')).toLowerCase();
        if (hay.indexOf(q) !== -1) results.push({ item: item, day: day });
      });
    });

    var h = '<h2 class="section-title">' + results.length + ' resultaat' + (results.length === 1 ? '' : 'en') + '</h2>';
    if (results.length === 0) {
      h += '<div class="search-empty">Niets gevonden voor "' + esc(query) + '". Probeer bijvoorbeeld: nike, entrecote, versailles.</div>';
    } else {
      results.forEach(function (r) { h += itemCard(r.item, r.day, true); });
    }

    $('#days').hidden = true;
    $('#tickets-view').hidden = true;
    var sv = $('#search-view');
    sv.innerHTML = h;
    sv.hidden = false;
  }

  /* ---------- Init ---------- */

  function bindEvents() {
    $('#daynav').addEventListener('click', function (e) {
      var tab = e.target.closest('.daytab');
      if (!tab) return;
      $('#search').value = '';
      showView(tab.getAttribute('data-view'));
    });

    document.body.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-ticketref]');
      if (btn) { goToTicket(btn.getAttribute('data-ticketref')); return; }
      var toggle = e.target.closest('[data-booked]');
      if (toggle) toggleBooked(toggle.getAttribute('data-booked'));
    });

    $('#search').addEventListener('input', function (e) {
      runSearch(e.target.value);
    });
  }

  fetch('data/data.json')
    .then(function (r) {
      if (!r.ok) throw new Error('data.json laden mislukt (' + r.status + ')');
      return r.json();
    })
    .then(function (json) {
      DATA = json;
      renderHeader();
      renderNav();
      renderDays();
      renderTickets();
      bindEvents();
      var live = markToday();
      showView(live ? live.day.id : DATA.days[0].id);
      if (live && live.target) {
        setTimeout(function () {
          live.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 250);
      }
    })
    .catch(function (err) {
      $('#main').innerHTML = '<div class="search-empty">Er ging iets mis bij het laden van het programma. Ververs de pagina.<br><small>' + esc(err.message) + '</small></div>';
    });
})();
