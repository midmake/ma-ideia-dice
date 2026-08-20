import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const PIP_LAYOUTS = {
  1: [[0, 0]],
  2: [[-0.42, 0.42], [0.42, -0.42]],
  3: [[-0.42, 0.42], [0, 0], [0.42, -0.42]],
  4: [[-0.42, 0.42], [0.42, 0.42], [-0.42, -0.42], [0.42, -0.42]],
  5: [[-0.42, 0.42], [0.42, 0.42], [0, 0], [-0.42, -0.42], [0.42, -0.42]],
  6: [[-0.42, 0.46], [-0.42, 0], [-0.42, -0.46], [0.42, 0.46], [0.42, 0], [0.42, -0.46]],
};

function addPip(group, face, u, v, material) {
  const pip = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.035, 28), material);
  pip.castShadow = true;

  const surface = 1.012;

  switch (face) {
    case 1: // +Z
      pip.position.set(u, v, surface);
      pip.rotation.x = Math.PI / 2;
      break;
    case 2: // +X
      pip.position.set(surface, v, -u);
      pip.rotation.z = -Math.PI / 2;
      break;
    case 3: // +Y
      pip.position.set(u, surface, -v);
      break;
    case 4: // -Y
      pip.position.set(u, -surface, v);
      break;
    case 5: // -X
      pip.position.set(-surface, v, u);
      pip.rotation.z = -Math.PI / 2;
      break;
    case 6: // -Z
      pip.position.set(-u, v, -surface);
      pip.rotation.x = Math.PI / 2;
      break;
    default:
      break;
  }

  group.add(pip);
}

export function createGenericDice() {
  const group = new THREE.Group();
  group.name = 'generic-dice';

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x7c35df,
    roughness: 0.26,
    metalness: 0.06,
    clearcoat: 0.48,
    clearcoatRoughness: 0.22,
  });

  const pipMaterial = new THREE.MeshStandardMaterial({
    color: 0x160c20,
    roughness: 0.5,
    metalness: 0.02,
  });

  const body = new THREE.Mesh(new RoundedBoxGeometry(2, 2, 2, 7, 0.2), bodyMaterial);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  for (let face = 1; face <= 6; face += 1) {
    for (const [u, v] of PIP_LAYOUTS[face]) {
      addPip(group, face, u, v, pipMaterial);
    }
  }

  return group;
}
