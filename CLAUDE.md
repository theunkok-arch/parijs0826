# Parijs0826 — context voor Claude Code

Reisgids-website voor een gezinsweekend Parijs, 20-23 aug 2026. Eigenaar: Dominique. Doelgroep: gezin met dochters Roos (14) en Isis (16), mobile-first is heilig.

## Regels
- **`site/data/data.json` is de enige bron van waarheid.** Alle programma-items, tijden, prijzen, adressen, kaart-links en ticket-links staan daar en zijn extern geverifieerd op 15 aug 2026. Verzin of "verbeter" geen feiten, tijden of prijzen. Contentwijzigingen alleen in de JSON, nooit hardcoded in HTML/JS.
- Puur statisch, geen build-stap, geen npm dependencies. `site/` is de publish-map (zie `netlify.toml`).
- Nederlands is de enige taal van de site. Toon: warm, direct, geen jargon. Geen em-dashes in teksten; gebruik komma's, punten of haakjes.
- Design: pastel, ronde vormen (radius 20px, pill-knoppen), veel witruimte, ontworpen op 390px breed.
- Externe links altijd `target="_blank" rel="noopener"`.
- Deploy: push naar `main` op GitHub-repo `parijs0826` = automatische Netlify-deploy naar parijs0826.netlify.app. Meld Netlify-UI-stappen aan Dominique in plaats van ze te omzeilen.

## Mappen
- `site/` — de website (index.html, css/, js/, data/)
- `prompts/` — 01-mvp, 02-sprint1, 03-sprint2 (in die volgorde uitvoeren, één per sessie)
- `docs/PLAN.md` — scope, sprints en deadline (morgen 12:00 publish)
- `assets/source/parijsprogramma_1.html` — het originele programma-document, alleen referentie

## Deadline
Definitieve publish: morgen 12:00. MVP vanavond, sprint 1 en 2 morgenochtend. Bij twijfel: klein houden en shippen.
