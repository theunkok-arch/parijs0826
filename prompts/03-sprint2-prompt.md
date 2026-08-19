# Sprint 2 — fun & vertaal (morgen, ca. 10:00-11:30, publish 12:00)

Lees CLAUDE.md. Sprint 1 is live. Dit is de laatste sprint voor de deadline van 12:00: om 11:30 stoppen met features, laatste half uur is QA + publish.

1. **TikTok & Instagram per locatie.** Voeg in `data.json` per relevant programma-item een `social`-object toe met kant-en-klare tag-URLs, patroon:
   - TikTok: `https://www.tiktok.com/tag/<tag>` (bijv. saintechapelle, popmart, kithparis, chateaudeversailles, relaisdelentrecote, controleer spelling per item)
   - Instagram: `https://www.instagram.com/explore/tags/<tag>/`
   Render ze als twee kleine ronde knoppen op de item-card. Deze deeplinks openen de app op mobiel. GEEN embeds op de pagina.
2. **Embeds-onderzoek (timebox 20 min).** Onderzoek of TikTok/Instagram embeds haalbaar zijn zonder de site traag of cookie-plichtig te maken. Schrijf de conclusie in `docs/SOCIALS.md` met een go/no-go-advies. Alleen bouwen als het én licht én zonder consent-banner kan; anders no-go documenteren.
3. **Vertaal-onderzoek (timebox 20 min).** Huidige oplossing is een link naar translate.google.com. Onderzoek: Google Cloud Translation API (kost geld + API-key op een statische site = key ligt op straat, waarschijnlijk no-go), gratis alternatieven (browser-native vertalen, LibreTranslate publieke instances zijn onbetrouwbaar). Schrijf advies in `docs/VERTAAL.md`. Bouw alleen een "Handige zinnen"-kaartje (10 vaste NL-FR zinnen voor restaurant/winkel/nood, hardcoded in data.json) — dat werkt namelijk ook offline en zonder API.
4. **Deel-knop.** Web Share API-knop in de header ("Deel deze gids") met fallback kopieer-link.
5. **QA-rondje om 11:30.** Op een echte telefoon: alle 4 dagen, zoeken, alle ticket-knoppen, alle kaart/route-knoppen (steekproef 6 stuks), socials-knoppen. Fix alleen blockers, push, klaar voor 12:00.
