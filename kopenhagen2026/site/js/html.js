/* Mini HTML-helper: veilig strings bouwen zonder overal esc() te herhalen.
   Alles wat je in een ${} zet wordt automatisch ge-escaped. Wil je bewust
   HTML invoegen, dan geef je het resultaat van h`...` of raw() door. */

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const RAW = Symbol('raw');

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

export function raw(value) {
  return { [RAW]: String(value) };
}

function toHtml(value) {
  if (value === null || value === undefined || value === false || value === true) return '';
  if (Array.isArray(value)) return value.map(toHtml).join('');
  if (typeof value === 'object' && RAW in value) return value[RAW];
  return esc(value);
}

export function h(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += toHtml(values[i]) + strings[i + 1];
  return raw(out);
}

export function mount(el, node) {
  el.innerHTML = toHtml(node);
}
