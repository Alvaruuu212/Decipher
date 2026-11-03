const $ = (id) => document.getElementById(id);
const DEFAULTS = {
  enabled: true,
  target: pqGuessTarget(),
  mode: 'auto',
  autoDecode: true,
  autoLens: false,
  rememberPos: true,
  posScope: 'site'
};

pqFillTargetSelect($('target'));

chrome.storage.sync.get(DEFAULTS, (s) => {
  $('enabled').checked = !!s.enabled;
  $('target').value = s.target;
  $('mode').value = s.mode;
  $('autoDecode').checked = s.autoDecode !== false;
  $('autoLens').checked = !!s.autoLens;
  $('rememberPos').checked = s.rememberPos !== false;
  $('posScope').value = s.posScope || 'site';
  if ($('src').value.trim()) run();
});

function set(key, value) {
  const o = {};
  o[key] = value;
  chrome.storage.sync.set(o);
}

$('enabled').addEventListener('change', () => set('enabled', $('enabled').checked));
$('mode').addEventListener('change', () => set('mode', $('mode').value));
$('autoDecode').addEventListener('change', () => set('autoDecode', $('autoDecode').checked));
$('autoLens').addEventListener('change', () => set('autoLens', $('autoLens').checked));
$('rememberPos').addEventListener('change', () => set('rememberPos', $('rememberPos').checked));
$('posScope').addEventListener('change', () => set('posScope', $('posScope').value));
$('target').addEventListener('change', () => {
  set('target', $('target').value);
  if ($('src').value.trim()) run();
});

$('shortcuts').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
});

let timer = null, seq = 0, lastResult = '';
$('src').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 400); });

function show(text, cls, steps) {
  const out = $('out');
  out.textContent = text;
  out.className = cls || '';
  $('detected').textContent = steps && steps.length ? steps.join(' → ') : '';
  $('copy').hidden = cls !== '';
}

function run() {
  const text = $('src').value;
  const mine = ++seq;
  if (!text.trim()) { lastResult = ''; show('O resultado aparece aqui.', 'muted'); return; }
  show('Convertendo…', 'muted');
  chrome.runtime.sendMessage({
    type: 'convert',
    text,
    target: $('target').value,
    autoDecode: $('autoDecode').checked
  }, (res) => {
    if (mine !== seq) return;
    if (chrome.runtime.lastError || !res) { show('Não foi possível falar com a extensão. Reabra este painel.', 'err'); return; }
    if (!res.ok) { show(res.error || 'Não foi possível converter agora.', 'err'); return; }
    lastResult = res.text;
    show(res.text, '', res.steps);
  });
}

$('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(lastResult);
    $('copy').textContent = 'Copiado';
    setTimeout(() => { $('copy').textContent = 'Copiar'; }, 1200);
  } catch (_) {}
});
