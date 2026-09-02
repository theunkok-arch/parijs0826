/**
 * Mini-test voor de parser. Draaien met: node tracker/test-parser.mjs
 * Geen testframework nodig.
 */
import { parseStats } from './funda-tracker.mjs';

const gevallen = [
  ['zichtbare tekst', '<div><span>1.412</span> keer bekeken</div><div><span>65</span> keer bewaard</div>', 1412, 65],
  ['opgeslagen-variant', '<p>2.004 keer bekeken</p><p>112 keer opgeslagen</p>', 2004, 112],
  ['embedded json', '<script>{"objectId":1,"viewCount":3021,"saveCount":97}</script>', 3021, 97],
  ['nederlandse json-keys', '<script>{"aantalKeerBekeken":540,"aantalKeerBewaard":21}</script>', 540, 21],
  ['blokkadepagina', '<html><body>Toegang geweigerd</body></html>', null, null],
];

let gezakt = 0;
for (const [naam, html, bekeken, bewaard] of gevallen) {
  const r = parseStats(html);
  const ok = r.bekeken === bekeken && r.bewaard === bewaard;
  if (!ok) gezakt++;
  console.log(`${ok ? 'OK  ' : 'FOUT'} ${naam.padEnd(22)} bekeken=${r.bekeken} bewaard=${r.bewaard}`);
}
console.log(gezakt === 0 ? '\nAlle tests geslaagd.' : `\n${gezakt} test(s) gezakt.`);
process.exitCode = gezakt === 0 ? 0 : 1;
