// Idiomas do Google Tradutor e agrupamento do seletor. Compartilhado entre popup, content e service worker.

const PQ_LANGS = [
  { code: 'af', label: 'Africâner' },
  { code: 'sq', label: 'Albanês' },
  { code: 'am', label: 'Amárico' },
  { code: 'ar', label: 'Árabe' },
  { code: 'hy', label: 'Armênio' },
  { code: 'as', label: 'Assamês' },
  { code: 'ay', label: 'Aimará' },
  { code: 'az', label: 'Azeri' },
  { code: 'bm', label: 'Bambara' },
  { code: 'eu', label: 'Basco' },
  { code: 'be', label: 'Bielorrusso' },
  { code: 'bn', label: 'Bengali' },
  { code: 'bho', label: 'Bhojpuri' },
  { code: 'bs', label: 'Bósnio' },
  { code: 'bg', label: 'Búlgaro' },
  { code: 'ca', label: 'Catalão' },
  { code: 'ceb', label: 'Cebuano' },
  { code: 'ny', label: 'Chichewa' },
  { code: 'zh-CN', label: 'Chinês (simplificado)' },
  { code: 'zh-TW', label: 'Chinês (tradicional)' },
  { code: 'co', label: 'Corso' },
  { code: 'hr', label: 'Croata' },
  { code: 'cs', label: 'Tcheco' },
  { code: 'da', label: 'Dinamarquês' },
  { code: 'dv', label: 'Divehi' },
  { code: 'doi', label: 'Dogri' },
  { code: 'nl', label: 'Neerlandês' },
  { code: 'en', label: 'Inglês' },
  { code: 'eo', label: 'Esperanto' },
  { code: 'et', label: 'Estoniano' },
  { code: 'ee', label: 'Ewe' },
  { code: 'fil', label: 'Filipino' },
  { code: 'fi', label: 'Finlandês' },
  { code: 'fr', label: 'Francês' },
  { code: 'fy', label: 'Frísio' },
  { code: 'gl', label: 'Galego' },
  { code: 'ka', label: 'Georgiano' },
  { code: 'de', label: 'Alemão' },
  { code: 'el', label: 'Grego' },
  { code: 'gn', label: 'Guarani' },
  { code: 'gu', label: 'Guzerate' },
  { code: 'ht', label: 'Haitiano' },
  { code: 'ha', label: 'Hauçá' },
  { code: 'haw', label: 'Havaiano' },
  { code: 'he', label: 'Hebraico' },
  { code: 'hi', label: 'Hindi' },
  { code: 'hmn', label: 'Hmong' },
  { code: 'hu', label: 'Húngaro' },
  { code: 'is', label: 'Islandês' },
  { code: 'ig', label: 'Igbo' },
  { code: 'ilo', label: 'Ilocano' },
  { code: 'id', label: 'Indonésio' },
  { code: 'ga', label: 'Irlandês' },
  { code: 'it', label: 'Italiano' },
  { code: 'ja', label: 'Japonês' },
  { code: 'jv', label: 'Javanês' },
  { code: 'kn', label: 'Canarês' },
  { code: 'kk', label: 'Cazaque' },
  { code: 'km', label: 'Khmer' },
  { code: 'rw', label: 'Quiniaruanda' },
  { code: 'gom', label: 'Concani' },
  { code: 'ko', label: 'Coreano' },
  { code: 'kri', label: 'Krio' },
  { code: 'ku', label: 'Curdo (Kurmanji)' },
  { code: 'ckb', label: 'Curdo (Sorani)' },
  { code: 'ky', label: 'Quirguiz' },
  { code: 'lo', label: 'Laosiano' },
  { code: 'la', label: 'Latim' },
  { code: 'lv', label: 'Letão' },
  { code: 'ln', label: 'Lingala' },
  { code: 'lt', label: 'Lituano' },
  { code: 'lg', label: 'Luganda' },
  { code: 'lb', label: 'Luxemburguês' },
  { code: 'mk', label: 'Macedônio' },
  { code: 'mai', label: 'Maithili' },
  { code: 'mg', label: 'Malgaxe' },
  { code: 'ms', label: 'Malaio' },
  { code: 'ml', label: 'Malaiala' },
  { code: 'mt', label: 'Maltês' },
  { code: 'mi', label: 'Maori' },
  { code: 'mr', label: 'Marati' },
  { code: 'mni-Mtei', label: 'Meitei (Manipuri)' },
  { code: 'lus', label: 'Mizo' },
  { code: 'mn', label: 'Mongol' },
  { code: 'my', label: 'Birmanês' },
  { code: 'ne', label: 'Nepalês' },
  { code: 'no', label: 'Norueguês' },
  { code: 'or', label: 'Oriá' },
  { code: 'om', label: 'Oromo' },
  { code: 'ps', label: 'Pachto' },
  { code: 'fa', label: 'Persa' },
  { code: 'pl', label: 'Polonês' },
  { code: 'pt', label: 'Português' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'qu', label: 'Quíchua' },
  { code: 'ro', label: 'Romeno' },
  { code: 'ru', label: 'Russo' },
  { code: 'sm', label: 'Samoano' },
  { code: 'sa', label: 'Sânscrito' },
  { code: 'gd', label: 'Gaélico escocês' },
  { code: 'nso', label: 'Sepedi' },
  { code: 'sr', label: 'Sérvio' },
  { code: 'st', label: 'Soto do sul' },
  { code: 'sn', label: 'Shona' },
  { code: 'sd', label: 'Sindi' },
  { code: 'si', label: 'Cingalês' },
  { code: 'sk', label: 'Eslovaco' },
  { code: 'sl', label: 'Esloveno' },
  { code: 'so', label: 'Somali' },
  { code: 'es', label: 'Espanhol' },
  { code: 'su', label: 'Sundanês' },
  { code: 'sw', label: 'Suaíli' },
  { code: 'sv', label: 'Sueco' },
  { code: 'tg', label: 'Tadjique' },
  { code: 'ta', label: 'Tâmil' },
  { code: 'tt', label: 'Tártaro' },
  { code: 'te', label: 'Telugo' },
  { code: 'th', label: 'Tailandês' },
  { code: 'ti', label: 'Tigrínia' },
  { code: 'ts', label: 'Tsonga' },
  { code: 'tr', label: 'Turco' },
  { code: 'tk', label: 'Turcomeno' },
  { code: 'ak', label: 'Twi' },
  { code: 'uk', label: 'Ucraniano' },
  { code: 'ur', label: 'Urdu' },
  { code: 'ug', label: 'Uigur' },
  { code: 'uz', label: 'Uzbeque' },
  { code: 'vi', label: 'Vietnamita' },
  { code: 'cy', label: 'Galês' },
  { code: 'xh', label: 'Xhosa' },
  { code: 'yi', label: 'Iídiche' },
  { code: 'yo', label: 'Iorubá' },
  { code: 'zu', label: 'Zulu' }
];

const PQ_FREQUENT = ['pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'zh-CN', 'ko', 'ru', 'ar', 'hi'];

function pqGuessTarget() {
  const raw = (typeof navigator !== 'undefined' && navigator.language) || 'pt';
  const c = raw.toLowerCase();
  const exact = PQ_LANGS.find((l) => l.code.toLowerCase() === c);
  if (exact) return exact.code;
  const short = c.slice(0, 2);
  const hit = PQ_LANGS.find((l) => l.code.slice(0, 2) === short);
  return hit ? hit.code : 'pt';
}

function pqLangName(code) {
  if (!code) return '';
  if (typeof PQ_CODEC_MAP !== 'undefined' && PQ_CODEC_MAP[code]) return PQ_CODEC_MAP[code].label;
  const hit = PQ_LANGS.find((l) => l.code === code);
  if (hit) return hit.label;
  try {
    const n = new Intl.DisplayNames(['pt-BR'], { type: 'language' }).of(code);
    return n ? n.charAt(0).toUpperCase() + n.slice(1) : code;
  } catch (_) {
    return code;
  }
}

function pqFillTargetSelect(select, current) {
  select.textContent = '';
  const gFreq = document.createElement('optgroup');
  gFreq.label = 'Mais usados';
  PQ_FREQUENT.forEach((code) => {
    const l = PQ_LANGS.find((x) => x.code === code);
    if (!l) return;
    const o = document.createElement('option');
    o.value = l.code;
    o.textContent = l.label;
    gFreq.appendChild(o);
  });
  const gAll = document.createElement('optgroup');
  gAll.label = 'Todos os idiomas';
  PQ_LANGS.slice().sort((a, b) => a.label.localeCompare(b.label, 'pt')).forEach((l) => {
    const o = document.createElement('option');
    o.value = l.code;
    o.textContent = l.label;
    gAll.appendChild(o);
  });
  const gCodes = document.createElement('optgroup');
  gCodes.label = 'Códigos e cifras';
  (typeof PQ_CODECS !== 'undefined' ? PQ_CODECS : []).forEach((c) => {
    const o = document.createElement('option');
    o.value = c.id;
    o.textContent = c.label;
    gCodes.appendChild(o);
  });
  select.appendChild(gFreq);
  select.appendChild(gAll);
  select.appendChild(gCodes);
  if (current) select.value = current;
}

function pqGoogleSearchUrl(text) {
  return 'https://www.google.com/search?q=' + encodeURIComponent(String(text || '').slice(0, 1800));
}

function pqLensByUrl(imageUrl, hl) {
  return 'https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(imageUrl) + '&hl=' + encodeURIComponent(hl || 'pt-BR');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PQ_LANGS, PQ_FREQUENT, pqGuessTarget, pqLangName, pqFillTargetSelect, pqGoogleSearchUrl, pqLensByUrl };
}
