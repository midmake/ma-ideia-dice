export const gameConfig = {
  name: 'Dado',
  brand: 'MÁ IDEIA',
  faces: [
    { id: 1, result: 'BEIJO' },
    { id: 2, result: 'TAPA' },
    { id: 3, result: 'VERDADE' },
    { id: 4, result: 'DESAFIO' },
    { id: 5, result: 'PASSA A VEZ' },
    { id: 6, result: 'MÁ IDEIA' },
  ],

  model: {
    useExternalModel: false,
    url: './models/dado-ma-ideia.glb',
    scale: 1,
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
