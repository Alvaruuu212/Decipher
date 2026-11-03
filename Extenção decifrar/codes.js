// Codificações e cifras locais (sem rede). Usado pelo content script e pelo service worker.
// Cada codec expõe encode, decode (quando possível) e detect (conservador, para auto-decodificar).

const PQ_MORSE = {
  a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....',
  i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.',
  q: '--.-', r: '.-.', s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-',
  y: '-.--', z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', _: '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
};
const PQ_MORSE_REV = {};
Object.keys(PQ_MORSE).forEach((k) => { PQ_MORSE_REV[PQ_MORSE[k]] = k; });

const PQ_NATO = {
  a: 'Alfa', b: 'Bravo', c: 'Charlie', d: 'Delta', e: 'Echo', f: 'Foxtrot',
  g: 'Golf', h: 'Hotel', i: 'India', j: 'Juliett', k: 'Kilo', l: 'Lima',
  m: 'Mike', n: 'November', o: 'Oscar', p: 'Papa', q: 'Quebec', r: 'Romeo',
  s: 'Sierra', t: 'Tango', u: 'Uniform', v: 'Victor', w: 'Whiskey', x: 'X-ray',
  y: 'Yankee', z: 'Zulu',
  '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
  '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine'
};
const PQ_NATO_REV = {};
Object.keys(PQ_NATO).forEach((k) => { PQ_NATO_REV[PQ_NATO[k].toLowerCase()] = k; });
PQ_NATO_REV.alpha = 'a';
PQ_NATO_REV.juliet = 'j';
PQ_NATO_REV['xray'] = 'x';

const PQ_BRAILLE_L = {
  a: '⠁', b: '⠃', c: '⠉', d: '⠙', e: '⠑', f: '⠋', g: '⠛', h: '⠓', i: '⠊', j: '⠚',
  k: '⠅', l: '⠇', m: '⠍', n: '⠝', o: '⠕', p: '⠏', q: '⠟', r: '⠗', s: '⠎', t: '⠞',
  u: '⠥', v: '⠧', w: '⠺', x: '⠭', y: '⠽', z: '⠵'
};
const PQ_BRAILLE_L_REV = {};
Object.keys(PQ_BRAILLE_L).forEach((k) => { PQ_BRAILLE_L_REV[PQ_BRAILLE_L[k]] = k; });
const PQ_BRAILLE_CAP = '⠠';
const PQ_BRAILLE_NUM = '⠼';
const PQ_BRAILLE_PUNCT = {
  ' ': '⠀', '.': '⠲', ',': '⠂', '?': '⠦', '!': '⠖', "'": '⠄', '-': '⠤',
  ':': '⠒', ';': '⠆', '(': '⠶', ')': '⠶'
};
const PQ_BRAILLE_PUNCT_REV = {};
Object.keys(PQ_BRAILLE_PUNCT).forEach((k) => { PQ_BRAILLE_PUNCT_REV[PQ_BRAILLE_PUNCT[k]] = k; });

const PQ_FLIP = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ',
  j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ',
  s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
  A: '∀', B: 'ꓭ', C: 'Ɔ', D: 'ꓷ', E: 'Ǝ', F: 'Ⅎ', G: '⅁', H: 'H', I: 'I',
  J: 'ſ', K: 'ꓘ', L: '⅂', M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Ό', R: 'ꓤ',
  S: 'S', T: '┴', U: '∩', V: 'Λ', W: 'M', X: 'X', Y: '⅄', Z: 'Z',
  '0': '0', '1': '⇂', '2': 'ᘔ', '3': 'Ɛ', '4': 'ᔭ', '5': 'ϛ', '6': '9',
  '7': 'ㄥ', '8': '8', '9': '6', '.': '˙', ',': "'", '?': '¿', '!': '¡',
  "'": ',', '"': '„', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}',
  '}': '{', '<': '>', '>': '<'
};
const PQ_FLIP_REV = {};
Object.keys(PQ_FLIP).forEach((k) => { if (!PQ_FLIP_REV[PQ_FLIP[k]]) PQ_FLIP_REV[PQ_FLIP[k]] = k; });

const PQ_LEET = { a: '4', e: '3', i: '1', o: '0', s: '5', t: '7', b: '8', g: '9', l: '1' };
const PQ_LEET_REV = { '4': 'a', '3': 'e', '0': 'o', '5': 's', '7': 't', '8': 'b', '9': 'g' };

const PQ_B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function pqFold(text) {
  return String(text).normalize('NFD').replace(/\p{M}/gu, '');
}

function pqIsPrintable(text) {
  if (!text) return false;
  let ok = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0);
    if (c === 9 || c === 10 || c === 13 || (c >= 32 && c !== 127)) ok++;
  }
  return ok / text.length >= 0.85 && /[\p{L}\p{N}]/u.test(text);
}

function pqUtf8Bytes(text) {
  return Array.from(new TextEncoder().encode(text));
}

function pqFromUtf8(bytes) {
  return new TextDecoder('utf-8', { fatal: false }).decode(Uint8Array.from(bytes));
}

function pqEncodeMorse(text) {
  return pqFold(text).split(/\n/).map((line) =>
    line.split(/\s+/).filter(Boolean).map((word) =>
      Array.from(word).map((ch) => PQ_MORSE[ch.toLowerCase()] || ch).join(' ')
    ).join(' / ')
  ).join('\n');
}

function pqDecodeMorse(text) {
  const norm = String(text).trim().replace(/[–—]/g, '-').replace(/[•·]/g, '.');
  return norm.split(/\n/).map((line) =>
    line.split(/\s*\/\s*/).map((word) =>
      word.trim().split(/\s+/).filter(Boolean).map((tok) => {
        const hit = PQ_MORSE_REV[tok];
        return hit === undefined ? tok : hit;
      }).join('')
    ).join(' ')
  ).join('\n').toUpperCase();
}

function pqDetectMorse(text) {
  const s = String(text).trim();
  if (s.length < 5) return null;
  if (!/^[.\-–—•·/\s]+$/.test(s)) return null;
  if (!/[.]/.test(s) || !/[-–—]/.test(s)) return null;
  const tokens = s.replace(/[–—]/g, '-').replace(/[•·]/g, '.').split(/[\s/]+/).filter(Boolean);
  if (tokens.length < 3) return null;
  if (!tokens.every((t) => PQ_MORSE_REV[t])) return null;
  const out = pqDecodeMorse(s);
  if (!/^[A-Z0-9][A-Z0-9 .,'!?@&()/_+-]*$/.test(out) || out.replace(/\s+/g, '').length < 3) return null;
  return out;
}

function pqEncodeNato(text) {
  return pqFold(text).split(/\s+/).filter(Boolean).map((word) =>
    Array.from(word).map((ch) => PQ_NATO[ch.toLowerCase()] || ch).join(' ')
  ).join(' / ');
}

function pqDecodeNato(text) {
  return String(text).trim().split(/\s*\/\s*/).map((word) =>
    word.trim().split(/\s+/).filter(Boolean).map((tok) => {
      const hit = PQ_NATO_REV[tok.toLowerCase()];
      return hit === undefined ? tok : hit.toUpperCase();
    }).join('')
  ).join(' ');
}

function pqDetectNato(text) {
  const s = String(text).trim();
  const words = s.split(/[\s/]+/).filter(Boolean);
  if (words.length < 3) return null;
  if (!words.every((w) => PQ_NATO_REV[w.toLowerCase()])) return null;
  return pqDecodeNato(s);
}

function pqEncodeBraille(text) {
  let out = '';
  let num = false;
  for (const ch of String(text)) {
    if (/[0-9]/.test(ch)) {
      if (!num) { out += PQ_BRAILLE_NUM; num = true; }
      const d = ch === '0' ? 'j' : 'abcdefghij'[Number(ch) - 1];
      out += PQ_BRAILLE_L[d];
      continue;
    }
    num = false;
    if (/[A-Z]/.test(ch)) {
      out += PQ_BRAILLE_CAP + (PQ_BRAILLE_L[ch.toLowerCase()] || ch);
    } else if (PQ_BRAILLE_L[ch]) {
      out += PQ_BRAILLE_L[ch];
    } else if (PQ_BRAILLE_PUNCT[ch]) {
      out += PQ_BRAILLE_PUNCT[ch];
    } else {
      out += ch;
    }
  }
  return out;
}

function pqDecodeBraille(text) {
  let out = '';
  let cap = false;
  let num = false;
  for (const ch of String(text)) {
    if (ch === PQ_BRAILLE_CAP) { cap = true; num = false; continue; }
    if (ch === PQ_BRAILLE_NUM) { num = true; cap = false; continue; }
    if (PQ_BRAILLE_L_REV[ch]) {
      const letter = PQ_BRAILLE_L_REV[ch];
      if (num) {
        out += letter === 'j' ? '0' : String('abcdefghij'.indexOf(letter) + 1);
      } else {
        out += cap ? letter.toUpperCase() : letter;
      }
      cap = false;
      continue;
    }
    num = false;
    cap = false;
    out += PQ_BRAILLE_PUNCT_REV[ch] !== undefined ? PQ_BRAILLE_PUNCT_REV[ch] : ch;
  }
  return out;
}

function pqDetectBraille(text) {
  const s = String(text).trim();
  const chars = Array.from(s);
  if (chars.length < 3) return null;
  const br = chars.filter((c) => /[\u2800-\u28FF]/.test(c)).length;
  if (br / chars.length < 0.8) return null;
  const out = pqDecodeBraille(s);
  return pqIsPrintable(out) ? out : null;
}

function pqPadBits(n, w) {
  return n.toString(2).padStart(w, '0');
}

function pqEncodeBinary(text) {
  return pqUtf8Bytes(text).map((b) => pqPadBits(b, 8)).join(' ');
}

function pqDecodeBinary(text) {
  const bits = String(text).trim().replace(/\s+/g, '');
  if (bits.length % 8) throw new Error('Binário incompleto.');
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return pqFromUtf8(bytes);
}

function pqDetectBinary(text) {
  const s = String(text).trim();
  if (!/^[01\s]+$/.test(s)) return null;
  const bits = s.replace(/\s+/g, '');
  if (bits.length < 16 || bits.length % 8) return null;
  try {
    const out = pqDecodeBinary(s);
    return pqIsPrintable(out) && out.length >= 2 ? out : null;
  } catch (_) {
    return null;
  }
}

function pqEncodeHex(text) {
  return pqUtf8Bytes(text).map((b) => b.toString(16).padStart(2, '0')).join(' ');
}

function pqDecodeHex(text) {
  const hex = String(text).trim().replace(/[\s:]/g, '');
  if (hex.length % 2) throw new Error('Hexadecimal incompleto.');
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.slice(i, i + 2), 16));
  return pqFromUtf8(bytes);
}

function pqDetectHex(text) {
  const s = String(text).trim();
  if (!/^[0-9a-fA-F][0-9a-fA-F\s:]*$/.test(s)) return null;
  const hex = s.replace(/[\s:]/g, '');
  if (hex.length < 12 || hex.length % 2) return null;
  if (!/[0-9]/.test(hex)) return null;
  try {
    const out = pqDecodeHex(s);
    return pqIsPrintable(out) && out.length >= 3 ? out : null;
  } catch (_) {
    return null;
  }
}

function pqEncodeOctal(text) {
  return pqUtf8Bytes(text).map((b) => b.toString(8).padStart(3, '0')).join(' ');
}

function pqDecodeOctal(text) {
  const parts = String(text).trim().split(/\s+/);
  const bytes = parts.map((p) => parseInt(p, 8));
  if (bytes.some((n) => Number.isNaN(n) || n > 255)) throw new Error('Octal inválido.');
  return pqFromUtf8(bytes);
}

function pqEncodeDecimal(text) {
  return pqUtf8Bytes(text).join(' ');
}

function pqDecodeDecimal(text) {
  const parts = String(text).trim().split(/\s+/);
  const bytes = parts.map((p) => parseInt(p, 10));
  if (bytes.some((n) => Number.isNaN(n) || n > 255)) throw new Error('Decimal inválido.');
  return pqFromUtf8(bytes);
}

function pqEncodeBase64(text) {
  const bytes = pqUtf8Bytes(text);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin);
}

function pqDecodeBase64(text) {
  const s = String(text).trim().replace(/\s+/g, '');
  const bin = atob(s);
  const bytes = Array.from(bin, (c) => c.charCodeAt(0));
  return pqFromUtf8(bytes);
}

function pqDetectBase64(text) {
  const s = String(text).trim().replace(/\s+/g, '');
  if (s.length < 8 || s.length % 4) return null;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(s)) return null;
  if (/^[A-Za-z]+$/.test(s) && s.length <= 12) return null;
  try {
    const out = pqDecodeBase64(s);
    if (!pqIsPrintable(out) || out.length < 3) return null;
    if (out === s) return null;
    return out;
  } catch (_) {
    return null;
  }
}

function pqEncodeBase32(text) {
  const bytes = pqUtf8Bytes(text);
  let bits = '';
  bytes.forEach((b) => { bits += pqPadBits(b, 8); });
  while (bits.length % 5) bits += '0';
  let out = '';
  for (let i = 0; i < bits.length; i += 5) out += PQ_B32[parseInt(bits.slice(i, i + 5), 2)];
  const pad = (8 - (out.length % 8)) % 8;
  return out + '='.repeat(pad);
}

function pqDecodeBase32(text) {
  const s = String(text).trim().replace(/\s+/g, '').toUpperCase().replace(/=+$/, '');
  let bits = '';
  for (const ch of s) {
    const i = PQ_B32.indexOf(ch);
    if (i < 0) throw new Error('Base32 inválido.');
    bits += pqPadBits(i, 5);
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return pqFromUtf8(bytes);
}

function pqDetectBase32(text) {
  const s = String(text).trim().replace(/\s+/g, '');
  if (s.length < 16) return null;
  if (!/^[A-Z2-7]+={0,6}$/i.test(s)) return null;
  if (/^[A-Za-z]+$/.test(s.replace(/=+$/, '')) && s.replace(/=+$/, '').length <= 12) return null;
  try {
    const out = pqDecodeBase32(s);
    return pqIsPrintable(out) && out.length >= 3 ? out : null;
  } catch (_) {
    return null;
  }
}

function pqEncodeUrl(text) {
  return encodeURIComponent(text);
}

function pqDecodeUrl(text) {
  return decodeURIComponent(String(text).replace(/\+/g, '%20'));
}

function pqDetectUrl(text) {
  const s = String(text).trim();
  if (!/%[0-9A-Fa-f]{2}/.test(s)) return null;
  const count = (s.match(/%[0-9A-Fa-f]{2}/g) || []).length;
  if (count < 2 && s.length < 8) return null;
  try {
    const out = pqDecodeUrl(s);
    return out !== s && pqIsPrintable(out) ? out : null;
  } catch (_) {
    return null;
  }
}

function pqEncodeUnicode(text) {
  return Array.from(String(text)).map((ch) => {
    const n = ch.codePointAt(0);
    return 'U+' + n.toString(16).toUpperCase().padStart(n > 0xFFFF ? 6 : 4, '0');
  }).join(' ');
}

function pqDecodeUnicode(text) {
  return String(text).trim().split(/\s+/).map((tok) => {
    const m = tok.match(/^U\+([0-9A-Fa-f]{4,6})$/);
    if (!m) return tok;
    return String.fromCodePoint(parseInt(m[1], 16));
  }).join('');
}

function pqDetectUnicode(text) {
  const s = String(text).trim();
  const parts = s.split(/\s+/);
  if (parts.length < 2) return null;
  if (!parts.every((p) => /^U\+[0-9A-Fa-f]{4,6}$/.test(p))) return null;
  return pqDecodeUnicode(s);
}

function pqRot13(text) {
  return String(text).replace(/[A-Za-z]/g, (ch) => {
    const base = ch <= 'Z' ? 65 : 97;
    return String.fromCharCode(base + ((ch.charCodeAt(0) - base + 13) % 26));
  });
}

function pqRot47(text) {
  return String(text).replace(/[\x21-\x7e]/g, (ch) =>
    String.fromCharCode(33 + ((ch.charCodeAt(0) - 33 + 47) % 94))
  );
}

function pqAtbash(text) {
  return String(text).replace(/[A-Za-z]/g, (ch) => {
    const base = ch <= 'Z' ? 65 : 97;
    return String.fromCharCode(base + (25 - (ch.charCodeAt(0) - base)));
  });
}

function pqCaesar(text, shift) {
  const n = ((shift % 26) + 26) % 26;
  return String(text).replace(/[A-Za-z]/g, (ch) => {
    const base = ch <= 'Z' ? 65 : 97;
    return String.fromCharCode(base + ((ch.charCodeAt(0) - base + n) % 26));
  });
}

function pqEncodeLeet(text) {
  return Array.from(String(text)).map((ch) => {
    const hit = PQ_LEET[ch.toLowerCase()];
    if (!hit) return ch;
    return ch === ch.toUpperCase() && ch !== ch.toLowerCase() ? hit : hit;
  }).join('');
}

function pqDecodeLeet(text) {
  return Array.from(String(text)).map((ch) => PQ_LEET_REV[ch] || ch).join('');
}

function pqEncodeFlip(text) {
  return Array.from(String(text)).reverse().map((ch) => PQ_FLIP[ch] || ch).join('');
}

function pqDecodeFlip(text) {
  return Array.from(String(text)).reverse().map((ch) => PQ_FLIP_REV[ch] || ch).join('');
}

function pqEncodeReverse(text) {
  return Array.from(String(text)).reverse().join('');
}

const PQ_CODECS = [
  { id: 'morse', label: 'Código Morse', encode: pqEncodeMorse, decode: pqDecodeMorse, detect: pqDetectMorse },
  { id: 'binary', label: 'Binário', encode: pqEncodeBinary, decode: pqDecodeBinary, detect: pqDetectBinary },
  { id: 'hex', label: 'Hexadecimal', encode: pqEncodeHex, decode: pqDecodeHex, detect: pqDetectHex },
  { id: 'octal', label: 'Octal', encode: pqEncodeOctal, decode: pqDecodeOctal, detect: null },
  { id: 'decimal', label: 'Decimal', encode: pqEncodeDecimal, decode: pqDecodeDecimal, detect: null },
  { id: 'base64', label: 'Base64', encode: pqEncodeBase64, decode: pqDecodeBase64, detect: pqDetectBase64 },
  { id: 'base32', label: 'Base32', encode: pqEncodeBase32, decode: pqDecodeBase32, detect: pqDetectBase32 },
  { id: 'braille', label: 'Braille (grau 1)', encode: pqEncodeBraille, decode: pqDecodeBraille, detect: pqDetectBraille },
  { id: 'nato', label: 'Alfabeto fonético OTAN', encode: pqEncodeNato, decode: pqDecodeNato, detect: pqDetectNato },
  { id: 'unicode', label: 'Pontos Unicode (U+)', encode: pqEncodeUnicode, decode: pqDecodeUnicode, detect: pqDetectUnicode },
  { id: 'url', label: 'Codificação de URL', encode: pqEncodeUrl, decode: pqDecodeUrl, detect: pqDetectUrl },
  { id: 'rot13', label: 'ROT13', encode: pqRot13, decode: pqRot13, detect: null },
  { id: 'rot47', label: 'ROT47', encode: pqRot47, decode: pqRot47, detect: null },
  { id: 'atbash', label: 'Atbash', encode: pqAtbash, decode: pqAtbash, detect: null },
  { id: 'caesar', label: 'Cifra de César', encode: (t) => pqCaesar(t, 3), decode: (t) => pqCaesar(t, -3), detect: null },
  { id: 'leet', label: 'Leetspeak', encode: pqEncodeLeet, decode: pqDecodeLeet, detect: null },
  { id: 'flip', label: 'Texto de cabeça para baixo', encode: pqEncodeFlip, decode: pqDecodeFlip, detect: null },
  { id: 'reverse', label: 'Texto invertido', encode: pqEncodeReverse, decode: pqEncodeReverse, detect: null }
];

const PQ_CODEC_MAP = {};
PQ_CODECS.forEach((c) => { PQ_CODEC_MAP[c.id] = c; });

function pqIsCode(id) {
  return !!PQ_CODEC_MAP[id];
}

function pqEncode(text, id) {
  const c = PQ_CODEC_MAP[id];
  if (!c) return text;
  return c.encode(text);
}

function pqDecode(text, id) {
  const c = PQ_CODEC_MAP[id];
  if (!c || !c.decode) return text;
  return c.decode(text);
}

function pqLooksLikeCode(text) {
  const s = String(text).trim();
  if (!s) return false;
  if (pqDetectMorse(s) || pqDetectBinary(s) || pqDetectBraille(s)) return true;
  return false;
}

function pqAutoDecode(text) {
  const s = String(text).trim();
  if (!s) return null;
  const order = ['morse', 'braille', 'nato', 'unicode', 'binary', 'hex', 'url', 'base64', 'base32'];
  for (const id of order) {
    const c = PQ_CODEC_MAP[id];
    if (!c || !c.detect) continue;
    const out = c.detect(s);
    if (out != null && out !== s) return { id, decoded: out, label: c.label };
  }
  return null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PQ_CODECS, pqIsCode, pqEncode, pqDecode, pqAutoDecode, pqLooksLikeCode,
    pqEncodeMorse, pqDecodeMorse, pqDetectMorse,
    pqEncodeBase64, pqDecodeBase64, pqDetectBase64,
    pqDetectNato, pqDetectBinary, pqDetectHex
  };
}
