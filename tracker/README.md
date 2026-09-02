# Funda tracker

Houdt bij hoe vaak onze woning op funda is bekeken en bewaard, zodat "update mij"
een overzicht kan geven van de stand en de groei.

Woning: https://www.funda.nl/detail/17201073

## Hoe het werkt

1. Een GitHub Action draait elke ochtend (06:00 UTC) `node tracker/funda-tracker.mjs fetch`.
2. Die haalt de funda-pagina op en zoekt de cijfers voor bekeken en bewaard.
3. De meting wordt als regel toegevoegd aan `tracker/data/funda-stats.json` en gecommit.
4. Bij "update mij" draait `node tracker/funda-tracker.mjs report` en krijg je het overzicht.

De data staat buiten `site/`, dus de Parijs-website verandert er niet door. De commits
krijgen `[skip netlify]` mee zodat er geen deploys door getriggerd worden.

## Commando's

```bash
# cijfers ophalen en opslaan (doet de Action automatisch)
node tracker/funda-tracker.mjs fetch

# handmatig een meting invoeren, bijvoorbeeld overgetypt uit je funda-dashboard
node tracker/funda-tracker.mjs add --bekeken 1240 --bewaard 58
node tracker/funda-tracker.mjs add --bekeken 1240 --bewaard 58 --datum 2026-08-26

# het overzicht printen
node tracker/funda-tracker.mjs report

# parser testen
node tracker/test-parser.mjs
```

Eén meting per dag: draai je twee keer op dezelfde dag, dan overschrijft de nieuwste
de oude.

## Waar het stuk kan gaan

- **Funda blokkeert bots.** Als de pagina met een 403 terugkomt of er een captcha
  voor staat, mislukt de meting. De run wordt dan rood, het rapport zet er een
  waarschuwing bij ("de laatste automatische run is mislukt") en de ruwe pagina wordt
  als artifact bij de Action-run bewaard. Je krijgt dus nooit stiekem oude cijfers
  gepresenteerd als nieuw.
- **Funda verandert de HTML.** De parser kent meerdere patronen (zichtbare tekst en
  embedded JSON), maar als funda de opzet omgooit vindt hij niets. Ook dan: run rood,
  ruwe HTML bewaard, patronen bijwerken in `funda-tracker.mjs`.
- **Vangnet.** Werkt het scrapen niet, gebruik dan `add` en tik de cijfers een keer
  per week over uit je eigen funda-omgeving. De rest van het overzicht (verschillen,
  gemiddelde per dag, bewaarratio) werkt daar precies hetzelfde mee.

De Action draait één keer per dag, dat is bewust: netjes voor funda en genoeg om de
trend te zien.

## Belangrijk

De geplande run start pas als deze branch op `main` staat. GitHub draait
`schedule`-workflows alleen vanaf de default branch. Je kunt hem daarna ook
handmatig starten via Actions, knop "Run workflow".

Op een pull request draait alleen een proefmeting: die kijkt of funda bereikbaar
is en of de parser de cijfers eruit haalt, maar schrijft niets weg en maakt de
run nooit rood. Het resultaat staat in de samenvatting van de Action-run.
