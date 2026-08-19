# Plan: parijs0826.netlify.app

Reisgids-site voor het gezinsweekend Parijs (20-23 aug 2026), gebouwd door Claude Code, gehost op Netlify via GitHub. Deadline definitieve publish: **morgen 12:00**.

## Beslissingen (vastgelegd met Dominique)
- Hotel: Plaza Tour Eiffel, 32 rue Greuze (geboekt, ontbijt inbegrepen)
- Zondag: Eiffeltoren-top om 09:00 (eerste lift; 08:30 bestaat niet, security opent 08:45) -> Versailles met officiele guided tour 90 min (past in 150 euro budget: ca. 128 voor 4; privegids kost 250-400 en valt af). Jardin d'Acclimatation: niet naar binnen.
- Zaterdag: famous brand stores-dag (Pop Mart/Labubu, AMI, Sandro Stock, Polene, Jacquemus, Nike, adidas, Zara, LV, Kith Treats, Sephora) + Pantheon als cultuur-shot
- Tech: statisch HTML/CSS/JS + data.json, geen build-stap
- Repo: nieuw, `parijs0826`, aangemaakt door Claude Code via gh CLI
- Taal: alleen Nederlands; Vertaal = link naar translate.google.com (API-onderzoek sprint 2)
- Socials: sprint 2, als deeplinks (geen embeds tenzij onderzoek "go" zegt)
- Isis is 16, Roos is 14

## Tijdlijn
| Wanneer | Wat | Prompt |
|---|---|---|
| Vanavond | MVP bouwen, lokaal testen, repo + eerste Netlify-publish | prompts/01-mvp-prompt.md |
| Vanavond, na publish | Dominique: Netlify koppelen aan repo, sitename `parijs0826` zetten, live-check op telefoon | - |
| Morgen 08:30-10:00 | Sprint 1: geboekt-toggles, nu-indicator, zoekfilters, polish | prompts/02-sprint1-prompt.md |
| Morgen 10:00-11:30 | Sprint 2: socials-deeplinks, vertaal- en embed-onderzoek, deel-knop | prompts/03-sprint2-prompt.md |
| Morgen 11:30-12:00 | QA op echte telefoon, laatste push, klaar | in sprint 2-prompt |

## MVP-scope (vanavond)
Dag-tabs (verticale scroll per dag), programma-cards met Kaart/Route/Site/Ticket-knoppen, Tickets-sectie gesorteerd op urgentie met boek-knoppen, live zoeken op keyword/tag, Vertaal-knop, Praktisch + Budget, pastel en rond, mobile-first.

## Bewust NIET in scope
Accounts, backend, CMS, offline service worker, embeds zonder go-advies, meertaligheid.

## Risico's en vangnetten
- **Eiffel-top uitverkocht**: er komen elke paar dagen kleine batches vrij; dagelijks checken. Vangnet: trap+lift-ticket ter plekke of 2e verdieping. Staat zo in de Tickets-sectie.
- **Engelse Versailles-tour vol**: vangnet is tijdslot + gratis officiele app als audiotour. Vandaag boeken.
- **Netlify-naam bezet**: dan parijs-0826 of parijs0826-fam; URL is case-insensitief (Parijs0826 = parijs0826).
- **gh niet ingelogd**: `gh auth login` eerst draaien, staat in README.

## Handmatige stappen voor Dominique (eenmalig, ca. 5 min)
1. Zorg dat GitHub CLI is ingelogd: `gh auth status` (anders `gh auth login`).
2. Na de eerste push: app.netlify.com -> Add new site -> Import from GitHub -> kies `parijs0826` -> publish directory is al `site` via netlify.toml -> deploy.
3. Site settings -> Change site name -> `parijs0826`.
4. Open parijs0826.netlify.app op je telefoon en die van de meiden, zet op het homescherm.
