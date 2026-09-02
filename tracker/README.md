# Funda tracker

Houdt bij hoe vaak onze woning op funda is bekeken en bewaard, zodat "update mij"
een overzicht kan geven van de stand en de groei.

Woning: Palestrinalaan 19, Bilthoven
https://www.funda.nl/detail/17201073

## Belangrijk om te weten

**Funda toont deze cijfers alleen aan ingelogde gebruikers.** Op de publieke pagina
staat letterlijk "Populariteit, log in om te bekijken" met 0x Bekeken en 0x Bewaard
als lege plaatshouders. Automatisch scrapen zonder login levert dus niets op. Dat is
in de proefmeting op deze branch vastgesteld, niet aangenomen.

Daarom werkt de tracker standaard **handmatig**: jij leest de cijfers af in je eigen
funda-omgeving, voert ze in met één commando, en de tracker rekent de rest uit
(verschil sinds vorige meting, verschil sinds vorige week, gemiddelde views per dag,
bewaarratio).

Wil je het toch automatisch, dan kan dat met een funda-sessiecookie in een
repository-secret. Zie "Automatisch meten" hieronder, inclusief de haken.

## Dagelijks gebruik

```bash
# cijfers invoeren (de gewone manier)
node tracker/funda-tracker.mjs add --bekeken 1240 --bewaard 58

# met een datum in het verleden
node tracker/funda-tracker.mjs add --bekeken 1240 --bewaard 58 --datum 2026-08-26

# het overzicht printen, dit draait bij "update mij"
node tracker/funda-tracker.mjs report
```

Eén meting per dag: draai je twee keer op dezelfde dag, dan overschrijft de nieuwste
de oude. De data staat in `tracker/data/funda-stats.json`, buiten `site/`, dus de
Parijs-website verandert er niet door.

## Automatisch meten

De GitHub Action draait elke ochtend om 06:00 UTC, maar haalt alleen op als er een
repository-secret `FUNDA_COOKIE` bestaat met een geldige funda-sessiecookie. Is die
er niet, dan slaat de run het ophalen over en blijft hij groen, met een uitleg in de
run-samenvatting. Zo krijg je geen dagelijkse valse alarmen.

Instellen zou zo gaan: inloggen op funda in je browser, de sessiecookie kopiëren uit
de developer tools, en die in GitHub zetten onder Settings, Secrets and variables,
Actions, New repository secret, met de naam `FUNDA_COOKIE`.

De haken daarbij, eerlijk:

- Een sessiecookie is net zo gevoelig als een wachtwoord. Wie hem heeft, komt in jouw
  funda-account. Hij komt in GitHub-secrets terecht, niet in de code, maar het blijft
  een sleutel die je weggeeft.
- Sessies verlopen. Reken op opnieuw instellen om de paar weken, en op stille
  mislukkingen daartussen.
- Geautomatiseerd inloggen en uitlezen gaat waarschijnlijk in tegen de
  gebruiksvoorwaarden van funda.

Handmatig invoeren kost je tien seconden per week en heeft geen van die nadelen.
Mijn advies is dus: doe het handmatig.

## Overige commando's

```bash
# laat zien wat funda daadwerkelijk terugstuurt (status, titel, tekst rond de cijfers)
node tracker/funda-tracker.mjs diagnose

# parser testen
node tracker/test-parser.mjs
```

Op een pull request draait een proefmeting die funda benadert en de diagnose in de
log zet, zonder iets weg te schrijven. Die run wordt nooit rood van een blokkade,
want dat is geen fout in deze code.

## Vangnetten in de code

- Een nul wordt nooit als meting opgeslagen. Een woning die live staat is altijd
  minstens een keer bekeken, dus nul betekent dat de parser de verkeerde plek pakt.
- De login-muur wordt herkend en apart gemeld, zodat je niet gaat zoeken naar een
  bug die er niet is.
- Mislukt een automatische run, dan zet het rapport er een waarschuwing bij. Je
  krijgt nooit stiekem oude cijfers gepresenteerd als nieuw.
