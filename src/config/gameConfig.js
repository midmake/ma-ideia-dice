export const gameConfig = {
  name: 'Dado',
  brand: 'MÁ IDEIA',
  // Cada face tem a mesma chance. Resultados podem se repetir em faces diferentes.
  faces: [
    { id: 1, result: 'BEIJO' },
    { id: 2, result: 'TAPA' },
    { id: 3, result: 'VERDADE' },
    { id: 4, result: 'DESAFIO' },
    { id: 5, result: 'PASSA A VEZ' },
    { id: 6, result: 'MÁ IDEIA' },
  ],

  model: {
    // Nesta fase usamos o modelo procedural WebGL.
    // Quando o GLB chegar, altere para true e mantenha todo o restante do app.
    useExternalModel: false,
    url: `${import.meta.env.BASE_URL}models/dado-ma-ideia.glb`,
    scale: 1,

    // Normal local de cada face. Ao trocar pelo GLB real, só calibre este mapa
    // caso a orientação do arquivo 3D seja diferente da peça provisória.
    faceNormals: {
      1: [0, 0, 1],
      2: [1, 0, 0],
      3: [0, 1, 0],
      4: [0, -1, 0],
      5: [-1, 0, 0],
      6: [0, 0, -1],
    },
  },

  motion: {
    durationMs: 2350,
    launchHeight: 2.45,
    primaryBounce: 0.42,
    secondaryBounce: 0.16,
    finalYaw: 0.38,
  },
};
