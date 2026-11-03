# Pesquisador Rápido

Extensão para o Chrome (Manifest V3) com um painel flutuante que reconhece texto ou imagem selecionados e oferece pesquisa no Google, Google Lens, tradução e decodificação de códigos.

## Instalar

1. Extraia o arquivo `.zip` em uma pasta nova (por exemplo, `pesquisador-rapido`). Não carregue o `.zip` direto: o Chrome só lê pastas.
2. Abra `chrome://extensions` no Chrome.
3. Ative o **Modo do desenvolvedor** (canto superior direito).
4. Clique em **Carregar sem compactação** e escolha a pasta que contém o arquivo `manifest.json`.
5. Fixe a extensão na barra de ferramentas pelo ícone de quebra-cabeça.

Abas que já estavam abertas precisam ser recarregadas uma vez.

O atalho padrão para ligar e desligar é **Alt+Shift+S**. Altere em `chrome://extensions/shortcuts`.

## Usar

- Selecione um texto (arraste, clique duas vezes ou use Shift + setas). O painel aparece ao lado.
- Duplo clique em uma imagem, Alt+clique ou arrastar a seleção sobre ela abre o painel com miniatura e o botão do Google Lens.
- Arraste o painel pelo cabeçalho. Use **Fixar** para ele não sumir ao clicar fora, **Minimizar** para recolher e Esc para fechar.
- No seletor, escolha um idioma ou um código (Morse, Base64, Braille, OTAN e outros).
- Se o texto parecer um código e a opção de decodificação automática estiver ligada, o painel decodifica e depois traduz (por exemplo, Morse para inglês e depois para português).
- No ícone da extensão você liga e desliga o painel, escolhe o idioma, o modo (automático ou com ícone) e converte um texto digitado.

## Limitações

- Não funciona em páginas internas do Chrome (`chrome://`), na Chrome Web Store nem no leitor de PDF nativo.
- Textos acima de 5.000 caracteres são cortados na tradução.
- Imagens menores que 32 px são ignoradas. Seleções com mais de 4 imagens também.
- A tradução usa um endpoint não oficial do Google, sem chave. Sem internet, com muitas solicitações (HTTP 429) ou resposta ilegível, o painel mostra o erro em português.

## Privacidade

O texto selecionado é enviado ao serviço de tradução do Google (`translate.googleapis.com`) quando a ação é traduzir. Códigos e cifras são processados só no seu computador. A extensão não coleta nem guarda histórico por padrão. A posição do painel, se você pedir para lembrar, fica em `chrome.storage.local` neste navegador.

Não selecione dados sensíveis com a tradução ligada.

## Como trocar o serviço de tradução

Toda a chamada de rede da tradução está na função `translateChunk` em `background.js`. Troque a URL, o parse da resposta (`parseResponse`) e, se preciso, o `host_permissions` do `manifest.json`.

## Testes

```bash
# Testes unitários das cifras
node tests/codes.test.js
node tests/convert.test.js

# Teste de ponta a ponta (Playwright + Chromium)
npx playwright install chromium
npx playwright test tests/e2e.spec.js
```

## Arquivos

- `manifest.json` — Manifest V3
- `background.js` — service worker (tradução, atalho, Lens)
- `content.js` — painel flutuante em Shadow DOM fechado
- `langs.js` — idiomas do Google Tradutor
- `codes.js` — Morse, Base64 e demais cifras
- `popup.html` / `popup.js` — configurações
- `lens.html` / `lens.js` — envio de imagem data/blob ao Lens
