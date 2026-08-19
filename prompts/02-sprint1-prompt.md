# Sprint 1 — polish & usability (morgenochtend, ca. 08:30-10:00)

Lees CLAUDE.md. De MVP staat live op parijs0826.netlify.app. Werk in kleine commits, push per afgeronde stap zodat Netlify steeds deployt.

1. **Afvink-status tickets.** In de Tickets-sectie per card een ronde "Geboekt ✓"-toggle, bewaard in localStorage. Geboekte tickets krijgen een groene rand en zakken naar beneden binnen hun urgentiegroep. Bovenin de sectie een teller: "3 van 8 geregeld".
2. **Nu-indicator in het programma.** Op basis van datum/tijd van het device: als het 20-23 aug 2026 is, markeer het actuele en eerstvolgende item van vandaag ("NU" / "STRAKS" chip) en scroll daar bij openen naartoe. Buiten die dagen: gewoon bovenaan beginnen.
3. **Zoekfilters.** Onder het zoekveld ronde filterchips: Eten, Winkels, Attracties, Scooter/Auto, Gratis. Baseer ze op de bestaande tags (eten/lunch/diner/ontbijt = Eten, winkel/winkelen/merk = Winkels, attractie = Attracties, scooter/auto = Vervoer, gratis = Gratis). Chips combineerbaar met tekstzoeken.
4. **Micro-polish.** Subtiele fade-in bij scroll, actieve dag-tab duidelijker, focus-states voor toetsenbord, en een nette 404.html.
5. **Performance-check.** Lighthouse mobile op de live URL; los de quick wins op (font-display, width/height op eventuele afbeeldingen, meta description, theme-color in pastel).

Niet doen in deze sprint: socials, vertaal-API, nieuwe content.
