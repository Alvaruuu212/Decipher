// Content script: observa seleção de texto/imagem e mostra o painel flutuante em Shadow DOM fechado.
(() => {
  if (window.__pqLoaded) return;
  window.__pqLoaded = true;

  const DEFAULTS = {
    enabled: true,
    target: pqGuessTarget(),
    mode: 'auto',
    autoDecode: true,
    autoLens: false,
    rememberPos: true,
    posScope: 'site'
  };

  let settings = Object.assign({}, DEFAULTS);
  let host = null;
  let root = null;
  let ui = {};
  let current = null;
  let tokenSeq = 0;
  let mouseDown = false;
  let hostTs = 0;
  let timer = null;
  let pinned = false;
  let minimized = false;
  let dragging = false;
  let dragOff = { x: 0, y: 0 };
  let savedPos = null;
  let listenersOn = false;
  let lastResult = '';
  const bound = {};

  const CSS = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
    [hidden] { display: none !important; }
    .card, .pin {
      --bg: #ffffff; --fg: #13201e; --muted: #5b6b68; --line: #d8dfdd; --accent: #2b44e8; --accent-fg: #ffffff; --err: #b3261e;
    }
    @media (prefers-color-scheme: dark) {
      .card, .pin { --bg: #172220; --fg: #e8f0ee; --muted: #93a5a1; --line: #2a3a38; --accent: #8c9cff; --accent-fg: #0e1514; --err: #ff8a80; }
    }
    .card { position: absolute; width: min(380px, calc(100vw - 16px)); background: var(--bg); color: var(--fg);
      border: 1px solid var(--line); border-radius: 12px; box-shadow: 0 8px 28px rgba(0,0,0,.22);
      font-size: 14px; line-height: 1.45; overflow: hidden; }
    .head { display: flex; align-items: center; gap: 6px; padding: 8px 8px 8px 12px; border-bottom: 1px solid var(--line); cursor: grab; }
    .head.drag { cursor: grabbing; }
    .route { flex: 1; min-width: 0; font-size: 12px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    select { max-width: 160px; background: var(--bg); color: var(--fg); border: 1px solid var(--line); border-radius: 6px; padding: 3px 6px; font-size: 12px; font-weight: 600; }
    .icon { border: 0; background: transparent; color: var(--muted); font-size: 16px; line-height: 1; cursor: pointer; padding: 2px 6px; border-radius: 6px; }
    .icon:hover, .icon.on { color: var(--fg); }
    .icon.on { color: var(--accent); }
    .body { padding: 10px 12px; max-height: 40vh; overflow-y: auto; white-space: pre-wrap; overflow-wrap: anywhere; user-select: text; }
    .body.err { color: var(--err); }
    .body.load { color: var(--muted); }
    .note { padding: 0 12px 6px; font-size: 11px; color: var(--muted); }
    .thumb { display: block; max-width: 100%; max-height: 120px; margin: 0 12px 8px; border-radius: 8px; object-fit: contain; background: var(--line); }
    .foot { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 12px 10px; }
    .btn { border: 1px solid var(--line); background: var(--bg); color: var(--fg); border-radius: 8px; padding: 5px 12px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .btn:hover { border-color: var(--accent); }
    .btn.primary { background: var(--accent); color: var(--accent-fg); border-color: var(--accent); }
    .pin { position: absolute; width: 30px; height: 30px; border-radius: 50%; border: 0; background: var(--accent); color: var(--accent-fg);
      font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,.28); }
    :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  `;

  function posKey() {
    try {
      if (settings.posScope === 'global') return 'pq_pos_global';
      return 'pq_pos_' + location.origin;
    } catch (_) {
      return 'pq_pos_global';
    }
  }

  function loadPos() {
    if (!settings.rememberPos) { savedPos = null; return; }
    try {
      chrome.storage.local.get(posKey(), (v) => { savedPos = v[posKey()] || null; });
    } catch (_) {}
  }

  function savePos(left, top) {
    savedPos = { left, top };
    if (!settings.rememberPos) return Promise.resolve();
    try {
      const o = {};
      o[posKey()] = savedPos;
      return new Promise((resolve) => {
        try { chrome.storage.local.set(o, resolve); } catch (_) { resolve(); }
      });
    } catch (_) {
      return Promise.resolve();
    }
  }

  function applySettings(v) {
    const was = settings.enabled;
    settings = Object.assign({}, settings, v);
    if (!settings.enabled) {
      hide(true);
      detach();
    } else if (!was) {
      attach();
    }
    loadPos();
  }

  try {
    chrome.storage.sync.get(DEFAULTS, (v) => {
      applySettings(v);
      try {
        chrome.storage.local.get(posKey(), (p) => {
          savedPos = p[posKey()] || null;
          window.__pqReady = true;
          if (ui.card && !ui.card.hidden) place();
        });
      } catch (_) {
        window.__pqReady = true;
      }
    });
    chrome.storage.onChanged.addListener((ch, area) => {
      if (area !== 'sync') return;
      const next = {};
      for (const k in ch) if (ch[k].newValue !== undefined) next[k] = ch[k].newValue;
      applySettings(next);
    });
  } catch (_) {
    window.__pqReady = true;
  }

  function ensureUI() {
    if (host && host.isConnected) return;
    host = document.createElement('div');
    host.setAttribute('data-pq-host', '');
    host.style.cssText = 'all:initial;position:absolute;top:0;left:0;width:0;height:0;z-index:2147483647;';
    root = host.attachShadow({ mode: 'closed' });
    const style = document.createElement('style');
    style.textContent = CSS;
    const pin = document.createElement('button');
    pin.className = 'pin';
    pin.type = 'button';
    pin.setAttribute('aria-label', 'Abrir painel da seleção');
    pin.hidden = true;
    pin.textContent = '文';
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', 'Pesquisador Rápido');
    card.hidden = true;
    card.innerHTML =
      '<div class="head">' +
        '<span class="route"></span>' +
        '<select class="lang" aria-label="Idioma ou código de destino"></select>' +
        '<button class="icon pinbtn" type="button" aria-label="Fixar painel" title="Fixar">Fixar</button>' +
        '<button class="icon min" type="button" aria-label="Minimizar" title="Minimizar">–</button>' +
        '<button class="icon x" type="button" aria-label="Fechar">×</button>' +
      '</div>' +
      '<img class="thumb" alt="Imagem selecionada" hidden>' +
      '<div class="body" dir="auto"></div>' +
      '<div class="note" hidden></div>' +
      '<div class="foot">' +
        '<button class="btn primary google" type="button">Pesquisar no Google</button>' +
        '<button class="btn lens" type="button">Google Lens</button>' +
        '<button class="btn copy" type="button">Copiar</button>' +
        '<button class="btn repl" type="button" hidden>Substituir no texto</button>' +
      '</div>';
    root.appendChild(style);
    root.appendChild(pin);
    root.appendChild(card);
    ui = {
      pin, card,
      head: card.querySelector('.head'),
      route: card.querySelector('.route'),
      lang: card.querySelector('.lang'),
      pinbtn: card.querySelector('.pinbtn'),
      min: card.querySelector('.min'),
      x: card.querySelector('.x'),
      thumb: card.querySelector('.thumb'),
      body: card.querySelector('.body'),
      note: card.querySelector('.note'),
      google: card.querySelector('.google'),
      lens: card.querySelector('.lens'),
      copy: card.querySelector('.copy'),
      repl: card.querySelector('.repl'),
      foot: card.querySelector('.foot')
    };
    pqFillTargetSelect(ui.lang, settings.target);
    ui.head.addEventListener('mousedown', onDragStart);
    ui.pin.addEventListener('mousedown', (e) => { hostTs = Date.now(); e.preventDefault(); });
    ui.pin.addEventListener('click', () => { if (current) { ui.pin.hidden = true; openPanel(); } });
    ui.x.addEventListener('click', () => hide(true));
    ui.min.addEventListener('click', toggleMin);
    ui.pinbtn.addEventListener('click', togglePin);
    ui.lang.addEventListener('change', () => {
      settings.target = ui.lang.value;
      try { chrome.storage.sync.set({ target: settings.target }); } catch (_) {}
      if (current && current.text) runConvert();
    });
    ui.google.addEventListener('click', openGoogle);
    ui.lens.addEventListener('click', openLens);
    ui.copy.addEventListener('click', copyResult);
    ui.repl.addEventListener('click', replaceSelection);
    document.documentElement.appendChild(host);
    syncTestState();
  }

  function syncTestState() {
    try {
      document.documentElement.setAttribute('data-pq-ready', '1');
      if (!host) return;
      host.setAttribute('data-pq-open', ui.card && !ui.card.hidden ? '1' : '0');
      host.setAttribute('data-pq-lens', ui.lens && !ui.lens.hidden ? '1' : '0');
      host.setAttribute('data-pq-left', ui.card ? String(parseFloat(ui.card.style.left) || 0) : '0');
      host.setAttribute('data-pq-top', ui.card ? String(parseFloat(ui.card.style.top) || 0) : '0');
    } catch (_) {}
  }

  function pageRect(r) {
    return { left: r.left + scrollX, right: r.right + scrollX, top: r.top + scrollY, bottom: r.bottom + scrollY };
  }

  function getFieldSelection() {
    const a = document.activeElement;
    if (!a) return null;
    if (a.tagName === 'TEXTAREA' || (a.tagName === 'INPUT' && /^(text|search|url|email|tel)?$/i.test(a.type))) {
      try {
        const s = a.selectionStart, e = a.selectionEnd;
        if (s != null && e > s) {
          return { text: a.value.slice(s, e), rect: pageRect(a.getBoundingClientRect()), edit: { kind: 'field', el: a, start: s, end: e } };
        }
      } catch (_) {}
    }
    return null;
  }

  function getTextSelection() {
    const field = getFieldSelection();
    if (field) return field;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
    const text = sel.toString();
    if (!text.trim()) return null;
    const range = sel.getRangeAt(0);
    const rects = range.getClientRects();
    let r = rects.length ? rects[rects.length - 1] : range.getBoundingClientRect();
    if (!r || (!r.width && !r.height)) r = range.getBoundingClientRect();
    let edit = null;
    const node = range.commonAncestorContainer;
    let el = node.nodeType === 1 ? node : node.parentElement;
    if (el && el.isContentEditable) {
      let top = el;
      while (top.parentElement && top.parentElement.isContentEditable) top = top.parentElement;
      edit = { kind: 'ce', root: top, range: range.cloneRange() };
    }
    return { text, rect: pageRect(r), edit };
  }

  function imgSrc(el) {
    if (!el) return '';
    if (el.currentSrc) return el.currentSrc;
    if (el.src) return el.src;
    const srcset = el.getAttribute && el.getAttribute('srcset');
    if (srcset) return srcset.split(',')[0].trim().split(/\s+/)[0];
    return '';
  }

  function isBigImg(el) {
    if (!el || el.tagName !== 'IMG') return false;
    const w = el.naturalWidth || el.width || el.getBoundingClientRect().width;
    const h = el.naturalHeight || el.height || el.getBoundingClientRect().height;
    return w >= 32 && h >= 32;
  }

  function imagesInRange(range) {
    const imgs = [];
    const add = (el) => { if (isBigImg(el) && imgs.indexOf(el) < 0) imgs.push(el); };
    const rootEl = range.commonAncestorContainer;
    const el = rootEl.nodeType === 1 ? rootEl : rootEl.parentElement;
    if (el) {
      if (el.tagName === 'IMG') add(el);
      el.querySelectorAll && el.querySelectorAll('img').forEach((img) => {
        try { if (range.intersectsNode(img)) add(img); } catch (_) {}
      });
    }
    return imgs;
  }

  function clampCard(left, top, w, h) {
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const minL = scrollX + 8;
    const maxL = scrollX + vw - w - 8;
    const minT = scrollY + 8;
    const maxT = scrollY + vh - h - 8;
    return {
      left: Math.min(Math.max(minL, left), Math.max(minL, maxL)),
      top: Math.min(Math.max(minT, top), Math.max(minT, maxT))
    };
  }

  function place() {
    if (!current || !ui.card || ui.card.hidden) return;
    const card = ui.card;
    const w = card.offsetWidth || 360;
    const h = card.offsetHeight || 160;
    let left;
    let top;
    if (savedPos && settings.rememberPos) {
      left = savedPos.left;
      top = savedPos.top;
    } else {
      const r = current.rect;
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      left = Math.min(Math.max(scrollX + 8, r.left), scrollX + vw - w - 8);
      top = r.bottom + 8;
      if (top + h > scrollY + vh - 8 && r.top - h - 8 > scrollY + 8) top = r.top - h - 8;
    }
    const p = clampCard(left, top, w, h);
    card.style.left = p.left + 'px';
    card.style.top = p.top + 'px';
    syncTestState();
  }

  function placePin() {
    if (!current) return;
    const r = current.rect;
    const vw = document.documentElement.clientWidth;
    ui.pin.style.left = Math.min(r.right + 4, scrollX + vw - 38) + 'px';
    ui.pin.style.top = (r.bottom + 4) + 'px';
  }

  function onDragStart(e) {
    if (e.button !== 0) return;
    if (e.target.closest('select, button')) return;
    hostTs = Date.now();
    dragging = true;
    ui.head.classList.add('drag');
    const rect = ui.card.getBoundingClientRect();
    dragOff.x = e.clientX - rect.left;
    dragOff.y = e.clientY - rect.top;
    e.preventDefault();
    document.addEventListener('mousemove', onDragMove, true);
    document.addEventListener('mouseup', onDragEnd, true);
  }

  function onDragMove(e) {
    if (!dragging) return;
    const w = ui.card.offsetWidth;
    const h = ui.card.offsetHeight;
    const p = clampCard(e.clientX - dragOff.x + scrollX, e.clientY - dragOff.y + scrollY, w, h);
    ui.card.style.left = p.left + 'px';
    ui.card.style.top = p.top + 'px';
  }

  function onDragEnd() {
    if (!dragging) return;
    dragging = false;
    ui.head.classList.remove('drag');
    document.removeEventListener('mousemove', onDragMove, true);
    document.removeEventListener('mouseup', onDragEnd, true);
    savePos(parseFloat(ui.card.style.left) || 0, parseFloat(ui.card.style.top) || 0);
  }

  function togglePin() {
    pinned = !pinned;
    ui.pinbtn.classList.toggle('on', pinned);
    ui.pinbtn.setAttribute('aria-pressed', pinned ? 'true' : 'false');
  }

  function toggleMin() {
    minimized = !minimized;
    ui.body.hidden = minimized;
    ui.note.hidden = minimized || !ui.note.textContent;
    ui.foot.hidden = minimized;
    ui.thumb.hidden = minimized || !current || !current.image;
    ui.min.textContent = minimized ? '+' : '–';
    ui.min.setAttribute('aria-label', minimized ? 'Expandir' : 'Minimizar');
  }

  function setBody(state, text) {
    ui.body.className = 'body' + (state === 'load' ? ' load' : state === 'err' ? ' err' : '');
    ui.body.textContent = text || '';
  }

  function updateActions() {
    const hasText = !!(current && current.text && current.text.trim());
    const hasImg = !!(current && current.image);
    ui.google.hidden = !hasText;
    ui.lens.hidden = !hasImg;
    ui.copy.hidden = !lastResult;
    ui.repl.hidden = !(lastResult && current && current.edit);
    if (hasImg && current.image.src) {
      ui.thumb.hidden = minimized;
      ui.thumb.src = current.image.src;
    } else {
      ui.thumb.hidden = true;
      ui.thumb.removeAttribute('src');
    }
  }

  function openPanel() {
    ensureUI();
    ui.pin.hidden = true;
    ui.card.hidden = false;
    minimized = false;
    ui.body.hidden = false;
    ui.foot.hidden = false;
    ui.min.textContent = '–';
    pqFillTargetSelect(ui.lang, settings.target);
    updateActions();
    if (current && current.text) runConvert();
    else {
      lastResult = '';
      ui.route.textContent = current && current.image ? 'Imagem selecionada' : 'Seleção';
      setBody('', '');
      ui.note.hidden = true;
      updateActions();
    }
    place();
    if (current && current.image && settings.autoLens) openLens();
    syncTestState();
  }

  function runConvert() {
    const c = current;
    if (!c || !c.text) return;
    lastResult = '';
    ui.route.textContent = 'Convertendo…';
    setBody('load', c.text.length > 160 ? c.text.slice(0, 160) + '…' : c.text);
    ui.note.hidden = true;
    updateActions();
    try {
      chrome.runtime.sendMessage({
        type: 'convert',
        text: c.text,
        target: settings.target,
        autoDecode: settings.autoDecode
      }, (res) => {
        if (!current || current.token !== c.token) return;
        if (chrome.runtime.lastError || !res) {
          setBody('err', 'A extensão foi atualizada. Recarregue esta página para continuar.');
          ui.route.textContent = 'Erro';
          return;
        }
        if (!res.ok) {
          setBody('err', res.error || 'Não foi possível converter agora.');
          ui.route.textContent = 'Erro';
          return;
        }
        lastResult = res.text;
        c.result = res.text;
        c.decoded = res.decoded;
        const path = (res.steps || []).filter(Boolean).join(' → ');
        ui.route.textContent = path || (pqIsCode(settings.target) ? 'Código' : 'Tradução');
        setBody('', res.text);
        if (res.decoded && res.decoded !== c.text) {
          ui.note.hidden = false;
          ui.note.textContent = 'Decodificado: ' + (res.decoded.length > 180 ? res.decoded.slice(0, 180) + '…' : res.decoded);
        } else if (res.truncated) {
          ui.note.hidden = false;
          ui.note.textContent = 'Texto cortado em 5.000 caracteres.';
        } else {
          ui.note.hidden = true;
        }
        updateActions();
        place();
      });
    } catch (_) {
      setBody('err', 'A extensão foi atualizada. Recarregue esta página para continuar.');
      ui.route.textContent = 'Erro';
    }
  }

  function showIcon() {
    ensureUI();
    ui.card.hidden = true;
    ui.pin.hidden = false;
    placePin();
  }

  function settle(extra) {
    if (!settings.enabled) return;
    const info = getTextSelection();
    const img = extra && extra.image ? extra.image : (info ? imagesFromInfo(info) : null);
    const hasText = info && (/\p{L}/u.test(info.text) || pqLooksLikeCode(info.text) || /[A-Za-z0-9+/=]/.test(info.text));
    if (!hasText && !img) {
      if (current && !pinned && Date.now() - hostTs > 700) hide(false);
      return;
    }
    const text = hasText ? info.text : '';
    const rect = (info && info.rect) || (img && img.rect);
    const key = text + '|' + (img && img.src);
    if (current && current.key === key && !ui.card.hidden) return;
    current = {
      key, text, rect, edit: info && info.edit, image: img, token: ++tokenSeq, result: null
    };
    lastResult = '';
    if (settings.mode === 'icon' && !pinned) showIcon();
    else openPanel();
  }

  function imagesFromInfo(info) {
    try {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return null;
      const imgs = imagesInRange(sel.getRangeAt(0));
      if (!imgs.length || imgs.length > 4) return null;
      const el = imgs[0];
      return { el, src: imgSrc(el), rect: info.rect };
    } catch (_) {
      return null;
    }
  }

  function pickImage(el, rect) {
    if (!isBigImg(el)) return null;
    return { el, src: imgSrc(el), rect: rect || pageRect(el.getBoundingClientRect()) };
  }

  function schedule(ms, extra) {
    clearTimeout(timer);
    timer = setTimeout(() => settle(extra), ms);
  }

  function hide(force) {
    if (pinned && !force) return;
    current = null;
    tokenSeq++;
    lastResult = '';
    clearTimeout(timer);
    if (ui.card) { ui.card.hidden = true; ui.pin.hidden = true; }
    pinned = false;
    minimized = false;
    if (ui.pinbtn) ui.pinbtn.classList.remove('on');
    syncTestState();
  }

  function openGoogle() {
    const t = (current && current.text) || '';
    if (!t) return;
    try { chrome.runtime.sendMessage({ type: 'open-tab', url: pqGoogleSearchUrl(t) }); } catch (_) {
      window.open(pqGoogleSearchUrl(t), '_blank', 'noopener,noreferrer');
    }
  }

  function isPublicHttp(url) {
    try {
      const u = new URL(url, location.href);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  function openLens() {
    const img = current && current.image;
    if (!img || !img.src) return;
    const src = img.src;
    if (isPublicHttp(src) && src.indexOf('data:') !== 0 && src.indexOf('blob:') !== 0) {
      const url = pqLensByUrl(src, (navigator.language || 'pt-BR'));
      try { host.setAttribute('data-pq-last-url', url); } catch (_) {}
      try { chrome.runtime.sendMessage({ type: 'open-tab', url }); } catch (_) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    const sendBytes = (id) => {
      try { host.setAttribute('data-pq-last-url', 'lens.html?id=' + id); } catch (_) {}
      try { chrome.runtime.sendMessage({ type: 'open-lens-upload', id }); } catch (_) {}
    };
    const sendUrl = (u) => {
      try {
        chrome.runtime.sendMessage({ type: 'fetch-image', url: u }, (res) => {
          if (res && res.ok) sendBytes(res.id);
        });
      } catch (_) {}
    };
    if (src.indexOf('blob:') === 0) {
      fetch(src).then((r) => r.blob()).then((blob) => {
        const reader = new FileReader();
        reader.onload = () => sendUrl(reader.result);
        reader.readAsDataURL(blob);
      }).catch(() => {});
      return;
    }
    sendUrl(src);
  }

  function copyResult() {
    const t = lastResult || (current && current.result);
    if (!t) return;
    const done = () => { ui.copy.textContent = 'Copiado'; setTimeout(() => { ui.copy.textContent = 'Copiar'; }, 1200); };
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = t;
      ta.style.cssText = 'position:fixed;opacity:0;';
      root.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (_) {}
      ta.remove();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, fallback);
    else fallback();
  }

  function replaceSelection() {
    const c = current;
    if (!c || !c.result || !c.edit) return;
    const t = c.result;
    try {
      if (c.edit.kind === 'field') {
        const el = c.edit.el;
        el.focus();
        el.setRangeText(t, c.edit.start, c.edit.end, 'select');
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        c.edit.root.focus();
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(c.edit.range);
        document.execCommand('insertText', false, t);
      }
    } catch (_) {}
    hide(true);
  }

  function inHost(e) {
    return host && e.composedPath && e.composedPath().includes(host);
  }

  bound.mousedown = (e) => {
    if (inHost(e)) { hostTs = Date.now(); return; }
    mouseDown = true;
    if (current && !pinned) hide(false);
  };
  bound.mouseup = (e) => {
    mouseDown = false;
    if (inHost(e)) return;
    let extra = null;
    const path = e.composedPath ? e.composedPath() : [];
    const img = path.find((n) => n && n.tagName === 'IMG');
    if (e.altKey && img) extra = { image: pickImage(img) };
    schedule(200, extra);
  };
  bound.dblclick = (e) => {
    if (inHost(e)) return;
    const path = e.composedPath ? e.composedPath() : [];
    const img = path.find((n) => n && n.tagName === 'IMG');
    if (img && isBigImg(img)) {
      const image = pickImage(img);
      const info = getTextSelection();
      current = {
        key: 'img|' + image.src,
        text: (info && info.text) || '',
        rect: image.rect,
        edit: info && info.edit,
        image,
        token: ++tokenSeq,
        result: null
      };
      lastResult = '';
      if (settings.mode === 'icon' && !pinned) showIcon();
      else openPanel();
    }
  };
  bound.keyup = (e) => {
    if (inHost(e)) return;
    if (e.key === 'Escape') { hide(true); return; }
    if (e.shiftKey || /^(Arrow|Home$|End$|Page)/.test(e.key) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a')) schedule(450);
  };
  bound.selectionchange = () => {
    if (mouseDown || Date.now() - hostTs < 700) return;
    schedule(500);
  };
  bound.scroll = () => { if (ui.card && !ui.card.hidden) place(); };
  bound.resize = () => { if (ui.card && !ui.card.hidden) place(); };

  function attach() {
    if (listenersOn) return;
    listenersOn = true;
    document.addEventListener('mousedown', bound.mousedown, true);
    document.addEventListener('mouseup', bound.mouseup, true);
    document.addEventListener('dblclick', bound.dblclick, true);
    document.addEventListener('keyup', bound.keyup, true);
    document.addEventListener('selectionchange', bound.selectionchange);
    window.addEventListener('scroll', bound.scroll, true);
    window.addEventListener('resize', bound.resize);
  }

  function detach() {
    if (!listenersOn) return;
    listenersOn = false;
    document.removeEventListener('mousedown', bound.mousedown, true);
    document.removeEventListener('mouseup', bound.mouseup, true);
    document.removeEventListener('dblclick', bound.dblclick, true);
    document.removeEventListener('keyup', bound.keyup, true);
    document.removeEventListener('selectionchange', bound.selectionchange);
    window.removeEventListener('scroll', bound.scroll, true);
    window.removeEventListener('resize', bound.resize);
    if (host && host.remove) host.remove();
    host = null;
    root = null;
    ui = {};
  }

  if (settings.enabled) attach();
  document.documentElement.setAttribute('data-pq-ready', '1');

  window.addEventListener('message', (e) => {
    if (!e.data || e.data.type !== 'pq-test') return;
    const cmd = e.data.cmd;
    if (cmd === 'dragTo' && ui.card) {
      const w = ui.card.offsetWidth || 360;
      const h = ui.card.offsetHeight || 160;
      const p = clampCard(e.data.left, e.data.top, w, h);
      ui.card.style.left = p.left + 'px';
      ui.card.style.top = p.top + 'px';
      savePos(p.left, p.top).then(syncTestState);
    }
    if (cmd === 'clickLens') openLens();
    if (cmd === 'clickGoogle') openGoogle();
  });
})();
