import * as THREE from 'three';
import { loadDiceModel } from '../models/loadDiceModel.js';
import { RollAnimator } from './RollAnimator.js';
import { randomIndex } from '../utils/random.js';

function createShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 118);
  gradient.addColorStop(0, 'rgba(0,0,0,0.72)');
  gradient.addColorStop(0.45, 'rgba(0,0,0,0.38)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class DiceExperience {
  constructor({ canvas, resultElement, buttonElement, statusElement, config }) {
    this.canvas = canvas;
    this.resultElement = resultElement;
    this.buttonElement = buttonElement;
    this.statusElement = statusElement;
    this.config = config;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b0710);

    this.camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
    this.camera.position.set(4.25, 3.35, 5.25);
    this.camera.lookAt(0, 0.05, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.clock = new THREE.Clock();

    this.dice = null;
    this.shadow = null;
    this.animator = null;
    this.rolling = false;
    this.idleTime = 0;
    this.frameId = null;

    this.handleResize = this.handleResize.bind(this);
    this.handleCanvasPointer = this.handleCanvasPointer.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);
    this.renderFrame = this.renderFrame.bind(this);
  }

  async init() {
    this.setupLights();
    this.setupGroundAndShadow();

    this.dice = await loadDiceModel(this.config.model);
    this.dice.position.set(0, 0, 0);
    this.dice.rotation.set(-0.16, 0.58, 0.08);
    this.scene.add(this.dice);

    this.animator = new RollAnimator({
      object: this.dice,
      shadow: this.shadow,
      config: this.config.motion,
    });

    this.bindEvents();
    this.handleResize();
    this.frameId = requestAnimationFrame(this.renderFrame);
  }

  setupLights() {
    this.scene.add(new THREE.HemisphereLight(0xcdb6ff, 0x160d1e, 1.85));

    const key = new THREE.DirectionalLight(0xfff7ff, 4.2);
    key.position.set(3.8, 6.2, 4.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 20;
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    key.shadow.bias = -0.00025;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0x8d4fff, 2.1);
    fill.position.set(-4.5, 2.5, 3.5);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xe0c5ff, 2.4);
    rim.position.set(1.5, 3.3, -5.2);
    this.scene.add(rim);
  }

  setupGroundAndShadow() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.26 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.03;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.9, 2.9),
      new THREE.MeshBasicMaterial({
        map: createShadowTexture(),
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.set(0, -1.01, 0.04);
    this.scene.add(this.shadow);
  }

  bindEvents() {
    window.addEventListener('resize', this.handleResize, { passive: true });
    this.canvas.addEventListener('pointerup', this.handleCanvasPointer, { passive: true });
    this.buttonElement.addEventListener('click', () => this.roll());
    document.addEventListener('visibilitychange', this.handleVisibility);
  }

  handleCanvasPointer(event) {
    if (this.rolling || !this.dice) return;
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    if (this.raycaster.intersectObject(this.dice, true).length > 0) {
      this.roll();
    }
  }

  roll() {
    if (this.rolling || !this.animator) return;

    const face = this.config.faces[randomIndex(this.config.faces.length)];
    const normal = this.config.model.faceNormals[face.id];
    if (!normal) {
      throw new Error(`Face ${face.id} não possui orientação configurada.`);
    }

    this.rolling = true;
    this.resultElement.classList.remove('is-visible');
    this.resultElement.setAttribute('aria-hidden', 'true');
    this.resultElement.textContent = '';
    this.buttonElement.disabled = true;
    this.buttonElement.textContent = 'JOGANDO…';
    this.statusElement.textContent = 'a má ideia já foi escolhida';

    this.animator.start(face.id, normal, () => this.reveal(face));
  }

  reveal(face) {
    this.resultElement.textContent = face.result;
    this.resultElement.classList.add('is-visible');
    this.resultElement.setAttribute('aria-hidden', 'false');
    this.buttonElement.disabled = false;
    this.buttonElement.textContent = 'JOGAR DE NOVO';
    this.statusElement.textContent = `face ${face.id}`;
    this.rolling = false;
  }

  handleResize() {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const pixelRatioCap = window.innerWidth <= 768 ? 1.75 : 2;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  handleVisibility() {
    if (document.hidden) {
      if (this.frameId) cancelAnimationFrame(this.frameId);
      this.frameId = null;
      return;
    }

    if (!this.frameId) {
      this.clock.getDelta();
      this.frameId = requestAnimationFrame(this.renderFrame);
    }
  }

  renderFrame(now) {
    this.frameId = requestAnimationFrame(this.renderFrame);
    const delta = Math.min(this.clock.getDelta(), 0.05);

    if (this.animator?.active) {
      this.animator.update(now);
    } else if (this.dice) {
      this.idleTime += delta;
      this.dice.position.y = Math.sin(this.idleTime * 1.35) * 0.035;
      this.dice.rotation.y += delta * 0.07;
      if (this.shadow) {
        const idle = 1 - Math.abs(this.dice.position.y) * 1.8;
        this.shadow.scale.setScalar(1.05 * idle);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
