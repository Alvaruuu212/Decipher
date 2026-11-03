# Decipher
Chrome extension that translates, decodes (Morse, Base64, Braille, and more), and searches Google or Lens for the text and images you select, in a floating, draggable panel.
# Decipher

Extensão do Chrome para **pesquisar e decifrar** o que você seleciona na página. Selecione um texto ou uma imagem e um painel flutuante, que você arrasta para onde quiser, oferece traduzir, decodificar, pesquisar no Google ou pesquisar no Google Lens.

> Manifest V3 · JavaScript puro, sem dependências e sem etapa de build.


## Recursos

- **Painel flutuante arrastável**: fica em segundo plano e só aparece quando você seleciona algo. Dá para fixar, minimizar e mover para qualquer lugar da tela. A posição é lembrada.
- **Traduzir** para mais de 130 idiomas, com detecção automática do idioma de origem.
- **Decodificar e codificar** códigos e cifras, tudo localmente no navegador:
  Morse, binário, hexadecimal, octal, decimal (ASCII), Base64, Base32, Braille, alfabeto fonético da OTAN, pontos Unicode (U+), codificação de URL, ROT13, ROT47, Atbash, Cifra de César, leetspeak, texto de cabeça para baixo e texto invertido.
- **Detecção automática de códigos**: se o texto selecionado parece Morse, Base64, binário etc., o Decipher decodifica e depois traduz. Exemplo: Morse → inglês → português.
- **Pesquisar no Google** o texto selecionado.
- **Pesquisar no Google Lens** a imagem selecionada (duplo clique na imagem ou arrastando a seleção sobre ela).
- Funciona em campos de texto e em campos editáveis, com a opção **Substituir no texto**.
- Tema claro e escuro automático, com navegação por teclado.

## Instalação

1. Baixe o repositório (**Code → Download ZIP**) e extraia em uma pasta.
2. Abra `chrome://extensions` no Chrome.
3. Ative o **Modo do desenvolvedor** (canto superior direito).
4. Clique em **Carregar sem compactação** e escolha a pasta que contém o `manifest.json`.
5. Fixe o Decipher na barra de ferramentas pelo ícone de quebra-cabeça.

Abas que já estavam abertas precisam ser recarregadas uma vez.

## Como usar

| Quero... | Faça isto |
| --- | --- |
| Traduzir um texto | Selecione o texto. O painel abre com a tradução. |
| Mudar o idioma | Escolha outro idioma no seletor do painel. |
| Decodificar Morse, Base64, binário... | Selecione o código. Ele é reconhecido e decodificado automaticamente. |
| Converter texto para um código | No seletor, escolha o código em **Códigos e cifras** (por exemplo, Código Morse). |
| Pesquisar no Google | Selecione o texto e clique em **Pesquisar no Google**. |
| Pesquisar uma imagem no Lens | Dê um duplo clique na imagem (ou arraste a seleção sobre ela) e clique em **Google Lens**. |
| Mover o painel | Arraste pelo cabeçalho. Use o alfinete para fixá-lo. |
| Fechar | `Esc` ou o botão ×. |

### Exemplos

| Selecione | Resultado |
| --- | --- |
| `.... . .-.. .-.. ---` | `HELLO` (e a tradução para o seu idioma) |
| `SGVsbG8gd29ybGQ=` | `Hello world` |
| `01001000 01101001` | `Hi` |
| `SOS` com destino **Código Morse** | `... --- ...` |

## Configurações

No ícone da extensão:

- Ativar ou desativar o Decipher
- Idioma de destino
- Modo: automático ao selecionar, ou mostrar um ícone para clicar
- Decodificar códigos automaticamente
- Abrir o Google Lens automaticamente ao selecionar uma imagem (desligado por padrão)
- Lembrar a posição do painel
- Caixa para traduzir ou codificar um texto digitado

## Privacidade

- O texto selecionado é enviado ao serviço de tradução do Google (`translate.googleapis.com`, endpoint não oficial e sem chave) **apenas quando precisa ser traduzido**. Não selecione dados sensíveis com a tradução ligada.
- A conversão de códigos e cifras acontece 100% no seu navegador.
- Ao pesquisar uma imagem, ela é enviada ao Google Lens. Imagens públicas são enviadas por URL. Imagens locais (`data:` e `blob:`) são enviadas como arquivo.
- A extensão não coleta nem guarda histórico de textos ou imagens. Só guarda as suas configurações, em `chrome.storage`.

## Limitações

- Não funciona em páginas internas do Chrome (`chrome://`), na Chrome Web Store e no leitor de PDF nativo.
- Textos acima de 5.000 caracteres são cortados na tradução.
- A tradução e o envio de imagens ao Lens usam endpoints do Google sem documentação oficial. Eles podem mudar sem aviso. A chamada de tradução fica isolada na função `translateChunk` em `background.js`, para ser fácil trocar de serviço.
- Imagens dentro de links podem navegar ao serem clicadas. Nesse caso, arraste a seleção sobre a imagem em vez de dar duplo clique.
- Braille e Morse usam o alfabeto latino: letras acentuadas são convertidas para a letra sem acento.

## Estrutura

```
decipher/
├── manifest.json     # configuração (Manifest V3)
├── background.js     # service worker: tradução, Lens e rede
├── content.js        # painel flutuante e leitura da seleção
├── langs.js          # lista de idiomas e códigos
├── codes.js          # codificação, decodificação e detecção
├── popup.html / .js  # configurações
├── lens.html / .js   # envio de imagens locais ao Lens
├── icons/
└── tests/            # testes de codes.js (Node) e e2e (Playwright)
```

## Desenvolvimento

```bash
# testes dos códigos e cifras
node tests/codes.test.js

# teste de ponta a ponta com a extensão carregada (Playwright)
npx playwright test
```

Para contribuir, abra uma _issue_ descrevendo o problema ou a ideia, ou envie um _pull request_ com testes.

## Licença

[MIT](LICENSE)
