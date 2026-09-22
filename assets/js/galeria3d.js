/* ════════════════════════════════════════════════════════════════
   GALERIA 3D — port fiel de InfiniteGallery (3d-gallery-photography)

   O componente de referência é React + @react-three/fiber + drei,
   mas o efeito em si é three.js puro: R3F só fornece o laço de
   render e o grafo de cena. Este arquivo faz esse papel em ~340
   linhas, sem React, sem bundler, sem TypeScript — o site é estático
   e não tem build.

   O QUE FOI MANTIDO IDÊNTICO ao original:
     • os dois shaders (cloth ripple, flag wave no hover, blur 5x5);
     • DEPTH_RANGE 50, offsets 8/8, distribuição por ângulo áureo;
     • o avanço contínuo do autoplay (+0,3·delta) e o amortecimento;
     • wrapping infinito dos planos e o avanço de imageIndex;
     • amortecimento 0,95 e z += velocidade·delta·10;
     • as curvas de fade e blur, com as MESMAS paradas do export
       default: fade 0,05-0,25 e 0,40-0,43; blur 0-0,1 e 0,40-0,43,
       teto 8;
     • escala pelo aspecto, câmera em [0,0,0] com fov 55;
     • o hover plano a plano, com a bandeira no shader;
     • a checagem de WebGL com a grade de fallback.

   AS MUDANÇAS, e por quê:

   1. textureSize(map, 0) é GLSL ES 3.00. O ShaderMaterial do three
      compila em GLSL1 por padrão, onde essa função não existe e o
      shader nem chega a linkar. O tamanho da textura entra por
      uniform (mapSize). A conta do blur é a mesma, pixel por pixel.

   2. O scrollVelocity era useState atualizado dentro do useFrame;
      aqui é uma variável comum. Mesma aritmética, um quadro por
      quadro, sem o re-render do React no meio.

   3. A ENTRADA DO USUÁRIO SAIU, a pedido. O original dirigia a
      galeria pela roda do mouse e pelas setas, com o autoplay
      retomando 3s depois. Aqui o loop anda sozinho e ponto: a
      rolagem não altera a galeria, e a galeria não altera a rolagem.
      Com isso saíram também o autoplay condicional, o carimbo de
      última interação e o setInterval que os vigiava.
   ════════════════════════════════════════════════════════════════ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

/* ── Constantes do original ─────────────────────────────────── */
const DEFAULT_DEPTH_RANGE = 50;
const MAX_HORIZONTAL_OFFSET = 8;
const MAX_VERTICAL_OFFSET = 8;

/* Props do demo. `speed` valia só para a roda e as setas, que
   saíram — o ritmo do loop vem do +0,3/s do autoplay. */
const VISIBLE_COUNT = 12;

/* Raio do canto em UNIDADES DE MUNDO, não em pixels: os planos têm
   2 de largura, então 0,12 é 6% dela — o mesmo peso visual do
   --raio-sm do site, e constante para qualquer distância da câmera. */
const RAIO_CANTO = 0.12;

/* Defaults do export default de InfiniteGallery. */
const fadeSettings = {
  fadeIn: { start: 0.05, end: 0.25 },
  fadeOut: { start: 0.4, end: 0.43 },
};
const blurSettings = {
  blurIn: { start: 0.0, end: 0.1 },
  blurOut: { start: 0.4, end: 0.43 },
  maxBlur: 8.0,
};

const createClothMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      map: { value: null },
      mapSize: { value: new THREE.Vector2(1, 1) },
      /* Tamanho do plano em unidades de mundo e raio do canto na
         mesma unidade — é o que deixa o arredondamento igual nos
         quatro cantos mesmo com o plano sendo 2x3, e não 1x1. */
      quadSize: { value: new THREE.Vector2(2, 2) },
      raio: { value: RAIO_CANTO },
      opacity: { value: 1.0 },
      blurAmount: { value: 0.0 },
      scrollForce: { value: 0.0 },
      time: { value: 0.0 },
      isHovered: { value: 0.0 },
    },
    vertexShader: `
      uniform float scrollForce;
      uniform float time;
      uniform float isHovered;
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        vUv = uv;
        vNormal = normal;

        vec3 pos = position;

        // Create smooth curving based on scroll force
        float curveIntensity = scrollForce * 0.3;

        // Base curve across the plane based on distance from center
        float distanceFromCenter = length(pos.xy);
        float curve = distanceFromCenter * distanceFromCenter * curveIntensity;

        // Add gentle cloth-like ripples
        float ripple1 = sin(pos.x * 2.0 + scrollForce * 3.0) * 0.02;
        float ripple2 = sin(pos.y * 2.5 + scrollForce * 2.0) * 0.015;
        float clothEffect = (ripple1 + ripple2) * abs(curveIntensity) * 2.0;

        // Flag waving effect when hovered
        float flagWave = 0.0;
        if (isHovered > 0.5) {
          // Create flag-like wave from left to right
          float wavePhase = pos.x * 3.0 + time * 8.0;
          float waveAmplitude = sin(wavePhase) * 0.1;
          // Damping effect - stronger wave on the right side (free edge)
          float dampening = smoothstep(-0.5, 0.5, pos.x);
          flagWave = waveAmplitude * dampening;

          // Add secondary smaller waves for more realistic flag motion
          float secondaryWave = sin(pos.x * 5.0 + time * 12.0) * 0.03 * dampening;
          flagWave += secondaryWave;
        }

        // Apply Z displacement for curving effect (inverted) with cloth ripples and flag wave
        pos.z -= (curve + clothEffect + flagWave);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform vec2 mapSize;
      uniform vec2 quadSize;
      uniform float raio;
      uniform float opacity;
      uniform float blurAmount;
      uniform float scrollForce;
      varying vec2 vUv;
      varying vec3 vNormal;

      /* SDF de retângulo arredondado: negativo dentro, positivo fora.
         Trabalha em unidades de mundo, não em UV, senão o raio sairia
         achatado na horizontal num plano que é mais alto que largo. */
      float caixaArredondada(vec2 p, vec2 meia, float r) {
        vec2 q = abs(p) - meia + r;
        return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
      }

      void main() {
        vec4 color = texture2D(map, vUv);

        // Simple blur approximation
        if (blurAmount > 0.0) {
          vec2 texelSize = 1.0 / mapSize;
          vec4 blurred = vec4(0.0);
          float total = 0.0;

          for (float x = -2.0; x <= 2.0; x += 1.0) {
            for (float y = -2.0; y <= 2.0; y += 1.0) {
              vec2 offset = vec2(x, y) * texelSize * blurAmount;
              float weight = 1.0 / (1.0 + length(vec2(x, y)));
              blurred += texture2D(map, vUv + offset) * weight;
              total += weight;
            }
          }
          color = blurred / total;
        }

        // Add subtle lighting effect based on curving
        float curveHighlight = abs(scrollForce) * 0.05;
        color.rgb += vec3(curveHighlight * 0.1);

        /* Cantos arredondados. A suavização é derivada do tamanho do
           plano em vez de fwidth(): fwidth é GLSL ES 3.00 ou precisa
           da extensão OES_standard_derivatives, e este shader compila
           em GLSL1 — o mesmo motivo que tirou textureSize daqui. */
        vec2 p = (vUv - 0.5) * quadSize;
        float d = caixaArredondada(p, quadSize * 0.5, raio);
        float suave = quadSize.x * 0.004;
        float mascara = 1.0 - smoothstep(-suave, suave, d);

        gl_FragColor = vec4(color.rgb, color.a * opacity * mascara);
      }
    `,
  });

function semWebgl(raiz, imagens) {
  const grade = document.createElement('div');
  raiz.classList.add('g3d--sem-webgl');
  grade.className = 'g3d__fallback';
  grade.innerHTML = imagens
    .map((i) => `<img src="${i.src}" alt="${i.alt || ''}" loading="lazy" decoding="async">`)
    .join('');
  raiz.appendChild(grade);
}

function iniciar(raiz) {
  const imagens = JSON.parse(raiz.getAttribute('data-imagens'));
  if (!imagens.length) return;

  try {
    const c = document.createElement('canvas');
    if (!(c.getContext('webgl') || c.getContext('experimental-webgl'))) {
      semWebgl(raiz, imagens); return;
    }
  } catch (e) { semWebgl(raiz, imagens); return; }

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
  camera.position.set(0, 0, 0);

  const render = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  render.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  raiz.appendChild(render.domElement);

  function medir() {
    const { clientWidth: l, clientHeight: a } = raiz;
    render.setSize(l, a, false);
    camera.aspect = l / a;
    camera.updateProjectionMatrix();
  }
  medir();
  new ResizeObserver(medir).observe(raiz);

  /* Texturas: o laço só começa quando todas carregaram, como o
     useTexture do drei, que suspende até o carregamento terminar. */
  const carregador = new THREE.TextureLoader();
  Promise.all(
    imagens.map((i) => new Promise((ok) => carregador.load(i.src, ok, undefined, () => ok(null))))
  ).then((texturas) => {
    const texturasOk = texturas.filter(Boolean);
    if (!texturasOk.length) { semWebgl(raiz, imagens); return; }
    /* NÃO marcar as texturas como SRGBColorSpace. O original não marca,
       e marcar aqui escurecia tudo: o shader é cru, escreve direto em
       gl_FragColor e o three só injeta a conversão de saída em shaders
       que incluem <colorspace_fragment>. Com a marca, a GPU decodifica
       sRGB->linear ao amostrar e ninguém recodifica na saída — o valor
       linear vai para a tela como se fosse sRGB. Sem a marca os bytes
       passam intactos, que é o comportamento do componente. */

    const totalImages = texturasOk.length;
    const depthRange = DEFAULT_DEPTH_RANGE;
    const visibleCount = VISIBLE_COUNT;

    const materials = Array.from({ length: visibleCount }, createClothMaterial);

    /* Ângulo áureo, exatamente como no original. */
    const spatialPositions = [];
    for (let i = 0; i < visibleCount; i++) {
      const horizontalAngle = (i * 2.618) % (Math.PI * 2);
      const verticalAngle = (i * 1.618 + Math.PI / 3) % (Math.PI * 2);
      const horizontalRadius = (i % 3) * 1.2;
      const verticalRadius = ((i + 1) % 4) * 0.8;
      spatialPositions.push({
        x: (Math.sin(horizontalAngle) * horizontalRadius * MAX_HORIZONTAL_OFFSET) / 3,
        y: (Math.cos(verticalAngle) * verticalRadius * MAX_VERTICAL_OFFSET) / 4,
      });
    }

    const planesData = Array.from({ length: visibleCount }, (_, i) => ({
      index: i,
      z: ((depthRange / visibleCount) * i) % depthRange,
      imageIndex: i % totalImages,
      x: spatialPositions[i].x,
      y: spatialPositions[i].y,
    }));

    const geometria = new THREE.PlaneGeometry(1, 1, 32, 32);
    const malhas = planesData.map((plano, i) => {
      const m = new THREE.Mesh(geometria, materials[i]);
      m.userData.i = i;
      cena.add(m);
      return m;
    });

    const aplicarTextura = (material, textura) => {
      material.uniforms.map.value = textura;
      const im = textura.image;
      material.uniforms.mapSize.value.set(im.width, im.height);
    };

    /* ── Entrada: nenhuma ───────────────────────────────────────
       O original dirigia a galeria pela roda do mouse e pelas setas,
       e voltava ao autoplay 3s depois. Os dois foram retirados a
       pedido: o loop continua, mas a rolagem não mexe nele.

       Saíram juntos, e não só a roda, porque as setas TAMBÉM são
       rolagem — o handler ficava no document e respondia a
       ArrowUp/Down em qualquer ponto da página, de modo que quem
       navegasse de teclado daria um tranco na galeria sem querer.

       Com ninguém interrompendo, o autoplay não precisa mais ser
       reativado: some o `autoPlay`, some o `lastInteraction` e some o
       setInterval de 1s que os vigiava. O laço só acelera e amortece.

       Efeito colateral bem-vindo: acabou a captura de rolagem. A
       página passa por baixo da galeria como por qualquer seção. */
    let scrollVelocity = 0;

    /* Hover: o onPointerEnter/Leave do R3F é um raycast por trás. */
    const raio = new THREE.Raycaster();
    const ponteiro = new THREE.Vector2();
    let sobre = -1;
    render.domElement.addEventListener('pointermove', (ev) => {
      const r = render.domElement.getBoundingClientRect();
      ponteiro.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
      ponteiro.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
      raio.setFromCamera(ponteiro, camera);
      const bateu = raio.intersectObjects(malhas, false);
      const novo = bateu.length ? bateu[0].object.userData.i : -1;
      if (novo !== sobre) {
        if (sobre >= 0) materials[sobre].uniforms.isHovered.value = 0;
        if (novo >= 0) materials[novo].uniforms.isHovered.value = 1;
        sobre = novo;
      }
    });
    render.domElement.addEventListener('pointerleave', () => {
      if (sobre >= 0) materials[sobre].uniforms.isHovered.value = 0;
      sobre = -1;
    });

    /* ── Laço ───────────────────────────────────────────────── */
    const relogio = new THREE.Clock();
    let visivel = true;
    new IntersectionObserver(
      ([e]) => { visivel = e.isIntersecting; },
      { rootMargin: '200px' }
    ).observe(raiz);

    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)');

    function quadro() {
      requestAnimationFrame(quadro);
      const delta = relogio.getDelta();
      if (!visivel) return;

      if (!calmo.matches) scrollVelocity += 0.3 * delta;
      scrollVelocity *= 0.95;

      const time = relogio.getElapsedTime();
      for (const m of materials) {
        m.uniforms.time.value = time;
        m.uniforms.scrollForce.value = scrollVelocity;
      }

      const imageAdvance = visibleCount % totalImages || totalImages;
      const totalRange = depthRange;
      const halfRange = totalRange / 2;

      planesData.forEach((plane, i) => {
        let newZ = plane.z + scrollVelocity * delta * 10;
        let wrapsForward = 0;
        let wrapsBackward = 0;

        if (newZ >= totalRange) {
          wrapsForward = Math.floor(newZ / totalRange);
          newZ -= totalRange * wrapsForward;
        } else if (newZ < 0) {
          wrapsBackward = Math.ceil(-newZ / totalRange);
          newZ += totalRange * wrapsBackward;
        }

        if (wrapsForward > 0) {
          plane.imageIndex = (plane.imageIndex + wrapsForward * imageAdvance) % totalImages;
        }
        if (wrapsBackward > 0) {
          const step = plane.imageIndex - wrapsBackward * imageAdvance;
          plane.imageIndex = ((step % totalImages) + totalImages) % totalImages;
        }

        plane.z = ((newZ % totalRange) + totalRange) % totalRange;

        const normalizedPosition = plane.z / totalRange;
        let opacity = 1;

        if (
          normalizedPosition >= fadeSettings.fadeIn.start &&
          normalizedPosition <= fadeSettings.fadeIn.end
        ) {
          opacity =
            (normalizedPosition - fadeSettings.fadeIn.start) /
            (fadeSettings.fadeIn.end - fadeSettings.fadeIn.start);
        } else if (normalizedPosition < fadeSettings.fadeIn.start) {
          opacity = 0;
        } else if (
          normalizedPosition >= fadeSettings.fadeOut.start &&
          normalizedPosition <= fadeSettings.fadeOut.end
        ) {
          opacity =
            1 -
            (normalizedPosition - fadeSettings.fadeOut.start) /
              (fadeSettings.fadeOut.end - fadeSettings.fadeOut.start);
        } else if (normalizedPosition > fadeSettings.fadeOut.end) {
          opacity = 0;
        }
        opacity = Math.max(0, Math.min(1, opacity));

        let blur = 0;
        if (
          normalizedPosition >= blurSettings.blurIn.start &&
          normalizedPosition <= blurSettings.blurIn.end
        ) {
          blur =
            blurSettings.maxBlur *
            (1 -
              (normalizedPosition - blurSettings.blurIn.start) /
                (blurSettings.blurIn.end - blurSettings.blurIn.start));
        } else if (normalizedPosition < blurSettings.blurIn.start) {
          blur = blurSettings.maxBlur;
        } else if (
          normalizedPosition >= blurSettings.blurOut.start &&
          normalizedPosition <= blurSettings.blurOut.end
        ) {
          blur =
            blurSettings.maxBlur *
            ((normalizedPosition - blurSettings.blurOut.start) /
              (blurSettings.blurOut.end - blurSettings.blurOut.start));
        } else if (normalizedPosition > blurSettings.blurOut.end) {
          blur = blurSettings.maxBlur;
        }
        blur = Math.max(0, Math.min(blurSettings.maxBlur, blur));

        const material = materials[i];
        material.uniforms.opacity.value = opacity;
        material.uniforms.blurAmount.value = blur;

        const textura = texturasOk[plane.imageIndex];
        if (material.uniforms.map.value !== textura) aplicarTextura(material, textura);

        /* Escala pelo aspecto, igual ao original. */
        const im = textura.image;
        const aspect = im ? im.width / im.height : 1;
        const malha = malhas[i];
        if (aspect > 1) malha.scale.set(2 * aspect, 2, 1);
        else malha.scale.set(2, 2 / aspect, 1);
        /* O shader precisa do tamanho do plano para arredondar os
           quatro cantos com o mesmo raio; sem isso o canto sairia
           oval num plano 2x3. */
        material.uniforms.quadSize.value.set(malha.scale.x, malha.scale.y);

        malha.position.set(plane.x, plane.y, plane.z - halfRange);
      });

      render.render(cena, camera);
    }

    raiz.classList.add('g3d--pronta');
    quadro();
  });
}

const raiz = document.querySelector('[data-galeria3d]');
if (raiz) iniciar(raiz);
