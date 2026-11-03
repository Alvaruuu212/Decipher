(async () => {
  const status = document.getElementById('status');
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) {
    status.className = 'err';
    status.textContent = 'Nenhuma imagem foi encontrada para enviar.';
    return;
  }
  let rec;
  const store = chrome.storage.session || chrome.storage.local;
  try {
    const all = await store.get(id);
    rec = all[id];
  } catch (_) {
    rec = null;
  }
  if (!rec || !rec.bytes) {
    status.className = 'err';
    status.textContent = 'A imagem expirou. Selecione de novo e tente outra vez.';
    return;
  }
  try {
    const bytes = new Uint8Array(rec.bytes);
    const blob = new Blob([bytes], { type: rec.type || 'image/jpeg' });
    const file = new File([blob], rec.name || 'selecao.jpg', { type: rec.type || 'image/jpeg' });
    const form = document.createElement('form');
    form.method = 'POST';
    form.enctype = 'multipart/form-data';
    form.action = 'https://lens.google.com/upload';
    form.acceptCharset = 'UTF-8';
    const encoded = document.createElement('input');
    encoded.type = 'hidden';
    encoded.name = 'encoded_image';
    const dt = new DataTransfer();
    dt.items.add(file);
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = 'encoded_image';
    fileInput.files = dt.files;
    const hl = document.createElement('input');
    hl.type = 'hidden';
    hl.name = 'hl';
    hl.value = 'pt-BR';
    form.appendChild(fileInput);
    form.appendChild(encoded);
    form.appendChild(hl);
    document.body.appendChild(form);
    status.textContent = 'Enviando para o Google Lens…';
    form.submit();
    store.remove(id);
  } catch (e) {
    status.className = 'err';
    status.textContent = 'Não foi possível enviar a imagem. ' + ((e && e.message) || '');
  }
})();
