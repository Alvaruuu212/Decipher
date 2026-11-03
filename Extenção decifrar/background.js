// Service worker: tradução, atalho, download de imagens e preparação do upload do Lens.
importScripts('langs.js', 'codes.js');

const ENDPOINT = 'https://translate.googleapis.com/translate_a/single';
const MAX_CHARS = 5000;
const CHUNK = 1200;
const cache = new Map();

const DEFAULTS = {
  enabled: true,
  target: 'pt',
  mode: 'auto',
  autoDecode: true,
  autoLens: false,
  rememberPos: true,
  posScope: 'site'
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(DEFAULTS, (s) => {
    chrome.storage.sync.set(Object.assign({}, DEFAULTS, s));
  });
});

chrome.commands.onCommand.addListener((command) => {
  if (command !== 'toggle') return;
  chrome.storage.sync.get(DEFAULTS, (s) => {
    chrome.storage.sync.set({ enabled: !s.enabled });
  });
});

function splitText(text, max) {
  const limit = max || CHUNK;
  const parts = [];
  let cur = '';
  for (const p of text.split(/(\n+)/)) {
    if (p.length > limit) {
      if (cur) { parts.push(cur); cur = ''; }
      const sentences = p.match(/[^.!?。！？]+[.!?。！？]*\s*/g) || [p];
      let buf = '';
      for (const s of sentences) {
        if (buf && (buf + s).length > limit) { parts.push(buf); buf = ''; }
        if (s.length > limit) {
          for (let i = 0; i < s.length; i += limit) parts.push(s.slice(i, i + limit));
        } else {
          buf += s;
        }
      }
      if (buf) parts.push(buf);
    } else if (cur && (cur + p).length > limit) {
      parts.push(cur);
      cur = p;
    } else {
      cur += p;
    }
  }
  if (cur) parts.push(cur);
  return parts;
}

function parseResponse(d) {
  const segs = Array.isArray(d && d[0]) ? d[0] : [];
  return { text: segs.map((s) => (s && s[0]) || '').join(''), detected: (d && d[2]) || '' };
}

// Isolada para facilitar a troca do serviço de tradução.
async function translateChunk(chunk, target) {
  const lead = chunk.match(/^\s*/)[0];
  const trail = chunk.match(/\s*$/)[0];
  const core = chunk.trim();
  if (!core) return { text: chunk, detected: '' };
  const url = ENDPOINT + '?client=gtx&sl=auto&dt=t&tl=' + encodeURIComponent(target) + '&q=' + encodeURIComponent(core);
  let res;
  try {
    res = await fetch(url);
  } catch (_) {
    throw new Error('Sem conexão com o serviço de tradução. Verifique a internet e tente de novo.');
  }
  if (!res.ok) throw new Error(res.status === 429 ? 'Muitas solicitações. Aguarde um instante.' : 'Falha na tradução (HTTP ' + res.status + ').');
  let data;
  try {
    data = JSON.parse(await res.text());
  } catch (_) {
    throw new Error('O serviço de tradução devolveu uma resposta ilegível. Tente de novo em instantes.');
  }
  const out = parseResponse(data);
  if (!out.text) throw new Error('O serviço de tradução não devolveu nenhum texto.');
  return { text: lead + out.text + trail, detected: out.detected };
}

async function translateNetwork(text, target) {
  let truncated = false;
  if (text.length > MAX_CHARS) { text = text.slice(0, MAX_CHARS); truncated = true; }
  const key = target + '|' + text;
  if (cache.has(key)) return Object.assign({ truncated }, cache.get(key));
  let detected = '';
  let result = '';
  for (const chunk of splitText(text)) {
    const r = await translateChunk(chunk, target);
    if (!detected && r.detected) detected = r.detected;
    result += r.text;
  }
  const value = { text: result, detected };
  cache.set(key, value);
  if (cache.size > 100) cache.delete(cache.keys().next().value);
  return Object.assign({ truncated }, value);
}

async function convert(text, target, autoDecode) {
  const steps = [];
  let work = text;
  let detected = '';
  if (autoDecode) {
    const hit = pqAutoDecode(work);
    if (hit) {
      steps.push(hit.label);
      work = hit.decoded;
      detected = hit.id;
    }
  }
  if (pqIsCode(target)) {
    steps.push(PQ_CODEC_MAP[target].label);
    return { ok: true, text: pqEncode(work, target), decoded: work, detected, steps, truncated: false };
  }
  const r = await translateNetwork(work, target);
  if (r.detected) steps.push(pqLangName(r.detected));
  steps.push(pqLangName(target));
  return {
    ok: true,
    text: r.text,
    decoded: work,
    detected: detected || r.detected,
    steps,
    truncated: !!r.truncated
  };
}

async function fetchImage(url) {
  let res;
  try {
    res = await fetch(url);
  } catch (_) {
    throw new Error('Não foi possível baixar a imagem.');
  }
  if (!res.ok) throw new Error('Falha ao baixar a imagem (HTTP ' + res.status + ').');
  const buf = await res.arrayBuffer();
  const bytes = Array.from(new Uint8Array(buf));
  const type = (res.headers.get('content-type') || 'image/jpeg').split(';')[0];
  const id = 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const rec = { bytes, type, name: 'selecao.' + (type.split('/')[1] || 'jpg') };
  if (chrome.storage.session) await chrome.storage.session.set({ [id]: rec });
  else await chrome.storage.local.set({ [id]: rec });
  return id;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) return false;
  if (msg.type === 'convert') {
    convert(msg.text || '', msg.target || 'pt', msg.autoDecode !== false)
      .then(sendResponse)
      .catch((e) => sendResponse({ ok: false, error: (e && e.message) || 'Não foi possível converter agora.' }));
    return true;
  }
  if (msg.type === 'fetch-image') {
    fetchImage(msg.url)
      .then((id) => sendResponse({ ok: true, id }))
      .catch((e) => sendResponse({ ok: false, error: (e && e.message) || 'Não foi possível preparar a imagem.' }));
    return true;
  }
  if (msg.type === 'open-tab') {
    chrome.tabs.create({ url: msg.url, active: true });
    sendResponse({ ok: true });
    return false;
  }
  if (msg.type === 'open-lens-upload') {
    const page = chrome.runtime.getURL('lens.html?id=' + encodeURIComponent(msg.id));
    chrome.tabs.create({ url: page, active: true });
    sendResponse({ ok: true });
    return false;
  }
  if (msg.type === 'get-tab-id') {
    sendResponse({ ok: true, tabId: sender.tab && sender.tab.id });
    return false;
  }
  return false;
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { splitText, parseResponse, convert };
}
