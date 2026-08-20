# MÁ IDEIA | Dado 3D

Protótipo mobile-first em Three.js/WebGL para a linha MÁ IDEIA, da MIDAS Studio.

## Rodar localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
```

A pasta final será `dist/`.

## Trocar pelo modelo 3D real

1. Coloque o arquivo em `public/models/dado-ma-ideia.glb`.
2. Em `src/config/gameConfig.js`, mude `model.useExternalModel` para `true`.
3. Ajuste `model.scale` se necessário.
4. Calibre apenas `model.faceNormals` se a orientação local das faces do GLB for diferente.

O sorteio, a interface, a animação, a câmera e o fluxo permanecem independentes do modelo.

## Configurar outro produto MÁ IDEIA

Edite somente `src/config/gameConfig.js`. Resultados repetidos em faces diferentes são suportados nativamente.
