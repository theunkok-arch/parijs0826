# Kopenhagen 2026

Reisgids-site voor de campertrip Amsterdam naar Kopenhagen, 9 t/m 14 september 2026.
Mobile-first, puur statisch: geen build-stap, geen npm, geen dependencies.

Live: https://cph2026.netlify.app

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
  "id": "do-tivoli",
  "time": "Avond",
  "title": "Tivoli",
  "desc": "Korte uitleg in een of twee zinnen.",
  "address": "Vesterbrogade 3, 1630 København V",
  "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Tivoli+Copenhagen",
  "warn": "Aandachtspunt dat je echt moet weten. Laat weg als er niets is.",
  "check": "Iets dat nog uitgezocht moet worden. Laat weg als alles vaststaat.",
  "links": { "web": "", "insta": "", "tiktok": "" }
}
```

`id` moet uniek zijn, de rest van de velden mag je weglaten.
De volgorde in het bestand is de volgorde op de site, er wordt niet gesorteerd.
`warn` wordt een gele "Let op"-balk, `check` een grijze "Nog checken"-regel.

### Links vullen (website, Instagram, TikTok)
Zet de URL tussen de aanhalingstekens:

```json
"links": {
  "web": "https://reffen.dk/en/",
  "insta": "https://www.instagram.com/reffen_copenhagenstreetfood/",
  "tiktok": ""
}
```

Een gevuld slot wordt een knop. Een leeg slot blijft staan als gestippelde plek, zodat je
in een oogopslag ziet waar nog iets moet komen. Bij regels zonder `mapsUrl` (dingen als
"Vertrek Amsterdam") worden de lege slots weggelaten, anders wordt het ruis.

### Een restaurant met plan B toevoegen
Zet een `places`-lijst in het item. De eerste is de vaste keuze, de tweede het plan B.

```json
"places": [
  {
    "role": "Vaste keuze",
    "name": "WarPigs Brewpub",
    "desc": "Waarom hierheen, in een of twee zinnen.",
    "address": "Flæsketorvet 25, 1711 København V",
    "phone": "+45 43 48 48 48",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=WarPigs+Brewpub",
    "links": { "web": "https://www.warpigs.dk/", "insta": "", "tiktok": "" }
  },
  { "role": "Plan B", "name": "..." }
]
```

`phone` wordt automatisch een belknop, dus die mag met spaties.

### Routes aanpassen
Elke dag heeft een `routes`-lijst, want sommige dagen hebben er twee (auto en fiets).
`mapsUrl` is de knop "Route in Maps" en opent op de telefoon direct de Maps-app.

```json
"routes": [{
  "title": "Kustpad Hornbæk, Dronningmølle, Gilleleje",
  "mode": "E-bike",
  "summary": "Ongeveer 15 km langs zee.",
  "via": ["Hornbæk", "Dronningmølle", "Gilleleje"],
  "mapsUrl": "https://www.google.com/maps/dir/?api=1&origin=Hornb%C3%A6k&destination=Gilleleje&travelmode=bicycling",
  "embedUrl": null,
  "gpxUrl": null
}]
```

Zelf een route-link maken:
`https://www.google.com/maps/dir/?api=1&origin=VAN&destination=NAAR&travelmode=driving`
(of `bicycling`). Tussenpunten voeg je toe met `&waypoints=A|B|C`.
Zet `mode` op `Camper` of `E-bike`, dat is alleen het labeltje rechtsboven.
`via` zijn de bolletjes onder de omschrijving.

Wil je een echte kaart in de pagina: open de route in Google Maps, klik Delen, dan
Kaart insluiten, kopieer alleen de URL uit `src="..."` en zet die in `embedUrl`.
Een GPX-bestand leg je in `site/routes/` en zet je in `gpxUrl`.

### Een dag toevoegen of weghalen
Kopieer een heel dagblok in `days`. Verplicht: `id`, `date` (JJJJ-MM-DD), `label`,
`short` (staat op het tabje), `accent`, `sub`, `items`.
Voor `accent` kies je uit: `sky`, `mint`, `lilac`, `sand`, `pink`, `sea`.
Navigatie, homepagina en datum-weergave passen zich vanzelf aan.

### Praktisch aanpassen
Onder `praktisch` staan de blokken met de vaste afspraken. `rows` is de tabel eronder;
zet er `"href"` bij voor een klikbare mail (`mailto:...`) of telefoon (`tel:...`).

### Foto's toevoegen
De foto's staan in `site/img/`. In de data verwijs je met de bestandsnaam zonder
extensie, plus een Nederlandse alt-tekst voor wie de foto niet ziet.

```json
"img": { "file": "nyhavn", "alt": "De gekleurde gevels langs de gracht van Nyhavn", "webp": false }
```

Zo'n blok kan op drie plekken staan:
- `meta.hero` voor de grote foto op de startpagina
- `hero` in een dagblok, direct onder de dagtitel
- `img` in een activiteit of in een blok onder `praktisch`

Regels voor de bestanden:
- maximaal 1200px breed, dat is ruim genoeg voor een telefoon met retina-scherm
- `naam.jpg` is verplicht, `naam.webp` is optioneel maar wel een stuk lichter
- **zet `"webp": true` alleen als het .webp-bestand er echt is.** Staat het op
  `true` zonder bestand, dan blijft het beeld leeg: een `<picture>` valt niet
  terug op de jpg als de opgegeven bron een 404 geeft
- ontbreekt de foto helemaal, dan haalt de site het beeld netjes weg

### Fotocredit
De foto's komen van Unsplash en die licentie vraagt geen naamsvermelding. Eén foto is
de uitzondering: Torvehallerne staat onder CC BY 2.0 en die credit **moet** op de site
blijven staan. Dat is de kleine regel onderaan, uit `credits`:

```json
"credits": {
  "required": "Foto Torvehallerne: Jorge Franganillo, CC BY 2.0",
  "url": "https://commons.wikimedia.org/wiki/File:Copenhagen_Torvehallerne_(30267894558).jpg"
}
```

Laat je `required` leeg, dan verdwijnt de regel. Doe dat alleen als je ook de foto van
Torvehallerne van de site haalt, anders klopt de licentie niet meer.

### Afsluiting van een dag
`outro` onderaan een dagblok wordt een omkaderde regel onder de laatste activiteit.
Zondag gebruikt die voor het inleveren van de camper op maandag.

### De kop en de statusregel
Onder `meta` staan de titel, de ondertitel en de regel onderaan de site.

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
4. Deploy, daarna Site configuration, Change site name. De site heet `cph2026`.
5. Open cph2026.netlify.app op je telefoon en zet hem op je beginscherm.

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
- **Dagkleuren doen echt iets.** Het accent van een dag kleurt de titel, de tijdlabels en
  een zachte tint achter de pagina, zodat je aan de kleur ziet welke dag je bekijkt.
- **Adresbalk werkt mee.** Elke dag heeft een eigen `#hash`, dus je kunt een dag doorsturen
  en de terugknop van de telefoon doet wat je verwacht.
- **Geen zoekfunctie, geen tickets-module.** Dit programma is klein genoeg om te scrollen.
