import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createGenericDice } from './GenericDice.js';

function prepareObject(root) {
  root.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    child.frustumCulled = true;
  });
  return root;
}

export async function loadDiceModel(modelConfig) {
  if (!modelConfig.useExternalModel) {
    return createGenericDice();
  }

  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(modelConfig.url);
  const root = prepareObject(gltf.scene);
  root.name = 'external-dice';
  root.scale.setScalar(modelConfig.scale ?? 1);

  // Normaliza o pivô visual do GLB para o centro do grupo.
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.sub(center);

  const wrapper = new THREE.Group();
  wrapper.add(root);
  return wrapper;
}
