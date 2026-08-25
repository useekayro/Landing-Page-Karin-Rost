# Sistema visual — Karin Rost

## A cena

Uma sala à noite, luz baixa, uma pessoa de 58 anos relendo uma carta de
indeferimento do INSS pela terceira vez. A página precisa parecer o oposto
daquele papel: densa, calma, cara, conduzida por alguém que sabe o caminho.
Daí o fundo escuro — não é "advogado premium genérico", é o tom exato do
material que a cliente já tinha.

## Cor — estratégia *Committed*, extraída dos arquivos

Todas as cores foram **amostradas pixel a pixel** dos PNGs entregues, não
inventadas. Cada seção usa como fundo a cor da borda da própria foto que
carrega, para que a imagem dissolva na página sem precisar de corte ou máscara.

| Token | Hex | Origem |
|---|---|---|
| `--ardosia` | `#151D28` | cinza azulado opaco — campo escuro da página |
| `--ardosia-alto` | `oklch(.274 .021 252)` | superfície elevada derivada |
| `--azul` | `#19212C` | bordas de `foto 1 certo.png` (média das 8 amostras) |
| `--luz` | `#F2EFED` | campo claro das seções Sobre, Diferenciais e CTA |
| `--ouro` | `#D8A94E` | corpo do dourado em `logo.png` |
| `--ouro-claro` | `#FDD45C` | realce do logo (amostra 180,870) |
| `--ouro-fundo` | `#7C5A2A` | bronze, só sobre `--luz` |
| `--tinta-pilula` | `#1A1006` | a tinta que anda sobre o ouro |
| `--marfim` | `#F8F7F4` | campo do hero, amostrado da referência |
| `--noite` | `#0E0D2F` | faixa da marca no topo do hero |
| `--ouro-marca` | `#C8A068` | ouro do arquivo do logo, só no hero |
| `--azul-neblina` | `#6B7887` | título do hero |

O acento passou pelo rosa do blazer e voltou ao ouro; o cinza azulado ficou.
O ouro convive com o traçado de `emblema.png`, que é a maior massa dourada da
página — e com o logo, que nunca mudou de cor.

Contraste verificado: `--ouro` sobre `--ardosia` = **7,8:1** e `--ouro-claro`
= **9,7:1** · texto claro sobre `--ardosia` = 16:1 · `--ouro-fundo` sobre
`--luz` = 5,4:1 · tinta sobre `--luz` = 14:1.

Essa é a diferença prática entre as duas famílias: o rosa era escuro demais
para carregar letra miúda (4,1:1) e precisava de um tom claro só para texto,
com a pílula em branco sobre cor. O ouro é claro o bastante para as duas
funções, então a pílula voltou ao arranjo natural — **ouro com tinta quase
preta (8,7:1), clareando no hover** em vez de aprofundar.

## Ritmo de arte-direção

O escuro não é uniforme; a página respira em três atos.

```
HERO                          marfim       a apresentação da marca
MANIFESTO                     ardósia      autoridade, cinematográfico
EMBLEMA                       ardósia      a pausa: a marca e a frase
ÁREAS                         ardósia      o serviço
BANDA EDITORIAL               frio         a instituição
SOBRE ─ DIFERENCIAIS          luz          a pessoa
PROCESSO                      azul         o método
CTA                           luz          o convite
ONDE NOS ACHAR                ardósia      os três canais
RODAPÉ                        ardósia      assinatura
```

## Tipografia

- **Display: Bodoni Moda** (700–900). Didone de alto contraste — revista de
  moda encontrando gravidade jurídica. Feminina sem ser delicada; nos pesos
  altos as hastes ganham massa real ("robusta e chamativa").
- **Texto/UI: Archivo** (400–700, variável). Grotesca de largura firme.

Eixo de contraste: didone × grotesca. Nenhuma da lista de fontes-reflexo
(Playfair, Cormorant, Fraunces, Inter, DM Serif…).

Escala fluida `clamp()`, razão ≥1.25. Corpo em 65–72ch.

O título do hero é o **único fora da escala**: `clamp(2.25rem → 4.25rem)`
com inclinação de 3,7vw. Em 1440px fecha em **68px**, três linhas numa
coluna de 608px — a mesma quebra da referência (`Advocacia estratégica` /
`em Direito` / `Previdenciário.`). O teto de 4,25rem não é gosto: em 5rem
a frase media 346px de altura e a soma faixa + texto + figura estourava a
dobra de 900px.

Peso **400**, não 700. Na referência o título é um didone leve; o contraste
do próprio Bodoni já dá presença, e engrossar transformaria a frase em bloco
e brigaria com a figura ao lado.

## Imagens — a regra que governa o layout

Nenhuma foto da cliente é cortada, mascarada, filtrada ou forçada a uma
proporção. Todas: `width:100%; height:auto` com `width`/`height` intrínsecos
(1672×941) para reservar espaço e zerar layout shift.

O hero deixou de ter foto de fundo: a arte da primeira dobra agora é um
**recorte com canal alfa**, que pousa direto no campo marfim. Sem retângulo,
sem máscara, sem `object-fit` — a proporção é a do arquivo, como em toda foto
da página. Nenhuma das outras fotos mudou.

| Arquivo | Seção | Composição |
|---|---|---|
| `hero-karin.webp` | Hero | recorte com alfa, encostado na base da dobra |
| `logo-hero.webp` | Hero | lockup da marca na faixa noite, centrado |
| `emblema.png` | Emblema | largura total; texto nas três faixas escuras |
| `justica-direito.png` | Banda editorial | largura total; a placa flutua sobre ela |
| `karin-escritorio.png` | Sobre | sangria total; texto sobre a foto |
| `karin-azul.png` | Processo | sangria total; texto sobre a foto |
| `karin-conversa.png` | CTA | sangria total; a chamada já vem gravada no arquivo |

Uma única imagem foi **editada**, e por coerência de paleta: o ponto de
interrogação de `karin-conversa.png` era magenta `#EC004F`, resto do tempo em
que o acento da página era rosa. Recolorido para ouro `#A87E24` pixel a pixel
com a fórmula `saída = pixel + α·(ouro − rosa)`, onde α é estimado pelo canal
verde contra o fundo local de cada linha — assim o antialiasing das bordas foi
preservado e o fundo por baixo do traço não mudou um valor sequer. Restaram
**zero** pixels magenta na imagem inteira.

### As três cenas: texto dentro da fotografia

As fotos da Karin ocupam a largura inteira da seção. O texto não fica ao lado
— fica **dentro da foto**, numa zona de silêncio medida pixel a pixel em cada
imagem, varrendo a luminância célula a célula e calculando o pior caso.

| Cena | Zona | Tinta | Pior contraste da zona |
|---|---|---|---|
| escritório | x 50–100%, y 20–90% | escura | 5,9:1 |
| azul | x 0–50%, y 2–62% | clara | 6,3:1 |
| emblema (esq.) | x 0–29%, y 5–84% | clara 8,2 / média 4,5 |
| emblema (dir.) | x 73–100%, y 5–84% | média | 6,4:1 |
| emblema (meio) | x 26–74%, y 86–97% | clara | 12,9:1 |

Fora dessas janelas o contraste desaba: na foto azul o bloco pêssego do canto
inferior leva texto claro a 0,9:1, e na do escritório o vaso escuro da
prateleira derruba texto escuro a 0,9:1. Por isso os percentuais são
diferentes em cada cena, e não um layout genérico repetido três vezes.

A **CTA saiu dessa lista**: `karin-conversa.png` já traz "Vamos conversar?"
gravado no arquivo, então a seção não sobrepõe texto nenhum — a foto sangra e
o botão vem centrado no campo claro logo abaixo. Repetir a pergunta em HTML
seria dizer a mesma coisa duas vezes na mesma dobra.

Verificado depois de construído, sobre os **pixels realmente renderizados**
(a foto é desenhada num canvas na escala de exibição e amostrada sob cada
trecho de texto): 8 trechos, pior caso **5,02:1**. Foi assim que apareceu o
lead do Processo em 3,89:1 — a estimativa pela grade não pegou, a medição
sobre o pixel pegou.

Refeita a medição com as fotos novas, no mesmo método: Processo com
`karin-azul.png` dá **6,21:1** no título e **6,41:1** no lead; os três blocos
do emblema ficam entre **5,4:1** e **12,9:1**. As zonas de silêncio continuam
valendo.

O hero saiu dessa conta por completo: não há mais fotografia por baixo do
texto dele. A tipografia pousa em campo chapado, e o contraste vira aritmética
simples de duas cores — sem varredura de pixel, sem zona de silêncio.

**Nenhuma dessas fotos tem parallax.** O texto é posicionado em percentuais da
seção; se a foto deslizasse por baixo, as zonas seguras deixariam de coincidir
com ela.

Abaixo de **75rem** a sobreposição apertaria o texto contra a Karin: a foto
continua sangrando de ponta a ponta e o texto desce para logo abaixo dela. Em
1200px — o caso mais apertado do modo sobreposto — a cena Sobre fecha com 41px
de folga. Foi por isso que a lista de metadados saiu daquela seção: além de não
caber, ela repetia OAB e cidade que já estão no hero e no rodapé.

## Navbar: chamada, não permanente

A barra não mora na página. Fica recolhida acima do topo e **desce quando o
ponteiro entra na faixa dos 72px superiores**, subindo de novo quando ele
passa dos 92px — a folga de 20px é histerese, senão a barra piscaria na
fronteira. Enquanto ela está recolhida, a única pista é a **alça**: 3px de
ouro no eixo central do topo, que somem assim que a barra desce.

Três cuidados que a regra "só no hover" não resolve sozinha:

- **Teclado.** O estado recolhido não usa `visibility: hidden` — a barra
  continua focável, e um `focusin` a chama. Quem navega por Tab não tem
  ponteiro para passar por cima.
- **Clique.** O gatilho é o `mousemove` lido no documento, não uma faixa
  invisível de 72px cobrindo o topo: uma faixa que captura ponteiro tornaria
  inclicável tudo que passasse por baixo dela.
- **Toque.** Sem `(hover: hover) and (pointer: fine)` não existe hover para
  chamar nada. Aí vale a regra antiga — a barra entra sozinha depois que o
  hero termina — e a alça nem é desenhada.

Ela também não sobe com o menu mobile aberto (é ela que carrega o X) nem com
o foco dentro dela.

## Navbar: dois temas, não um

A barra é translúcida com blur, mas cruza fundos muito diferentes. Com véu
baixo sobre `--luz`, o texto claro caía para **1,2:1** — ilegível. Em vez de
engrossar a barra até virar caixa sólida, ela **troca de tema**: sobre as
seções claras vira vidro claro com tinta escura (link 5,9:1, ativo 13,6:1).

O tema segue a seção que contém a **linha média** da barra, recalculada por
rAF no scroll. Testar mera interseção falhava no fim da página, onde a seção
clara encosta 9px na faixa enquanto o rodapé escuro ocupa os outros 67.

Com o menu mobile aberto a barra volta ao tema escuro (`.is-menu`) e sobe
acima do painel — é ela que carrega o botão de fechar.

## Movimento

Primitivas em `03-motion.css` + `reveal.js`:

- **reveal** — fade + 14px de subida, `cubic-bezier(.16,1,.3,1)`, 620ms, stagger
  de 70ms. O conteúdo é visível por padrão; a animação só *melhora* o estado
  inicial (nunca esconde conteúdo atrás de uma classe).
- **marca-texto e sublinhado** — SVG colorido em `background-image` (não em
  máscara nem pseudo-elemento absoluto), com `box-decoration-break: clone`.
  Assim uma frase que quebra em três linhas ganha **três traços**, um por
  fragmento, em vez de um retângulo cobrindo o parágrafo. A varredura anima
  `background-size` de `0%` a `100%`.

  Duas armadilhas resolvidas na medição, não no chute:
  - O `viewBox` do traço foi apertado no contorno (`0 8 300 19`): com a caixa
    folgada original, a tinta ficava no miolo da faixa e o marcador lia como
    **tachado**.
  - A faixa vai de `0.40em` a `1.02em` a partir do topo da caixa de fundo.
    Para um elemento inline essa caixa começa em (linha-de-base − ascendente
    ≈ 0.93em) e a altura-x fica ~0.46em abaixo — então esse intervalo cobre o
    corpo das letras e morre logo após a base. Independe da entrelinha, que
    varia de 1.02 a 1.78 entre título e prosa.
- **parallax** — `data-parallax` + rAF com `scrollY` cacheado, só `translate3d`.
- **navbar** — entra por `opacity + translateY` quando o ponteiro toca a faixa
  do topo (ou, no toque, depois que o hero sai do viewport, por
  IntersectionObserver em sentinela). Marca, links e CTA entram escalonados
  atrás dela, então cada chamada da barra é uma pequena entrada, não um
  liga-desliga.

`prefers-reduced-motion: reduce` desliga parallax e transforma todo reveal em
crossfade de 1ms. Nada fica invisível.

## Painel de explicação das áreas

O `LinkPreview` do briefing abria o preview de uma imagem; aqui abre a
explicação do serviço. Mantidos o atraso curto e o deslocamento amortecido
(metade da distância ao centro).

Lado de abertura e posição de repouso são recalculados **continuamente para
todos os cards**, não no evento de abertura. Amarrar ao `focus` era frágil:
focar por teclado faz o navegador rolar o card para dentro da tela, e a
medida saía com a posição anterior à rolagem.

No toque (`hover: none`) o painel vira texto corrido sempre visível.

## A placa da banda editorial

É o único elemento da página que flutua de verdade: sobe 6% por cima da
fotografia. Agora tem **espessura** — sombra em seis camadas (fio de luz no
topo por dentro, sombra interna na base, contato curta, corpo, difusa longa e
um halo dourado quase imperceptível) e canto de 16px. Nada disso é borda
desenhada: a aresta aparece porque a luz e a sombra a descrevem.

Em volta dela, **quatro setas curvas** apontando para dentro, uma em cada
canto. São o mesmo traçado repetido, girado e espelhado por CSS, e a ponta
não é um triângulo colado no fim da linha — os dois farpões saem da tangente
da curva no ponto final (±28°), que é o que faz a seta parecer desenhada à
mão em vez de montada. Elas se desenham por `stroke-dashoffset` quando a
seção entra, em cascata de 80ms, e somem abaixo de 75rem, onde a placa toma a
largura toda e não sobraria margem para elas.

## Forma

Botões e etiquetas em pílula (`--pilula: 999px`); cards em `--raio: 16px`;
painéis em `--raio-sm: 10px`. Um efeito colateral do arredondamento: o traço
dourado dos diferenciais vivia na borda superior do card e escapava pelos
cantos curvos — foi movido para baixo do título, onde continua se desenhando
no hover e agora tem função tipográfica, não só decorativa.

## O hero, reconstruído sobre a referência

A primeira dobra foi refeita conforme a referência entregue pelo cliente e é
hoje a **única seção clara antes do manifesto** — paleta própria, amostrada do
arquivo da referência:

| Peça | Hex | Origem |
|---|---|---|
| campo | `#F8F7F4` | fundo da referência |
| faixa da marca | `#0E0D2F` | cabeçalho da referência |
| ouro da marca | `#C8A068` | tom dominante dos 7.916 pixels de traço do logo |
| título | `#6B7887` | o `#809098` da referência, um degrau mais fundo |

Duas correções de contraste em cima da referência, medidas sobre a cor
realmente pintada:

- O título da referência (`#809098`) dá **2,9:1** sobre o marfim e reprova
  até no critério de texto grande. Um degrau mais fundo mantém o azul-neblina
  e sobe para **4,2:1**.
- O botão da referência é branco sobre o ouro — **2,4:1**. Aqui ele leva a
  mesma tinta quase preta das outras pílulas da página: **7,75:1**. Pela mesma
  razão a versalete do kicker usa o bronze `--ouro-fundo` (5,85:1) e não o ouro
  do logo, que sobre marfim daria 2,1:1.

O lead fecha em 7,58:1 e o botão de contorno em 17,4:1.

### Estrutura

```
faixa noite      logo centrado (104px) · linha da marca à direita
campo marfim     kicker · título · lead · dois CTAs   |   recorte da Karin
```

A faixa é grade de três colunas — `1fr auto 1fr` — e não flex centrado: assim
a linha da direita (`Aposentadoria não se improvisa`, atalho para o Processo)
entra sem empurrar a marca para fora do eixo óptico. Abaixo de 48rem as duas
peças empilham centradas. A linha fecha em 10,2:1 sobre a noite.

O recorte é retrato **375×550**. O teto de 26rem na coluna não é estética: a
figura cresce em altura 1,47x mais rápido que em largura, e acima disso ela
passa da altura do campo e empurra o hero para fora da dobra. Em 1440 ele
fica em 416×610 (1,11x de ampliação); em 375, 320×469, ainda reduzindo.

A faixa é `flex` e o campo é `flex: 1` com `align-items: flex-end`: o conteúdo
encosta na base da dobra, que é o que faz a figura sangrar no rodapé da seção
em vez de flutuar no meio do campo. O texto sobe da base pelo próprio
`padding-bottom`, então só a figura toca a borda.

Em 1440×900 o hero fecha em **900px exatos** — faixa de 125px e campo de 775.
Em 1024×768, 768. Abaixo de 60rem a grade vira uma coluna: texto e depois
figura, com os dois CTAs ainda acima da dobra em 375×812.

O credencial (Parobé/RS, OAB) e a lista de áreas seguem fora daqui, na
**ficha** que abre o manifesto — onde funcionam como ficha técnica antes da
declaração.

### A navbar sobre o campo claro

`.hero__campo` entrou na lista de seções claras do `chrome.js`. O recorte é
proposital: a barra só inverte para o tema claro quando o **campo** cruza a
linha média dela. Parada no topo, quem está sob a barra é a faixa noite, e o
tema escuro é o certo.

## A pausa do emblema

Entre o manifesto e as áreas entra uma faixa de largura total com o emblema
do escritório, com texto nas **três janelas escuras** do arquivo. Varri o PNG
em células de 38×43px: as colunas 0–29% e 73–100% estão livres em toda a
altura, e a tira y 86–100% cruza a imagem inteira por baixo do círculo.
Nenhum dos três blocos encosta no traçado dourado — é o desenho que manda no
layout, não o contrário.

```
esquerda   Aposentadoria não se improvisa. + régua + 2 parágrafos
direita    a glosa do emblema, em 3 parágrafos: o que a balança só faz
           depois da leitura, por que nada disso vem pronto no extrato,
           e por que a leitura vem antes do requerimento
meio       assinatura do escritório e a inscrição na OAB
```

O corpo desses blocos é `--t-0` (18px), um degrau acima do texto padrão da
página: 14px **dentro de uma fotografia** lê como legenda, não como
argumento. O título da esquerda subiu junto, para 42px. Com mais texto, as
colunas laterais passaram a ocupar de 5% a 84% da altura — o que só é
possível porque a varredura não achou um pixel de ouro fora da faixa
29–73%. O limite real é a tira de baixo, onde mora a assinatura.

Empilhado (abaixo de 75rem) os três viram uma coluna só, nessa ordem. Entre
75 e 82rem a coluna lateral fica com 290px e a linha de apoio da esquerda
some — antes de virar uma torre de duas palavras por linha.

## Processo: grafismo, não vazio

A seção era uma coluna de quatro itens num campo azul grande demais — e mesmo
depois de virar 2×2 continuava vazia: quatro títulos com **uma linha cada** de
explicação, num campo que pedia o dobro de texto. O conteúdo foi reescrito.

Primeiro a **abertura dentro da foto**, que era só título e uma linha. Ganhou
dois parágrafos: um dizendo que nenhuma etapa exige que o cliente entenda de
lei (exige que conte o que viveu e traga o que guardou — carteira, carnê,
receita antiga, carta do INSS), outro dizendo o que acontece quando o caminho
muda no meio. Os quatro blocos ocupam agora de 2% a 62% da altura da foto, e
todos ficam **acima de 5,4:1** medidos sobre o pixel real — inclusive com a
opacidade de 0,92 que o corpo usa para recuar meio passo atrás do lead.

Depois os cards:

- uma **abertura** em didone de 32px antes dos cards, que explica a regra do
  método (nenhuma etapa começa antes de a anterior estar entendida, e por que
  não existe protocolo às pressas "para garantir a data")
- cada etapa passou de ~15 para **41–50 palavras**, dizendo o que acontece ali
  e o que *não* acontece
- cada etapa ganhou uma **nota** — o detalhe prático que o corpo não comporta
  (o que trazer, de onde sai a lista de documentos, quando esperar vale mais
  que entrar hoje, o que vira aviso). Ela fica um degrau abaixo na hierarquia,
  atrás de um filete dourado de 2px, para não competir com o corpo

Com isso a seção passou de ~700px para 1.153px de altura em 1440 — deixou de
ser um campo azul com legendas soltas. O resto da estrutura ficou:

- quatro **cards 2×2** (fixo, não `auto-fit` — com auto-fit as quatro etapas
  abriam 3+1 e sobrava um órfão), fundo azul translúcido, borda dourada
- **números-eco** de 7rem no canto de cada card, puro peso tipográfico, que
  clareiam e deslizam no hover. O badge numerado pequeno foi retirado: com o
  número grande no canto, dois numeradores no mesmo card competiam
- **grade de pontos** dourados com máscara radial, sumindo nas bordas
- **arco duplo** com parallax negativo saindo pela direita
- uma frase de fecho com sublinhado desenhado

## Onde nos achar

Os três canais já existiam, mas soltos no rodapé, em 14px, ao lado do texto
legal — quem chegava ao fim da página tinha que caçar. Agora têm seção própria
entre a CTA e o rodapé, em forma de **pauta**: nenhuma caixa, nenhuma sombra,
nenhum ícone. Canal à esquerda no didone, dado à direita, filete entre as
linhas, seta discreta no fim.

```
WhatsApp    (51) 99396-5299                                        →
Instagram   @karin_rost                                            →
No mapa     Rua José Theomar Lehnen, 756 — Sala 2 · Centro · Parobé/RS  →
```

A primeira versão eram três cartões com ícone, borda e elevação — o mesmo
peso visual dos seis cards de área, para três linhas de informação. Trocados
pela pauta, a seção caiu de 830px para **655px** e parou de disputar atenção
com o que vem antes. O que sobrou de gesto: no hover a linha recua 12px para
a direita, o rótulo vira ouro e a seta desliza. O endereço continua por
extenso — ninguém deveria precisar abrir o Google Maps para descobrir em que
cidade fica o escritório. Abaixo de 40rem as duas colunas viram duas linhas,
ainda sem caixa.

### A prévia que segue o ponteiro

Cada linha abre um **painel com o desenho do destino**: a conversa, o perfil
com sua grade, o mapa com o alfinete. É aqui que o `LinkPreview` do briefing
finalmente aparece com imagem — nas áreas ele virou texto porque não havia
imagem honesta a mostrar.

São **esquemas desenhados em SVG, não capturas de tela**: mostram a *forma* do
lugar para onde o clique leva, sem inventar mensagem, número de seguidores ou
avaliação que não existem. As linhas de texto dos balões são traços, não frases
falsas. Tudo pintado com os tokens da página, então a prévia envelhece junto
com a paleta em vez de virar uma imagem congelada.

O movimento é o ponto: o painel **não salta** para o cursor. A cada quadro ele
anda 17% do caminho que falta, o que dá o atraso macio, e a troca entre duas
linhas vira um deslize em vez de um corte. A inclinação (até 6°) sai da
distância residual até o alvo — quanto mais rápido o cursor, mais torto ele
viaja; parado, ele se endireita sozinho.

Três detalhes que só aparecem quando se testa:

- **Duas camadas de transform.** O rAF escreve no container externo; a escala e
  a opacidade de entrada vivem na caixa interna, com transição de CSS. Se as
  duas mexessem na mesma propriedade, a transição brigaria com o quadro e o
  painel andaria aos trancos.
- **Abrir antes de mirar.** Enquanto nenhuma prévia está escolhida, o painel
  tem altura de padding; mirar primeiro faria o cálculo anti-vazamento usar a
  altura errada e o painel sairia pelo pé da janela.
- **A primeira posição é escrita na hora**, sem esperar quadro. Com rAF
  estrangulado (aba de fundo, renderizador sem composição), ele ainda abre no
  lugar certo em vez de no canto superior esquerdo.

Perto da borda direita o painel troca de lado; perto do topo e do pé, encosta
com 14px de folga. No teclado, sem ponteiro para seguir, ele encosta na lateral
direita da própria linha e fica parado. No toque não existe hover para disparar
prévia nenhuma — o painel é **removido do documento**, não escondido.

## Sem dock

A barra flutuante de contato foi removida. Ela era o único lugar da página com
Instagram e Google Maps — esses canais desceram para o rodapé, junto do
WhatsApp, e o endereço virou link para o mapa. A CTA continua sem expor
telefone, Instagram ou endereço, como pedido.

## Peso

Código: **~100 KB** de HTML+CSS+JS, zero dependências, zero build. As prévias
dos canais são SVG inline — não somam um único pedido de rede.

Imagens: 11,8 MB no total (sete arquivos), 2,9 MB na primeira dobra. É o
gargalo, e vem da regra de não modificar os arquivos. Só o hero e o logo
carregam de imediato; as outras cinco são `loading="lazy"`. Reencodar
mantendo as mesmas dimensões levaria as fotos a ~1 MB (−90%) sem corte nem
reenquadramento — decisão do cliente, não aplicada.

## Banidos neste projeto

Marquee · carrossel automático · `object-fit: cover` em foto da cliente ·
gradient text · glassmorphism decorativo · borda lateral colorida ·
kicker minúsculo em caixa alta acima de toda seção · grid de cards idênticos ·
sombra pesada.
