# Karin Rost — Advocacia & Assessoria

**Register:** brand (landing page — o design *é* o produto)

## Quem

Karin Daiana Rost, advogada. OAB/RS 100.456. Escritório em Parobé, Rio Grande do Sul
(Rua José Theomar Lehnen, 756 — sala 2, Centro).

- WhatsApp: +55 (51) 99396-5299
- E-mail: karinrostadv@gmail.com
- Instagram: @karin_rost
- Site atual: karinrostadvocacia.com

## Posicionamento (verbatim das fontes oficiais)

> "Advocacia estratégica em Direito Previdenciário"
> "Atendimento humanizado"

Atuação concentrada em **Direito Previdenciário**, com trabalho também em
**Direito de Família e Sucessões**.

## Áreas confirmadas

Planejamento Previdenciário · Aposentadorias (todas as modalidades) ·
Benefícios por Incapacidade · BPC/LOAS · Pensão por Morte ·
Família e Sucessões

**Nada além disso foi inventado.** Não há dados verificáveis sobre anos de
carreira, número de clientes, taxa de êxito ou formação acadêmica — portanto a
página não afirma nenhum deles.

## Audiência

Pessoas físicas do Vale do Paranhana/RS e região que precisam de aposentadoria,
tiveram benefício negado pelo INSS, ou precisam de BPC/pensão por morte.
Geralmente 45+, pouco familiarizadas com juridiquês, chegando por indicação ou
Instagram. Decidem por confiança, não por preço.

## Objetivo da página

Uma conversa iniciada no WhatsApp. Tudo na página existe para tornar esse passo
óbvio e seguro.

## Restrições inegociáveis do cliente

1. **As fotografias não podem ser modificadas** — sem corte, sem mudança de
   proporção, sem filtro, sem `object-fit: cover`. O layout se adapta à imagem.
2. **O logo é usado exatamente como fornecido** — só o tamanho de exibição muda.
3. **Sem marquees**, carrosséis automáticos ou scroll infinito — **com duas
   exceções, ambas decididas pelo cliente**:

   a. **2026-09-19** — o marquee *vertical* da banda "A lei é a mesma para
      todos", que lista as seis áreas de atuação. Ele é lento (26s por volta),
      decorativo (`aria-hidden`, repete conteúdo que já está na seção de
      áreas) e para por completo sob `prefers-reduced-motion`.

   b. **2026-09-22** — a seção `.g3d`, galeria 3D de fotografias da advogada.
      A galeria **anda sozinha** e o loop de imagens é **infinito**. A decisão
      foi do cliente, tomada depois de ver uma versão sem autoplay e sem loop,
      que foi recusada: ele pediu o efeito idêntico ao componente de
      referência. O `prefers-reduced-motion` para o avanço.

      **A captura de rolagem saiu** no mesmo dia, também a pedido. O
      componente original dirigia a galeria pela roda do mouse e pelas setas,
      com `preventDefault` na roda — numa landing isso prendia a navegação
      dentro da seção. Agora o loop anda sozinho e ponto: a rolagem não altera
      a galeria, e a galeria não altera a rolagem.

   A regra continua valendo para todo o resto: nada correndo na horizontal,
   nenhum outro carrossel.
4. A navbar e o dock **não aparecem durante o hero**.
5. Removidos a pedido: "Atendimento presencial e online", "Contato direto com a
   advogada", "Análise antes de qualquer contrato".
6. A penúltima seção (CTA) **não exibe** telefone, Instagram ou endereço — esses
   canais vivem apenas no dock flutuante.

## Conformidade

Publicidade advocatícia no Brasil é regulada (Código de Ética da OAB e
Provimento nº 205/2021 do CFOAB). A copy é informativa: sem promessa de
resultado, sem "melhor advogada", sem valores, sem mercantilização.
