import * as THREE from 'three';

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const easeOutCubic = (t) => 1 - ((1 - t) ** 3);
const easeInCubic = (t) => t ** 3;
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - ((-2 * t + 2) ** 3) / 2);
const easeOutBackSoft = (t) => {
  const c1 = 1.18;
  const c3 = c1 + 1;
  return 1 + c3 * ((t - 1) ** 3) + c1 * ((t - 1) ** 2);
};

function normalizedFaceQuaternion(faceNormal, finalYaw) {
  const source = new THREE.Vector3(...faceNormal).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const faceUp = new THREE.Quaternion().setFromUnitVectors(source, up);
  const yaw = new THREE.Quaternion().setFromAxisAngle(up, finalYaw);
  return yaw.multiply(faceUp).normalize();
}

function randomSpinQuaternion(progress, spinSeed) {
  const axisA = new THREE.Vector3(0.88, 0.62, 0.44).normalize();
  const axisB = new THREE.Vector3(-0.38, 0.93, 0.7).normalize();
  const axisC = new THREE.Vector3(0.52, -0.31, 0.98).normalize();

  const qx = new THREE.Quaternion().setFromAxisAngle(axisA, progress * spinSeed.x);
  const qy = new THREE.Quaternion().setFromAxisAngle(axisB, progress * spinSeed.y);
  const qz = new THREE.Quaternion().setFromAxisAngle(axisC, progress * spinSeed.z);

  return qx.multiply(qy).multiply(qz).normalize();
}

export class RollAnimator {
  constructor({ object, shadow, config }) {
    this.object = object;
    this.shadow = shadow;
    this.config = config;
    this.active = false;
    this.startTime = 0;
    this.onComplete = null;

    this.restY = 0;
    this.startQuaternion = new THREE.Quaternion();
    this.targetQuaternion = new THREE.Quaternion();
    this.chaosQuaternion = new THREE.Quaternion();
    this.spinSeed = new THREE.Vector3();
  }

  start(faceId, faceNormal, onComplete) {
    if (this.active) return false;

    this.active = true;
    this.startTime = performance.now();
    this.onComplete = onComplete;
    this.startQuaternion.copy(this.object.quaternion);
    this.targetQuaternion.copy(normalizedFaceQuaternion(faceNormal, this.config.finalYaw));

    const turns = () => (6 + Math.random() * 4) * Math.PI * 2;
    this.spinSeed.set(turns(), turns(), turns());

    // Garante que lançamentos consecutivos não tenham a mesma assinatura visual.
    this.object.rotation.y += (faceId * 0.071);
    return true;
  }

  update(now) {
    if (!this.active) return false;

    const t = clamp01((now - this.startTime) / this.config.durationMs);
    this.updatePosition(t);
    this.updateRotation(t);
    this.updateShadow();

    if (t >= 1) {
      this.active = false;
      this.object.position.y = this.restY;
      this.object.quaternion.copy(this.targetQuaternion);
      this.updateShadow();
      this.onComplete?.();
      this.onComplete = null;
    }

    return true;
  }

  updatePosition(t) {
    const h = this.config.launchHeight;
    let y = this.restY;

    if (t < 0.34) {
      const p = t / 0.34;
      y += h * easeOutCubic(p);
    } else if (t < 0.66) {
      const p = (t - 0.34) / 0.32;
      y += h * (1 - easeInCubic(p));
    } else if (t < 0.79) {
      const p = (t - 0.66) / 0.13;
      y += Math.sin(Math.PI * p) * this.config.primaryBounce;
    } else if (t < 0.88) {
      const p = (t - 0.79) / 0.09;
      y += Math.sin(Math.PI * p) * this.config.secondaryBounce;
    }

    // Pequena deriva horizontal de ida e volta reforça a sensação de impulso.
    const drift = Math.sin(Math.PI * Math.min(t / 0.88, 1));
    this.object.position.x = 0.11 * drift;
    this.object.position.z = -0.08 * drift;
    this.object.position.y = y;
  }

  updateRotation(t) {
    const spinProgress = easeOutCubic(Math.min(t / 0.82, 1));
    this.chaosQuaternion.copy(this.startQuaternion)
      .multiply(randomSpinQuaternion(spinProgress, this.spinSeed));

    if (t < 0.73) {
      this.object.quaternion.copy(this.chaosQuaternion);
      return;
    }

    const settle = clamp01((t - 0.73) / 0.27);
    const easedSettle = easeInOutCubic(settle);
    this.object.quaternion.copy(this.chaosQuaternion).slerp(this.targetQuaternion, easedSettle);

    // Micro assentamento final, sem alterar a face selecionada.
    if (settle > 0.78) {
      const micro = easeOutBackSoft((settle - 0.78) / 0.22);
      const tilt = new THREE.Quaternion().setFromEuler(
        new THREE.Euler((1 - micro) * 0.025, 0, (1 - micro) * -0.018),
      );
      this.object.quaternion.multiply(tilt).normalize();
    }
  }

  updateShadow() {
    if (!this.shadow) return;
    const height = Math.max(0, this.object.position.y - this.restY);
    const normalized = Math.min(height / this.config.launchHeight, 1);
    const scale = 1.15 - normalized * 0.36;
    this.shadow.scale.set(scale, scale, scale);
    this.shadow.material.opacity = 0.35 - normalized * 0.18;
  }
}
