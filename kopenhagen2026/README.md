# Kopenhagen 2026

Reisgids-site voor de campertrip Amsterdam naar Kopenhagen, 9 t/m 14 september 2026.
Mobile-first, puur statisch: geen build-stap, geen npm, geen dependencies.

Live (na koppeling in Netlify): https://kopenhagen2026.netlify.app

## Mappen

```
kopenhagen2026/
  netlify.toml            eigen Netlify-config (publish = site)
  site/
    index.html            skelet, verder leeg: alles komt uit de JSON
    data/reis.json        HET databestand, hier pas je alles aan
    css/style.css         opmaak
    js/app.js             rendert de pagina's vanuit reis.json
    js/html.js            klein hulpje dat tekst veilig in HTML zet
    img/                  icons
    manifest.webmanifest  voor "zet op beginscherm"
```

## Het programma aanpassen

**Alles staat in `site/data/reis.json`. Je hoeft nooit in HTML, CSS of JS te zoeken.**
Sla op, ververs de pagina, klaar. Elke wijziging aan die ene file is meteen zichtbaar.

### Een tijd of tekst wijzigen
Zoek de activiteit op `title` en pas `time`, `title` of `desc` aan.
`time` mag een klok zijn ("10:30") of een dagdeel ("Ochtend", "Avond", "Voor 09:00").

### Een activiteit toevoegen
Plak dit blok in `items` van de juiste dag, op de plek waar het in de volgorde hoort:

```json
{
  "id": "wo-tivoli",
  "time": "Avond",
  "title": "Tivoli",
  "desc": "Korte uitleg in een of twee zinnen.",
  "address": "Vesterbrogade 3, Kopenhagen",
  "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Tivoli+Copenhagen",
  "check": "Wat we nog moeten uitzoeken. Laat weg als er niets te checken is.",
  "links": { "web": "", "insta": "", "tiktok": "" }
}
```

`id` moet uniek zijn, de rest van de velden mag je weglaten.
De volgorde in het bestand is de volgorde op de site, er wordt niet gesorteerd.

### Links vullen (Instagram, TikTok, website)
Zet de URL tussen de aanhalingstekens:

```json
"links": {
  "web": "https://reffen.dk/",
  "insta": "https://www.instagram.com/reffencph/",
  "tiktok": ""
}
```

Een gevuld slot wordt een knop. Een leeg slot blijft staan als gestippelde plek,
zodat je in een oogopslag ziet waar nog iets moet komen.

### Een routekaart invullen
Elke dag heeft een `route`-blok. Nu staat er een placeholder. Twee manieren om hem te vullen:

1. **Google Maps embed**: open de route in Google Maps, klik Delen, dan Kaart insluiten,
   kopieer alleen de URL uit `src="..."` en zet die in `embedUrl`.
2. **GPX**: leg het bestand in `site/img/` (of maak `site/routes/`) en zet het pad in
   `gpxUrl`, bijvoorbeeld `"routes/hornbaek-gilleleje.gpx"`.

```json
"route": {
  "title": "Kustpad Hornbæk naar Gilleleje",
  "summary": "Fietsen via Dronningmølle.",
  "embedUrl": "https://www.google.com/maps/embed?pb=...",
  "gpxUrl": null,
  "mapsUrl": "https://www.google.com/maps/dir/?api=1&origin=Hornbæk&destination=Gilleleje"
}
```

`mapsUrl` is de knop "Open in Maps" en werkt los van de kaart zelf.

### Een dag toevoegen of weghalen
Kopieer een heel dagblok in `days`. Verplicht: `id`, `date` (JJJJ-MM-DD), `label`,
`short` (staat op het tabje), `accent`, `sub`, `items`.
Voor `accent` kies je uit: `sky`, `mint`, `lilac`, `sand`, `pink`, `sea`.
Navigatie, homepagina en datum-weergave passen zich vanzelf aan.

### Praktisch aanpassen
Onder `praktisch` staan de blokken met de vaste afspraken. `rows` is de tabel eronder;
zet er `"href"` bij voor een klikbare mail (`mailto:...`) of telefoon (`tel:...`).

### De kop en de statusregel
Onder `meta` staan de titel, de ondertitel en de regel onderaan de site.
`status` staat er nu als "Werkversie". Zet die op iets anders zodra het programma vaststaat.

## Lokaal bekijken

De site laadt de JSON met `fetch`, dus dubbelklikken op `index.html` werkt niet.
Start een servertje in de map `site`:

```bash
cd kopenhagen2026/site
python3 -m http.server 8000
```

Dan open je http://localhost:8000 in de browser. Voor de mobiele check: rechtermuisknop,
Inspecteren, en zet de weergave op 390px breed.

## Deploy naar Netlify

De Parijs-site blijft hier volledig los van staan: andere map, eigen `netlify.toml`,
eigen Netlify-site, eigen site-ID. Aan de Parijs-configuratie verandert niets.

1. app.netlify.com, Add new site, Import an existing project.
2. Kies de repo waar deze map in staat.
3. Zet **Base directory** op `kopenhagen2026`. Publish directory vult zich vanzelf
   als `site` via `netlify.toml`. Build command laat je leeg.
4. Deploy, daarna Site configuration, Change site name, `kopenhagen2026`.
5. Open kopenhagen2026.netlify.app op je telefoon en zet hem op je beginscherm.

Wil je de Kopenhagen-site in een eigen repo? Dan kopieer je deze map naar een lege
map, `git init`, pushen naar een nieuwe repo, en in stap 3 hoef je geen base directory
meer te zetten.

## Wat hier anders is dan bij Parijs

- **Eén databestand, echt alles erin.** Ook de homepagina, de stats en Praktisch komen
  uit `reis.json`. Bij Parijs stond de kop nog deels in de HTML.
- **Kleuren via CSS-variabelen.** Een dag krijgt een `accent`, en de kaart-chips, balken
  en knoppen volgen automatisch. Bij Parijs was er per kleur een setje losse CSS-regels
  (`chip-pink`, `bg-pink`, `ph-pink`, `active-pink`), dus vier plekken per kleur.
- **Veilig HTML bouwen met `h`.** In `html.js` zit een tagged template die alles wat je
  invult automatisch escapet. Bij Parijs stond er honderd keer `esc(...)` in de rendercode,
  waarbij je er maar één hoeft te vergeten.
- **Linkslots zijn data, geen code.** De rij Website, Instagram, TikTok komt uit één lijstje
  bovenin `app.js`. Een vierde kanaal toevoegen is één regel plus een sleutel in de JSON.
- **Adresbalk werkt mee.** Elke dag heeft een eigen `#hash`, dus je kunt een dag doorsturen
  en de terugknop van de telefoon doet wat je verwacht.
- **Geen zoekfunctie, geen tickets-module.** Dit programma is klein genoeg om te scrollen.
