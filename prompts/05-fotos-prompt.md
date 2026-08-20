# Foto's koppelen — kant-en-klare beeldset

De map `site/img/` bevat 29 nieuwe webp-foto's (960x540, 16:9, elk onder de 130 KB, samen 2,2 MB), met licentieverantwoording in `docs/IMAGES.md`. Jouw taak: koppelen, niets zoeken of downloaden.

## 1. img-velden zetten in site/data/data.json
Voeg per item het veld `img` toe met exact deze koppeling (match op titel):

| Item | img |
|---|---|
| Inchecken Plaza Tour Eiffel | img/hotel-trocadero.webp |
| Le Relais de l'Entrecote (donderdag 21:00) | img/entrecote.webp |
| Eiffeltoren-fonkeling vanaf Trocadero | img/eiffel-nacht.webp |
| Ontbijt in het hotel (vrijdag, zaterdag en zondag, alle drie) | img/croissant.webp |
| Sainte-Chapelle | img/sainte-chapelle.webp |
| Notre-Dame de Paris | img/notre-dame.webp |
| Ile Saint-Louis + ijs bij Berthillon | img/ile-saint-louis.webp |
| Lunch: Breizh Cafe Odeon | img/galette.webp |
| Saint-Germain: galeriewandeling | img/rue-de-seine.webp |
| Les Deux Magots | img/deux-magots.webp |
| Musee Rodin (+ Matignon) | img/rodin.webp |
| Galeries Lafayette Haussmann: koepel + rooftop | img/lafayette-koepel.webp |
| Karamell snoepwinkel | img/karamell.webp |
| Diner bij Opera | img/chartier.webp |
| Pantheon | img/pantheon.webp |
| Pop Mart Les Halles | img/labubu.webp |
| Samaritaine | img/samaritaine.webp |
| Lunch: Marche des Enfants Rouges | img/enfants-rouges.webp |
| Marais: AMI, Sandro Stock & boutiques | img/marais.webp |
| De flagship-run: Champs-Elysees | img/champs-elysees.webp |
| Kith Treats | img/sneakers.webp |
| Sephora Champs-Elysees | img/sephora.webp |
| Diner bij de Champs-Elysees | img/bistro.webp |
| Macarons halen bij Laduree (za 19:45, uit sprint 2) | img/macarons.webp |
| Eiffeltoren: Entree 1 | img/eiffel-ochtend.webp |
| Met de lift naar de top | img/eiffel-uitzicht.webp |
| Lunch in Versailles-stad | img/versailles-stad.webp |
| Chateau de Versailles: guided tour | img/spiegelzaal.webp |
| Spiegelzaal + blik in de tuinen | img/versailles-tuin.webp |
| Naar huis | img/macarons.webp |

Transport-items (scooter/auto), boekings-reminders en uitchecken krijgen GEEN img: daar blijft de pastel-placeholder.

## 2. Rendering checken
`.card-media` bestaat al (16:9, cover, radius 14px): de foto's passen exact. Controleer `loading="lazy"` en width/height-attributen (960/540) op de img-tags tegen layout-shift.

## 3. Attributie
Voeg in de footer een regel toe: "Foto's via Wikimedia Commons (makers en licenties: zie IMAGES.md in de repo)." Link mag naar het GitHub-bestand docs/IMAGES.md.

## 4. Test en push
Lokale server, mobiel formaat: elke bovenstaande card toont zijn foto, geen kapotte paden (console leeg), netwerk-tab totaal onder de 2,5 MB bij volledige scroll. Commit met docs/IMAGES.md erbij en push.
