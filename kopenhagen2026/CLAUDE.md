# Kopenhagen2026 - context voor Claude Code

Reisgids-website voor de campertrip Amsterdam naar Kopenhagen, 9 t/m 14 september 2026.
Eigenaar: Dominique. Mobile-first is heilig, ontworpen op 390px breed.

## Regels
- **`site/data/reis.json` is de enige bron van waarheid.** Alle dagen, activiteiten, tijden,
  routes, links en praktische info staan daar. Nooit content hardcoden in HTML of JS.
- Verzin geen tijden, prijzen, adressen of accounts. Adressen, telefoonnummers, websites en
  social-accounts zijn online opgezocht. Weet je iets niet zeker, zet het in het veld `check`
  in plaats van het in te vullen. Geen placeholders in de content.
- Puur statisch: geen build-stap, geen npm dependencies. `site/` is de publish-map.
- Nederlands is de enige taal. Toon: warm, direct, geen jargon. Geen em-dashes, gebruik
  komma's, punten of haakjes.
- Design: pastel, ronde vormen (radius 20px, pill-knoppen), veel witruimte.
- Externe links altijd `target="_blank" rel="noopener"`.
- Foto's: max 1200px breed, Nederlandse alt-tekst verplicht, `"webp": true` alleen als dat
  bestand er echt is (een `<picture>` valt niet terug op de jpg bij een 404).
- **Staat er een foto op de site, dan moet die in `credits.photos` staan met fotograaf en
  licentie.** Dat is een licentievoorwaarde, geen nette-bedoening.

## Strikt gescheiden van het Parijs-project
Deze map is een op zichzelf staand project met een eigen `netlify.toml` en een eigen
Netlify-site (`cph2026`, op cph2026.netlify.app). Raak niets aan buiten `kopenhagen2026/`: de root
`netlify.toml`, `site/`, `docs/` en `prompts/` horen bij de Parijs-site.

## Structuur
- `site/data/reis.json` - meta, overview, days (hero, routes, items, places, outro), praktisch, credits
- `site/img/` - foto's als `naam.jpg`, optioneel `naam.webp` ernaast
- `site/js/app.js` - rendert alle views, hash-routing, deel-knop
- `site/js/html.js` - `h` tagged template die automatisch escapet, plus `raw` en `mount`
- `site/css/style.css` - accenten via `[data-accent]` custom properties
- `README.md` - uitleg voor Dominique over het aanpassen van reis.json
