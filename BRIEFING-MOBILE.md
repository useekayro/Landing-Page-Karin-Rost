# Briefing — versão mobile da landing page da Karin Rost

> Cole este arquivo (ou o conteúdo dele) no Claude Code, dentro da pasta
> `C:\lp karin rost certo`. Ele já contém o levantamento do código, o
> mapeamento das fotos novas e as armadilhas do projeto.

---

## 0. Leia isto antes de qualquer coisa

O `PRODUCT.md` deste projeto registra uma **restrição inegociável do cliente**:

> **1. As fotografias não podem ser modificadas** — sem corte, sem mudança de
> proporção, sem filtro, sem `object-fit: cover`. O layout se adapta à imagem.

O CSS inteiro foi construído em cima disso. O cabeçalho de
`assets/css/05-sections.css` abre assim:

> *"Nenhuma foto usa `object-fit: cover`. Nenhuma tem máscara, filtro ou
> proporção forçada."*

**Como isso se aplica a esta tarefa:**

- ✅ **Permitido:** usar os arquivos verticais que a própria cliente forneceu.
  Trocar a foto horizontal pela vertical *é* o layout se adaptando à imagem —
  exatamente o que a regra manda.
- ✅ **Permitido:** gerar versões em resolução menor do mesmo arquivo
  (940px, 640px). Reduzir resolução não é corte, não é mudança de proporção e
  não é filtro. É o que qualquer `srcset` faz.
- ❌ **Proibido:** recortar, esticar, mudar proporção, aplicar filtro ou
  `object-fit: cover` em qualquer foto da Karin.
- ⚠️ **Pergunte antes:** converter PNG → WebP com perda. Ver seção 7.

Se em algum momento a solução exigir cortar uma foto, **pare e pergunte** em
vez de decidir sozinho. É regra de cliente, não preferência técnica.

---

## 1. Contexto

**Site estático puro: HTML + CSS + JS. Sem build, sem npm, sem framework.**

- `index.html` — 644 linhas, a página inteira
- `assets/css/` — 5 arquivos; o que importa aqui é `05-sections.css` (~1.000 linhas)
- `assets/js/` — `parallax.js`, `reveal.js`, `chrome.js`, `areas.js`, `canais.js`

Para ver o resultado, sirva a pasta (`npx serve .`) em vez de abrir por `file://`.

Comentários em português explicando o porquê de cada decisão, muitos com
medições feitas em cima dos pixels reais das fotos. **Mantenha esse padrão** —
e quando mudar um valor que veio de medição, remeça e atualize o comentário.

### A boa notícia (leia, poupa trabalho)

Diferente de outros projetos parecidos, **aqui não existe `aspect-ratio` para
trocar.** A regra que governa as fotos é:

```css
.cena__foto img { width: 100%; }   /* sem height, sem object-fit */
.banda__art img { width: 100%; }
```

Sem altura e sem `object-fit`, a imagem renderiza na **proporção natural dela**
e a caixa acompanha. Ou seja: **trocar o arquivo pelo `<picture>` já resolve o
layout sozinho.** Não mexa em `aspect-ratio` — não há nenhum a mexer nessas
seções.

---

## 2. Mapeamento das 6 fotos novas

Identifiquei cada uma abrindo o arquivo. Todas em 941×1672. Conferido:

| Arquivo novo (`assets/img/`) | Substitui | Seção | O que é |
|---|---|---|---|
| `karin foto 6 9,16.png` | `hero-colunas.png` | `.hero` (#hero) | Colunas do tribunal vistas de baixo, céu noturno |
| `karin foto 4 9,16.png` | `emblema.png` | `.cena--emblema` | Emblema da Dama da Justiça em linha dourada |
| `karin foto 7 9,16.png` | `justica-direito.png` | `.banda` | Estátua de mármore com balança dourada |
| `karin foto 3 9,16.png` | `karin-escritorio.png` | `.cena--sobre` (#sobre) | Karin de blazer rosa, à mesa do escritório |
| `karin foto 1 9,16.png` | `karin-azul.png` | `.cena--proc` (#processo) | Karin de blazer claro, braços cruzados, fundo azul |
| `karin foto 2 9,16.png` | `karin-conversa.png` | `.cena--cta` (#contato) | "Vamos conversar?", Karin sorrindo |

Os mesmos seis arquivos também estão soltos na raiz do projeto. O `.gitignore`
já ignora PNG na raiz (`/*.png`), então **use sempre os de `assets/img/`.**

---

## 3. ⚠ A armadilha real deste projeto: o breakpoint do hero

Existe **exatamente um** `object-fit: cover` no projeto inteiro, e é no hero
(`05-sections.css`, linha 29):

```css
.hero__art img { width: 100%; height: 100%; object-fit: cover; object-position: 88% center; }
```

O comentário acima dele explica que a exceção foi deliberada e medida — as
bordas de `hero-colunas.png` não são cor chapada, então `contain` deixava duas
faixas visíveis. E fecha com: *"As fotos da Karin seguem intocadas."*

Esse `cover` só é desligado dentro de **`@media (max-width: 60rem)`**
(linha 948), que troca para `height: auto; object-fit: fill`.

**A consequência:** se o `<source media>` da arte vertical casar em qualquer
largura **acima de 60rem**, o hero vai aplicar `cover` numa foto vertical e
cortá-la — violando a regra nº 1 do cliente.

**Portanto:**

- ❌ **Não use `(max-aspect-ratio: ...)`.** Uma janela retrato de 1120px de
  largura casaria a query e cairia justamente na faixa perigosa (>60rem).
- ✅ **Use `(max-width: 60rem)`** — o mesmo ponto onde o hero já abandona o
  `cover`. Alinhado por construção, impossível de dessincronizar.
- ✅ `(max-width: 48rem)` também é seguro, se 60rem parecer largo demais. Entre
  48 e 60rem a página simplesmente continua com a arte horizontal de hoje.

Escolha **um** valor e use **o mesmo** em todos os `<source>`. Deixe registrado:

```css
/* PONTO DE VIRADA MOBILE: max-width: 60rem
   Casado de propósito com o bloco da linha 948, onde .hero__art img deixa
   de usar object-fit: cover. Passar disso corta foto vertical. */
```

---

## 4. Passo 1 — gerar as versões reduzidas

Convenção nova (hoje o projeto não tem nenhuma): `{nome}-m-{largura}`.

Como não há `package.json`, crie um mínimo só para a ferramenta
(o `.gitignore` já ignora `node_modules/`):

```bash
npm init -y
npm i -D sharp
```

`tools/gerar-mobile.mjs`:

```js
// Gera as versões reduzidas das fotos verticais que a cliente forneceu.
// Só redimensiona: nada de corte, proporção forçada ou filtro (PRODUCT.md,
// restrição nº 1). A proporção 941:1672 é preservada em todas as saídas.
import sharp from 'sharp'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = dirname(dirname(fileURLToPath(import.meta.url)))
const img = join(raiz, 'assets', 'img')

const MAPA = [
  ['karin foto 6 9,16.png', 'hero-colunas'],
  ['karin foto 4 9,16.png', 'emblema'],
  ['karin foto 7 9,16.png', 'justica-direito'],
  ['karin foto 3 9,16.png', 'karin-escritorio'],
  ['karin foto 1 9,16.png', 'karin-azul'],
  ['karin foto 2 9,16.png', 'karin-conversa'],
]

// 941 é a largura nativa. Upscale não acrescenta detalhe nenhum.
const LARGURAS = [640, 940]

for (const [arquivo, nome] of MAPA) {
  for (const largura of LARGURAS) {
    const base = sharp(join(img, arquivo)).resize({ width: largura })
    await base.clone().png({ compressionLevel: 9 }).toFile(join(img, `${nome}-m-${largura}.png`))
    console.log(`${nome}-m-${largura}.png`)
  }
}
```

Os nomes de origem têm espaço e vírgula. Passe sempre por variável, como acima,
nunca montando string de shell.

---

## 5. Passo 2 — `<picture>` no `index.html`

Hoje **não existe um único `<picture>` no projeto** — são todos `<img>` diretos.
Você vai introduzir o primeiro. Envolva o `<img>` existente e deixe todos os
atributos dele onde estão (`alt`, `width`, `height`, `loading`, `decoding`,
`fetchpriority`): eles valem para a fonte que o navegador escolher.

```html
<figure class="cena__foto">
  <picture>
    <source media="(max-width: 60rem)"
            srcset="assets/img/karin-escritorio-m-640.png 640w,
                    assets/img/karin-escritorio-m-940.png 940w"
            sizes="100vw">
    <img src="assets/img/karin-escritorio.png"
         alt="Karin Rost, de blazer rosa, apoiada sobre a mesa do escritório em Parobé."
         width="1672" height="941" loading="lazy" decoding="async">
  </picture>
</figure>
```

O `width`/`height` do `<img>` descreve só a variante desktop. Como a caixa é
governada pela imagem real (não há `aspect-ratio` no CSS), ele serve apenas de
dica de proporção antes do carregamento. Deixe um comentário dizendo isso.

**Linhas a mexer:** 111 (hero), 171 (emblema), 291 (banda), 332 (sobre),
383 (processo), 485 (contato).

Atenção: o `<img>` do hero está dentro de `<div class="hero__art">`, não de
`<figure>`. O `<picture>` entra entre a div e o img, sem mudar a div.

---

## 6. Passo 3 — recalibrar as cores que dissolvem a foto

Esta é a parte que passa despercebida e estraga o acabamento.

O cabeçalho do `05-sections.css` explica o sistema:

> *"Onde a borda da foto é uma cor chapada (hero, processo) o fundo da seção é
> aquele hex exato e a imagem dissolve."*

E o token confirma: `--azul: #19212C; /* bordas de karin-azul.png (média das 8) */`.

Ou seja, **os hexes de fundo foram derivados das fotos horizontais.** As
verticais têm bordas diferentes, então a foto vai deixar de dissolver e passar
a mostrar uma aresta.

Medi as bordas dos seis arquivos novos. Use como ponto de partida — são médias
de uma linha de pixels, então **confirme na tela antes de fixar**:

| Arquivo novo | topo | base | esquerda | direita |
|---|---|---|---|---|
| `karin foto 1` (karin-azul) | `#202833` | `#292625` | `#18202B` | `#45474C` |
| `karin foto 2` (karin-conversa) | `#E2D3CA` | `#D0B4A5` | `#D3C5BF` | `#DACCC5` |
| `karin foto 3` (karin-escritorio) | `#D1C4BA` | `#DCCFC8` | `#CEC4BD` | `#E5E1E0` |
| `karin foto 4` (emblema) | `#0F1825` | `#09111C` | `#0E1623` | `#09111D` |
| `karin foto 6` (hero-colunas) | `#13233A` | `#030F20` | `#061225` | `#0A172B` |
| `karin foto 7` (justica-direito) | `#070605` | `#010100` | `#060504` | `#020101` |

No mobile a foto ocupa 100% da largura, então **só as bordas de topo e base
encostam no fundo da seção** — são essas que importam.

Caso mais crítico: `karin foto 1` (seção `.cena--proc`). O token `--azul` é
`#19212C` e a base do arquivo vertical é `#292625` — mais quente e mais clara.
Vai aparecer uma emenda. Trate com um override só no mobile:

```css
@media (max-width: 60rem) {
  /* Bordas remedidas na versão vertical: a base do arquivo é mais quente
     que a do 16:9, e o hex antigo deixava uma emenda visível. */
  .cena--proc { background: #292625; }
}
```

**Não altere os tokens em `01-tokens.css`** — eles valem para o desktop, que
continua com as fotos horizontais. Todo override entra no bloco mobile novo.

---

## 7. Peso das imagens — vale conversar com a cliente

As seis fotos são **PNG entre 1,7 MB e 2,4 MB cada — cerca de 11 MB no total**,
e o projeto não usa `<picture>` nem WebP em lugar nenhum.

O público desta página (`PRODUCT.md`) é "pessoas do Vale do Paranhana, 45+,
chegando por indicação ou Instagram" — ou seja, **quase tudo celular, muitas
vezes em rede fraca.** 11 MB de PNG é o problema de performance mais sério do
site, maior que qualquer questão de enquadramento.

WebP resolveria com folga (costuma cair 80-90% em fotografia). **Mas converter
é mexer na compressão da imagem, e a restrição nº 1 do cliente é literal sobre
não modificar as fotos.** Não decida sozinho. Leve as duas opções:

- **Conservadora:** WebP *lossless*. Pixel por pixel idêntico ao PNG, sem
  discussão possível. Ganho menor em foto, mas real.
- **Recomendada tecnicamente:** WebP com `quality: 90`. Visualmente
  indistinguível, ganho muito maior.

Enquanto não houver resposta, **gere PNG** (é o que o script da seção 4 faz) e
registre a pendência. Não converta por conta própria.

---

## 8. O que **não** mexer

- **O layout de desktop.** Todo o trabalho entra no bloco `@media` novo.
- **Os três blocos de texto sobre o emblema** (`.emb__bloco--esq/--dir/--meio`,
  linhas 505-529). Eles são posicionados por porcentagem medida nos pixels do
  PNG horizontal — **mas estão dentro de `@media (min-width: 75rem)`,
  ou seja, só valem no desktop.** No mobile o texto já cai empilhado abaixo da
  foto. Não são afetados por esta tarefa e não devem ser tocados.
- `assets/js/*.js` — nenhum script mede imagem.
- Os tokens de `01-tokens.css` (ver seção 6).
- Os blocos `@media (prefers-reduced-motion: reduce)`.

Um ponto a **verificar**, não a mudar: `hero__art` tem `data-parallax="0.06"` e
no mobile vira `position: static`. Confira se o `parallax.js` não produz um
deslocamento estranho com a foto vertical, que é bem mais alta.

---

## 9. Como testar

1. `npx serve .` e DevTools em modo dispositivo: iPhone 14 Pro, Pixel 8 e um
   tablet em pé.
2. **Network:** no celular só baixa `-m-`, no desktop só os originais. Se
   baixar os dois, a ordem dos `<source>` está errada.
3. **Redimensione devagar cruzando 60rem (960px).** É o teste mais importante:
   logo acima de 60rem a foto tem que ser a horizontal. Se aparecer foto
   vertical cortada, o breakpoint está errado — veja a seção 3.
4. Procure emenda visível entre a borda da foto e o fundo da seção (seção 6).
   Olhe seção por seção, no claro e no escuro.
5. Confira que nenhuma foto da Karin aparece cortada em nenhuma largura. Se
   aparecer, é violação da regra do cliente, não é ajuste fino.
6. Role a página inteira: navbar, dock, os pop-ups de canais e a seção de áreas
   continuam funcionando.

---

## 10. Publicação — atenção, aqui é diferente

**Este projeto ainda não tem repositório Git.** Não existe pasta `.git`, ao
contrário dos outros dois. Ou seja:

- Não há histórico: se algo quebrar, **não dá para voltar atrás.**
  Faça `git init` e um commit do estado atual **antes de começar a editar.**
- O `.gitignore` já existe e já está bem feito: ignora `.claude/`, `.vscode/`,
  os PNG soltos da raiz (`/*.png`), `node_modules/` e `.vercel`.
- Depois: criar o repositório no GitHub e ligar ao Vercel pela primeira vez
  (os outros projetos já estavam ligados; este não).
- Como não há build, o Vercel serve os arquivos como estão — **não existe etapa
  de compilação para pegar erro antes.** O que subir é o que o visitante vê.

Deixei em `_to_delete/` as miniaturas que gerei para identificar as fotos.
Pode apagar.
