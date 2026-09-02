#!/usr/bin/env node
/**
 * Funda tracker: houdt bij hoe vaak onze woning bekeken en bewaard is.
 *
 * Commando's:
 *   node tracker/funda-tracker.mjs fetch     haal de cijfers op van funda en sla ze op
 *   node tracker/funda-tracker.mjs add --bekeken 1234 --bewaard 56 [--datum 2026-09-02]
 *   node tracker/funda-tracker.mjs report    print het overzicht (dit draait bij "update mij")
 *   node tracker/funda-tracker.mjs diagnose  laat zien wat funda terugstuurt (voor als de parser mist)
 *
 * Geen dependencies, draait op Node 18+.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HIER = dirname(fileURLToPath(import.meta.url));
const DATA_PAD = join(HIER, 'data', 'funda-stats.json');
const DEBUG_MAP = join(HIER, '.debug');

// ---------------------------------------------------------------- opslag

function leesStore() {
  if (!existsSync(DATA_PAD)) {
    throw new Error(`Datastore ontbreekt: ${DATA_PAD}`);
  }
  return JSON.parse(readFileSync(DATA_PAD, 'utf8'));
}

function schrijfStore(store) {
  mkdirSync(dirname(DATA_PAD), { recursive: true });
  writeFileSync(DATA_PAD, JSON.stringify(store, null, 2) + '\n', 'utf8');
}

// ---------------------------------------------------------------- parsing

/**
 * Funda kan de cijfers op twee plekken zetten: in de embedded JSON van de
 * pagina (betrouwbaarst) of in de zichtbare tekst ("1.234 keer bekeken").
 * We proberen ze allebei, in die volgorde.
 */
const JSON_PATRONEN_BEKEKEN = [
  /"(?:aantalKeerBekeken|aantalKeerBezocht|viewCount|viewsCount|numberOfViews|totalViews|pageViews|views)"\s*:\s*"?(\d{1,9})"?/i,
];
const JSON_PATRONEN_BEWAARD = [
  /"(?:aantalKeerBewaard|aantalKeerOpgeslagen|aantalKeerFavoriet|saveCount|savesCount|numberOfSaves|bookmarkCount|favoriteCount|favouriteCount|savedCount|saves)"\s*:\s*"?(\d{1,9})"?/i,
];
const TEKST_PATRONEN_BEKEKEN = [
  /([\d][\d.\s]*)\s*(?:keer|x)?\s*bekeken/i,
  /bekeken\s*[:\-]?\s*([\d][\d.\s]*)/i,
];
const TEKST_PATRONEN_BEWAARD = [
  /([\d][\d.\s]*)\s*(?:keer|x)?\s*(?:bewaard|opgeslagen)/i,
  /(?:bewaard|opgeslagen)\s*[:\-]?\s*([\d][\d.\s]*)/i,
];

function naarGetal(ruw) {
  const cijfers = String(ruw).replace(/[^\d]/g, '');
  if (!cijfers) return null;
  const n = Number(cijfers);
  return Number.isFinite(n) ? n : null;
}

function striptTags(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ');
}

function zoek(bron, patronen) {
  for (const patroon of patronen) {
    const treffer = bron.match(patroon);
    if (treffer) {
      const waarde = naarGetal(treffer[1]);
      if (waarde !== null) return { waarde, patroon: patroon.source };
    }
  }
  return null;
}

export function parseStats(html) {
  const tekst = striptTags(html);
  const bekeken = zoek(html, JSON_PATRONEN_BEKEKEN) ?? zoek(tekst, TEKST_PATRONEN_BEKEKEN);
  const bewaard = zoek(html, JSON_PATRONEN_BEWAARD) ?? zoek(tekst, TEKST_PATRONEN_BEWAARD);
  return {
    bekeken: bekeken?.waarde ?? null,
    bewaard: bewaard?.waarde ?? null,
    patronen: { bekeken: bekeken?.patroon ?? null, bewaard: bewaard?.patroon ?? null },
  };
}

/**
 * Funda toont de populariteitscijfers alleen aan ingelogde gebruikers. Op de
 * publieke pagina staat "Log in om te bekijken" met 0x Bekeken en 0x Bewaard.
 * Dat is geen meting van nul, dat is een muur.
 */
export function detecteerLoginMuur(html) {
  return /log\s*in\s*om\s*te\s*bekijken/i.test(striptTags(html));
}

/**
 * Een nul is geen meting maar een misser: een woning die live staat is altijd
 * minstens een keer bekeken. Nul betekent dus dat de parser de verkeerde plek
 * pakt, of dat we een blokkade- of consentpagina te pakken hebben.
 */
export function filterOnwaarschijnlijk(ruw) {
  return {
    bekeken: ruw.bekeken !== null && ruw.bekeken > 0 ? ruw.bekeken : null,
    bewaard: ruw.bewaard !== null && ruw.bewaard > 0 ? ruw.bewaard : null,
  };
}

// ---------------------------------------------------------------- ophalen

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};

function headers() {
  // Een funda-sessiecookie kan meegegeven worden via de omgevingsvariabele
  // FUNDA_COOKIE. Zonder die cookie zijn de populariteitscijfers niet zichtbaar.
  const cookie = process.env.FUNDA_COOKIE;
  return cookie ? { ...BROWSER_HEADERS, Cookie: cookie } : { ...BROWSER_HEADERS };
}

async function haalPagina(url, pogingen = 3) {
  let laatsteFout = null;
  for (let poging = 1; poging <= pogingen; poging++) {
    try {
      const res = await fetch(url, { headers: headers(), redirect: 'follow' });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return await res.text();
    } catch (fout) {
      laatsteFout = fout;
      if (poging < pogingen) {
        const wacht = 2000 * 2 ** (poging - 1);
        console.error(`Poging ${poging} mislukt (${fout.message}), opnieuw over ${wacht / 1000}s`);
        await new Promise((r) => setTimeout(r, wacht));
      }
    }
  }
  throw laatsteFout;
}

// ---------------------------------------------------------------- metingen

function vandaag() {
  return new Date().toISOString().slice(0, 10);
}

function voegMetingToe(store, meting) {
  const bestaand = store.metingen.findIndex((m) => m.datum === meting.datum);
  if (bestaand !== -1) store.metingen[bestaand] = meting;
  else store.metingen.push(meting);
  store.metingen.sort((a, b) => a.datum.localeCompare(b.datum));
  return store;
}

async function commandoFetch() {
  const store = leesStore();
  const url = store.woning.url;
  let status = 'ok';
  let melding = '';

  try {
    const html = await haalPagina(url);
    const ruw = parseStats(html);
    const stats = filterOnwaarschijnlijk(ruw);

    if (stats.bekeken === null && stats.bewaard === null) {
      if (detecteerLoginMuur(html)) {
        throw new Error(
          'Funda toont de populariteitscijfers alleen aan ingelogde gebruikers ' +
            '("Log in om te bekijken", 0x Bekeken en 0x Bewaard op de publieke pagina). ' +
            'Zet een geldige funda-sessiecookie in de omgevingsvariabele FUNDA_COOKIE, ' +
            'of voer de cijfers handmatig in met: funda-tracker.mjs add --bekeken N --bewaard N',
        );
      }
      mkdirSync(DEBUG_MAP, { recursive: true });
      const dump = join(DEBUG_MAP, `funda-${vandaag()}.html`);
      writeFileSync(dump, html, 'utf8');
      throw new Error(
        `Geen bruikbare cijfers gevonden in de pagina (${html.length} tekens, ` +
          `ruwe parser gaf bekeken=${ruw.bekeken} bewaard=${ruw.bewaard}). ` +
          `Ruwe HTML weggeschreven naar ${dump} zodat de patronen bijgewerkt kunnen worden. ` +
          `Draai "diagnose" om te zien wat er wel op de pagina staat.`,
      );
    }

    voegMetingToe(store, {
      datum: vandaag(),
      tijdstip: new Date().toISOString(),
      bekeken: stats.bekeken,
      bewaard: stats.bewaard,
      bron: 'automatisch',
    });
    melding = `bekeken=${stats.bekeken ?? 'onbekend'}, bewaard=${stats.bewaard ?? 'onbekend'}`;
    console.log(`Meting opgeslagen: ${melding}`);
  } catch (fout) {
    status = 'mislukt';
    melding = fout.message;
    console.error(`Ophalen mislukt: ${melding}`);
  }

  store.laatsteRun = { tijdstip: new Date().toISOString(), status, melding };
  schrijfStore(store);
  if (status === 'mislukt') process.exitCode = 1;
}

function commandoAdd(args) {
  const store = leesStore();
  const bekeken = naarGetal(args.bekeken ?? args.views ?? '');
  const bewaard = naarGetal(args.bewaard ?? args.saves ?? '');
  if (bekeken === null && bewaard === null) {
    console.error('Geef minstens --bekeken of --bewaard mee, bijvoorbeeld:');
    console.error('  node tracker/funda-tracker.mjs add --bekeken 1240 --bewaard 58');
    process.exitCode = 1;
    return;
  }
  const datum = args.datum ?? vandaag();
  voegMetingToe(store, {
    datum,
    tijdstip: new Date().toISOString(),
    bekeken,
    bewaard,
    bron: 'handmatig',
  });
  store.laatsteRun = {
    tijdstip: new Date().toISOString(),
    status: 'ok',
    melding: `handmatig ingevoerd voor ${datum}`,
  };
  schrijfStore(store);
  console.log(`Handmatige meting opgeslagen voor ${datum}: bekeken=${bekeken}, bewaard=${bewaard}`);
}

/**
 * Laat zien wat funda daadwerkelijk terugstuurt, zodat de patronen bijgesteld
 * kunnen worden zonder de hele pagina te hoeven downloaden.
 */
async function commandoDiagnose() {
  const store = leesStore();
  const res = await fetch(store.woning.url, { headers: headers(), redirect: 'follow' });
  const html = await res.text();

  console.log(`HTTP ${res.status} ${res.statusText}`);
  console.log(`Eind-URL: ${res.url}`);
  console.log(`Lengte: ${html.length} tekens`);
  const titel = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  console.log(`Titel: ${titel ? titel[1].trim().slice(0, 160) : 'geen'}`);

  const tekst = striptTags(html);
  for (const woord of ['bekeken', 'bewaard', 'opgeslagen', 'belangstelling']) {
    const treffers = [...tekst.matchAll(new RegExp(woord, 'gi'))].slice(0, 5);
    console.log(`\nZichtbare tekst rond "${woord}" (${treffers.length} treffers, max 5):`);
    if (treffers.length === 0) console.log('  niet gevonden');
    for (const t of treffers) {
      const start = Math.max(0, t.index - 90);
      console.log(`  ...${tekst.slice(start, t.index + 70).trim()}...`);
    }
  }

  const sleutelPatroon =
    /"(\w*(?:[Vv]iew|[Ss]ave|[Bb]ekeken|[Bb]ewaard|[Oo]pgeslagen|[Ff]avo|[Bb]ookmark)\w*)"\s*:\s*("?[\w.-]{1,20}"?)/g;
  const sleutels = [...html.matchAll(sleutelPatroon)].slice(0, 40);
  console.log(`\nJSON-sleutels die op views of saves lijken (${sleutels.length}, max 40):`);
  if (sleutels.length === 0) console.log('  geen gevonden');
  for (const s of sleutels) console.log(`  ${s[1]} = ${s[2]}`);

  console.log(`\nLogin-muur aanwezig: ${detecteerLoginMuur(html) ? 'ja' : 'nee'}`);
  console.log(`Sessiecookie meegegeven: ${process.env.FUNDA_COOKIE ? 'ja' : 'nee'}`);

  const stats = parseStats(html);
  console.log(`\nHuidige parser levert: bekeken=${stats.bekeken} bewaard=${stats.bewaard}`);
  console.log(`Gebruikte patronen: ${JSON.stringify(stats.patronen)}`);
}

// ---------------------------------------------------------------- rapport

function nl(getal) {
  return getal === null || getal === undefined ? 'onbekend' : getal.toLocaleString('nl-NL');
}

function verschil(nu, eerder) {
  if (nu === null || eerder === null || nu === undefined || eerder === undefined) return '';
  const delta = nu - eerder;
  if (delta === 0) return ' (gelijk)';
  return ` (${delta > 0 ? '+' : ''}${delta.toLocaleString('nl-NL')})`;
}

function kaal(tekst) {
  return tekst.replace(/[()]/g, '').trim() || 'onbekend';
}

function datumNL(iso) {
  const [j, m, d] = iso.split('-');
  return `${Number(d)}-${Number(m)}-${j}`;
}

function commandoReport() {
  const store = leesStore();
  const metingen = store.metingen;
  const regels = [];

  regels.push(`Funda-overzicht: ${store.woning.label}`);
  regels.push(store.woning.url);
  regels.push('');

  if (metingen.length === 0) {
    regels.push('Nog geen metingen. Voer de cijfers in met:');
    regels.push('  node tracker/funda-tracker.mjs add --bekeken N --bewaard N');
  } else {
    const laatste = metingen[metingen.length - 1];
    const vorige = metingen[metingen.length - 2] ?? null;
    const eerste = metingen[0];

    const weekGeleden = new Date(Date.parse(laatste.datum) - 7 * 86400000).toISOString().slice(0, 10);
    const week = [...metingen].reverse().find((m) => m.datum <= weekGeleden) ?? null;

    regels.push(`Stand op ${datumNL(laatste.datum)}`);
    regels.push(`  Bekeken: ${nl(laatste.bekeken)}${vorige ? verschil(laatste.bekeken, vorige.bekeken) + ' sinds vorige meting' : ''}`);
    regels.push(`  Bewaard: ${nl(laatste.bewaard)}${vorige ? verschil(laatste.bewaard, vorige.bewaard) + ' sinds vorige meting' : ''}`);

    if (week) {
      regels.push('');
      regels.push(`Ten opzichte van ${datumNL(week.datum)} (week ervoor)`);
      regels.push(`  Bekeken: ${kaal(verschil(laatste.bekeken, week.bekeken))}`);
      regels.push(`  Bewaard: ${kaal(verschil(laatste.bewaard, week.bewaard))}`);
    }

    if (metingen.length > 1 && eerste.bekeken !== null && laatste.bekeken !== null) {
      const dagen = Math.max(1, Math.round((Date.parse(laatste.datum) - Date.parse(eerste.datum)) / 86400000));
      const perDag = (laatste.bekeken - eerste.bekeken) / dagen;
      regels.push('');
      regels.push(`Sinds ${datumNL(eerste.datum)}: ${nl(laatste.bekeken - eerste.bekeken)} views erbij in ${dagen} dagen, gemiddeld ${perDag.toFixed(1)} per dag.`);
      if (laatste.bewaard !== null && laatste.bekeken > 0) {
        regels.push(`Bewaarratio: ${((laatste.bewaard / laatste.bekeken) * 100).toFixed(1)}% van de kijkers bewaart de woning.`);
      }
    }

    regels.push('');
    regels.push('Laatste 7 metingen:');
    for (const m of metingen.slice(-7)) {
      const merk = m.bron === 'handmatig' ? ' [handmatig]' : '';
      regels.push(`  ${datumNL(m.datum).padEnd(11)} bekeken ${nl(m.bekeken).padStart(7)}   bewaard ${nl(m.bewaard).padStart(5)}${merk}`);
    }
  }

  if (store.laatsteRun?.status === 'mislukt') {
    regels.push('');
    regels.push(`LET OP: de laatste automatische run is mislukt (${store.laatsteRun.tijdstip.slice(0, 16).replace('T', ' ')} UTC).`);
    regels.push(`Reden: ${store.laatsteRun.melding}`);
    regels.push('De cijfers hierboven zijn dus mogelijk verouderd.');
  }

  console.log(regels.join('\n'));
}

// ---------------------------------------------------------------- cli

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const sleutel = argv[i].slice(2);
      const waarde = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
      args[sleutel] = waarde;
    }
  }
  return args;
}

// Alleen de CLI draaien als dit bestand direct wordt uitgevoerd, zodat
// parseStats importeerbaar blijft voor de tests.
const direct = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (direct) {
  const [commando, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);

  switch (commando) {
    case 'fetch':
      await commandoFetch();
      break;
    case 'add':
      commandoAdd(args);
      break;
    case 'diagnose':
      await commandoDiagnose();
      break;
    case 'report':
    case undefined:
      commandoReport();
      break;
    default:
      console.error(`Onbekend commando: ${commando}`);
      console.error('Gebruik: fetch | add --bekeken N --bewaard N | report | diagnose');
      process.exitCode = 1;
  }
}
