# parijs0826

Mobile-first reisgids voor ons gezinsweekend Parijs, 20-23 augustus 2026. Live doel: **https://parijs0826.netlify.app**

## Snel starten met Claude Code
1. Open een terminal in deze map en check `gh auth status` (zo nodig `gh auth login`).
2. Start `claude` en plak de volledige inhoud van `prompts/01-mvp-prompt.md`.
3. Na de MVP: koppel Netlify eenmalig (zie `docs/PLAN.md`, onderaan).
4. Morgenochtend: `prompts/02-sprint1-prompt.md`, daarna `prompts/03-sprint2-prompt.md`.

## Structuur
- `site/` - de website; `site/data/data.json` is de enige bron van waarheid voor alle content
- `prompts/` - de drie bouwprompts, in volgorde
- `docs/PLAN.md` - scope, tijdlijn, risico's
- `CLAUDE.md` - vaste regels voor Claude Code
- `assets/source/` - het originele programma (referentie)

## Lokaal bekijken
```
cd site && python3 -m http.server 8000
```
Open http://localhost:8000
