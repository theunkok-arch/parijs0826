# MVP-prompt voor Claude Code — kopieer alles hieronder in Claude Code

Bouw een statische, mobile-first website in deze projectmap en publiceer hem via GitHub naar Netlify als **parijs0826.netlify.app**. Lees eerst `CLAUDE.md` en `site/data/data.json` volledig.

## Wat het is
Een reisgids-app voor ons gezinsweekend Parijs, 20-23 augustus 2026. Doelgroep: het hele gezin, maar vooral onze dochters Roos (14) en Isis (16) — telefoonverslaafd, dus dit MOET op een telefoon perfect zijn. Alle content staat al in `site/data/data.json`: 4 dagen, 38 programma-items, 8 ticket-entries, praktische blokken en budget. **Verzin geen nieuwe feiten, prijzen of openingstijden: de JSON is de enige bron van waarheid.**

## Tech (niet onderhandelbaar)
- Puur statisch: `site/index.html` + `site/css/style.css` + `site/js/app.js` + `site/data/data.json`. Geen framework, geen build-stap, geen npm dependencies. `app.js` fetcht `data/data.json` en rendert alles client-side.
- Werkt offline-vriendelijk na eerste load is mooi meegenomen, maar geen service worker in de MVP.
- Netlify publisht de map `site/` (staat al in `netlify.toml`).

## Design
- **Mobile-first**, ontworpen op 390px breed, daarna pas desktop (max-width ~720px, gecentreerd).
- **Pastelkleuren en ronde vormen**: elke dag heeft in de JSON een `color`-naam (pink, blue, lilac, mint). Maak daar een zacht pastelpalet van (bijv. #FFE1EA, #DCEBFF, #EADCFF, #DFF5E9) met donkere inkt (#2B2B3F) voor tekst. Cards met border-radius 20px, zachte schaduwen, veel witruimte. Chips/knoppen volledig rond (pill).
- Systeemfont-stack of één Google Font (bijv. "Nunito" of "Quicksand" — rond en vriendelijk). Emoji's uit de JSON (`emoji` per dag) gebruiken in de navigatie.
- Geen localStorage nodig in de MVP.

## Structuur en features (MVP, vanavond af)
1. **Header**: titel + subtitel uit `meta`, klein en sticky-vriendelijk.
2. **Dag-navigatie**: sticky bovenin, 4 ronde tabs (Do 🥩 / Vr ⛪ / Za 🛍️ / Zo 👑) plus een 5e tab "Tickets". Tap = smooth-scroll of toon die dag. Elke dag is één **verticale scroll-pagina** met alle items onder elkaar (geen accordions).
3. **Programma-item card**: tijd groot links of als chip, titel, beschrijving, en onderaan een knoppenrij:
   - 📍 **Kaart** → `mapsUrl` (open in nieuw tabblad) — alleen tonen als aanwezig
   - 🛵 **Route** → `routeUrl` — alleen tonen als aanwezig
   - 🌐 **Site** → `web` — alleen tonen als aanwezig
   - 🎟️ **Ticket** → scrollt naar de bijbehorende ticket-card (via `ticketRef`)
   - `warn`-veld = geel waarschuwingsblokje in de card.
4. **Tickets-sectie**: één pagina met alle 8 entries uit `tickets`, gesorteerd op urgentie: `boek-vandaag` (rood/roze badge "BOEK NU") → `vooraf-aangeraden` → `op-de-dag` → `beslismoment` → `kan-ter-plekke`. Elke card: titel, wanneer, prijs, note, en één grote ronde knop "Boek tickets" naar `url`.
5. **Zoeken**: zoekveld in de header (of onder de dagnav). Client-side filter over titel + beschrijving + tags van alle items, live terwijl je typt. Resultaten als dezelfde cards, met daglabel erbij. Leeg veld = normale weergave. Zoeken op "nike", "zaterdag", "entrecote", "versailles" moet allemaal raak zijn.
6. **Menu-knop "Vertaal 🇫🇷"**: opent `https://translate.google.com/?sl=nl&tl=fr&op=translate` in een nieuw tabblad. Meer niet (API-onderzoek is sprint 2).
7. **Praktisch + Budget**: onderaan de Tickets-pagina of als eigen sectie, gerenderd uit `praktisch` en `budget`.
8. **Footer**: `meta.checked`.

## Kwaliteitseisen
- Alle externe links `target="_blank" rel="noopener"`.
- Tap-targets minimaal 44px. Lighthouse mobile: geen horizontale scroll, tekst minimaal 16px.
- Test lokaal met `python3 -m http.server` vanuit `site/` en controleer: 4 dagen renderen, zoeken werkt, alle knoppen klikbaar, tickets gesorteerd.

## Publiceren (na lokale test)
1. `git init`, `.gitignore` staat klaar, commit alles.
2. `gh repo create parijs0826 --public --source=. --push` (ik ben ingelogd met gh).
3. Zeg me daarna welke stappen IK moet doen in de Netlify-UI: site importeren vanaf GitHub, sitename `parijs0826` instellen (URL wordt parijs0826.netlify.app), publish directory `site/`. Doe geen Netlify-acties zelf zonder het te melden.
4. Elke latere push naar `main` deployt dan automatisch.

Lever op: werkende site, gecommit en gepusht, plus een korte checklist van wat je getest hebt.
