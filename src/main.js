import { gameConfig } from './config/gameConfig.js';
import { DiceExperience } from './engine/DiceExperience.js';

const experience = new DiceExperience({
  canvas: document.querySelector('#dice-canvas'),
  resultElement: document.querySelector('#result'),
  buttonElement: document.querySelector('#roll-button'),
  statusElement: document.querySelector('#status'),
  config: gameConfig,
});

experience.init().catch((error) => {
  console.error(error);
  const status = document.querySelector('#status');
  status.textContent = 'não foi possível iniciar o dado 3D';
  document.querySelector('#roll-button').disabled = true;
});
