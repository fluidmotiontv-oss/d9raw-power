import * as THREE from 'three';
import {
  ModuleType,
  CameraMode,
  DragonColorTheme,
  AudioVisualizerData,
  StoryStage,
  Dragon9ExportConfig,
  Dragon9ExportResult,
  PipelineCapabilities,
  WatermarkPosition,
} from '../types';

export const COLOR_THEMES: DragonColorTheme[] = [
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    scaleColor: 0x00f0ff,
    spineColor: 0xff0055,
    glowColor: 0x7b2cbf,
    trailColor: 0x00f0ff,
    eyeColor: 0x00ffff,
    ambientLight: 0x141026,
    bgFog: 0x060611,
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    scaleColor: 0xffa200,
    spineColor: 0xff2a00,
    glowColor: 0xffdd00,
    trailColor: 0xff5100,
    eyeColor: 0xffea00,
    ambientLight: 0x220e03,
    bgFog: 0x0f0502,
  },
  {
    id: 'toxic-emerald',
    name: 'Toxic Emerald',
    scaleColor: 0x00ff88,
    spineColor: 0x00a86b,
    glowColor: 0x0df0a4,
    trailColor: 0x00ff88,
    eyeColor: 0x39ff14,
    ambientLight: 0x04180f,
    bgFog: 0x020c07,
  },
  {
    id: 'phantom-violet',
    name: 'Phantom Violet',
    scaleColor: 0xc77dff,
    spineColor: 0x7b2cbf,
    glowColor: 0xe0aaff,
    trailColor: 0x9d4edd,
    eyeColor: 0xf72585,
    ambientLight: 0x160826,
    bgFog: 0x080312,
  },
];

// =============================================================================
// RANDOMIZED CINEMATIC VIEWPOINTS DEFINITION
// =============================================================================
export interface CinematicViewpointDef {
  id: string;
  name: string;
  category: 'orbital' | 'tracking' | 'profile' | 'crane' | 'macro' | 'reverse' | 'dutch';
  description: string;
  calculate: (
    dragonTime: number,
    bass: number,
    head: THREE.Vector3,
    spineSegments: THREE.Group[],
    mouse: { x: number; y: number },
    seed: number
  ) => {
    position: THREE.Vector3;
    target: THREE.Vector3;
    fov: number;
    roll: number;
    speed: number;
  };
}

export const CINEMATIC_VIEWPOINTS: CinematicViewpointDef[] = [
  {
    id: 'orbital-wide',
    name: 'Orbital 360° Wide Sweep',
    category: 'orbital',
    description: 'High sweeping orbital trajectory showcasing cyber dragon coils and atmospheric fog',
    calculate: (dragonTime, bass, head, _spine, mouse, seed) => {
      const radius = 42 + Math.sin(dragonTime * 0.2 + seed) * 6;
      const angle = dragonTime * 0.35 + seed * 0.1 + mouse.x * 1.5;
      const height = 16 + Math.sin(dragonTime * 0.4 + seed) * 8 + bass * 3;
      return {
        position: new THREE.Vector3(
          Math.sin(angle) * radius,
          height,
          Math.cos(angle) * radius
        ),
        target: new THREE.Vector3(head.x * 0.4, head.y * 0.4, head.z * 0.4),
        fov: 56,
        roll: Math.sin(dragonTime * 0.2) * 0.05,
        speed: 3.2,
      };
    },
  },
  {
    id: 'dragon-chase-low',
    name: 'Underbelly Low-Angle Chase',
    category: 'tracking',
    description: 'Low ground-skimming chase looking upward along the illuminated cybernetic jaw and chrome fangs',
    calculate: (dragonTime, bass, head, _spine, mouse, seed) => {
      const wobbleX = Math.sin(dragonTime * 0.6 + seed) * 5 + mouse.x * 4;
      const wobbleY = Math.cos(dragonTime * 0.4 + seed) * 2 - 4.5 + bass * 1.5;
      return {
        position: new THREE.Vector3(
          head.x + wobbleX,
          head.y + wobbleY,
          head.z + 18.5
        ),
        target: new THREE.Vector3(head.x, head.y + 2.5, head.z - 2.0),
        fov: 68,
        roll: -0.09 + Math.sin(dragonTime * 0.5) * 0.04,
        speed: 4.8,
      };
    },
  },
  {
    id: 'spine-profile-dolly',
    name: 'Spine Profile Dolly Track',
    category: 'profile',
    description: 'Lateral dolly tracking parallel to the articulating dorsal spine and pulsating spikes',
    calculate: (dragonTime, bass, head, spineSegments, _mouse, seed) => {
      const segIndex = Math.min(18, spineSegments.length - 1);
      const seg = spineSegments[segIndex] ? spineSegments[segIndex].position : head;
      const side = (seed % 2 === 0 ? 1 : -1);
      return {
        position: new THREE.Vector3(
          seg.x + 20 * side,
          seg.y + 4 + Math.sin(dragonTime * 0.7) * 3 + bass * 2,
          seg.z + Math.cos(dragonTime * 0.5) * 6
        ),
        target: new THREE.Vector3(seg.x, seg.y, seg.z),
        fov: 52,
        roll: 0.02 * side,
        speed: 4.2,
      };
    },
  },
  {
    id: 'head-over-shoulder',
    name: 'Over-Shoulder Cockpit Cam',
    category: 'tracking',
    description: 'Mounted directly behind the horns and skull facing forward into the neon horizon',
    calculate: (dragonTime, bass, head, _spine, mouse, seed) => {
      return {
        position: new THREE.Vector3(
          head.x + 2.4 + mouse.x * 3,
          head.y + 4.2 + bass * 1.2,
          head.z - 8.5
        ),
        target: new THREE.Vector3(
          head.x - Math.sin(dragonTime * 0.4 + seed) * 10,
          head.y - 0.5,
          head.z + 28
        ),
        fov: 62,
        roll: Math.sin(dragonTime * 0.45) * 0.12,
        speed: 5.2,
      };
    },
  },
  {
    id: 'orbital-spiral-close',
    name: 'Close-Up Head Spiral',
    category: 'orbital',
    description: 'Tight accelerating spiral orbit locked on the articulated head and illuminated eyes',
    calculate: (dragonTime, bass, head, _spine, _mouse, seed) => {
      const angle = dragonTime * 0.85 + seed;
      const radius = 14 + Math.sin(dragonTime * 0.3) * 2;
      return {
        position: new THREE.Vector3(
          head.x + Math.sin(angle) * radius,
          head.y + 3.0 + Math.cos(angle * 0.8) * 4 + bass * 2,
          head.z + Math.cos(angle) * radius
        ),
        target: new THREE.Vector3(head.x, head.y + 0.5, head.z),
        fov: 54,
        roll: Math.cos(angle) * 0.16,
        speed: 5.6,
      };
    },
  },
  {
    id: 'crane-overhead-birdseye',
    name: "Overhead Crane Bird's-Eye",
    category: 'crane',
    description: 'High-altitude crane vantage point capturing the full undulating S-curve locomotion',
    calculate: (dragonTime, bass, head, _spine, _mouse, seed) => {
      const angle = dragonTime * 0.2 + seed * 0.2;
      return {
        position: new THREE.Vector3(
          head.x * 0.3 + Math.sin(angle) * 12,
          44 + bass * 4,
          head.z * 0.3 + Math.cos(angle) * 12
        ),
        target: new THREE.Vector3(head.x * 0.2, -1.0, head.z * 0.2),
        fov: 58,
        roll: Math.sin(dragonTime * 0.15) * 0.08,
        speed: 3.2,
      };
    },
  },
  {
    id: 'reverse-lead-front',
    name: 'Reverse Lead Tracking',
    category: 'reverse',
    description: 'High-velocity reverse tracking flying backward facing the head as the dragon lunges forward',
    calculate: (dragonTime, bass, head, _spine, mouse, seed) => {
      return {
        position: new THREE.Vector3(
          head.x + Math.sin(dragonTime * 0.5 + seed) * 4 + mouse.x * 3,
          head.y + 1.2 + bass * 1.5,
          head.z + 18.0
        ),
        target: new THREE.Vector3(head.x, head.y - 0.2, head.z),
        fov: 65,
        roll: -Math.sin(dragonTime * 0.5) * 0.08,
        speed: 5.4,
      };
    },
  },
  {
    id: 'macro-claw-talons',
    name: 'Articulated Talon & Rib Macro',
    category: 'macro',
    description: 'Extreme telephoto macro focus on articulated chrome claws and rib cage plates',
    calculate: (dragonTime, bass, head, spineSegments, _mouse, _seed) => {
      const segIndex = Math.min(8, spineSegments.length - 1);
      const seg = spineSegments[segIndex] ? spineSegments[segIndex].position : head;
      return {
        position: new THREE.Vector3(
          seg.x + 5.2,
          seg.y - 1.5 + Math.sin(dragonTime) * 0.8 + bass * 0.5,
          seg.z + 6.5
        ),
        target: new THREE.Vector3(seg.x, seg.y - 0.4, seg.z),
        fov: 42,
        roll: 0.05,
        speed: 4.6,
      };
    },
  },
  {
    id: 'dutch-angle-dynamic-slice',
    name: 'Dutch-Angle Dynamic Slice',
    category: 'dutch',
    description: 'Stylized cinematic Dutch tilt slice passing across the dragon spine at an 18° cant',
    calculate: (dragonTime, bass, head, _spine, _mouse, seed) => {
      const angle = dragonTime * 0.42 + seed;
      return {
        position: new THREE.Vector3(
          head.x + Math.sin(angle) * 26,
          head.y + 7.5 + bass * 2.5,
          head.z + Math.cos(angle) * 26
        ),
        target: new THREE.Vector3(head.x, head.y + 0.8, head.z),
        fov: 68,
        roll: 0.32,
        speed: 4.4,
      };
    },
  },
];

export class DragonScene {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;

  // Scene state
  private activeModule: ModuleType = 'lotus-enigma';
  private cameraMode: CameraMode = 'story-director';
  private storyStage: StoryStage = 'chase';
  private currentTheme: DragonColorTheme = COLOR_THEMES[0];
  private speedMultiplier = 1.0;
  private isDestroyed = false;
  private smileAmount = 0.0; // 0 (neutral) to 1.0 (full warm smile)

  // Cyber Dragon Hierarchy
  private dragonGroup = new THREE.Group();
  private numSegments = 54;
  private spineSegments: THREE.Group[] = [];
  private spineSpikes: THREE.Mesh[] = [];
  private spineNodes: THREE.Vector3[] = []; // Invariant IK backbone nodes
  private segSpacing = 1.35;

  // Dragon Head & Articulated Features
  private headGroup = new THREE.Group();
  private jawGroup = new THREE.Group();
  private jawMesh!: THREE.Mesh;
  private leftEyeHousing!: THREE.Mesh;
  private rightEyeHousing!: THREE.Mesh;
  private leftEye!: THREE.Mesh;
  private rightEye!: THREE.Mesh;
  private smileCheekLeft!: THREE.Mesh;
  private smileCheekRight!: THREE.Mesh;
  private butterflyLandingBeacon!: THREE.Mesh;
  private butterflyBeaconRing!: THREE.Mesh;
  private neckSleeveVertebrae: THREE.Mesh[] = [];

  // Whiskers (Left & Right)
  private leftWhiskerLine!: THREE.Line;
  private rightWhiskerLine!: THREE.Line;
  private leftWhiskerPoints: THREE.Vector3[] = [];
  private rightWhiskerPoints: THREE.Vector3[] = [];

  // Claws (Limbs)
  private claws: THREE.Group[] = [];

  // Smile Joy Hearts / Star Sparkles
  private heartSmileParticles!: THREE.Points;
  private heartSmilePositions!: Float32Array;
  private heartSmileLifes!: Float32Array;
  private numHeartParticles = 140;

  // Module 1: The Lotus Enigma
  private lotusGroup = new THREE.Group();
  private lotusOuterPetals: THREE.Mesh[] = [];
  private lotusInnerPetals: THREE.Mesh[] = [];
  private lotusCoreStamens: THREE.Mesh[] = [];
  private lotusPondPad!: THREE.Mesh;
  private lotusCradleRing!: THREE.Mesh;
  private lotusGlowLight!: THREE.PointLight;

  // The Cyber Butterfly
  private butterflyGroup = new THREE.Group();
  private butterflyWingLeft!: THREE.Group;
  private butterflyWingRight!: THREE.Group;
  private butterflyGlowLight!: THREE.PointLight;
  private butterflySmileIndicator!: THREE.Mesh;
  private butterflyTrailPositions!: Float32Array;
  private butterflyTrailLine!: THREE.Line;
  private butterflyTrailHistory: THREE.Vector3[] = [];
  private butterflyPos = new THREE.Vector3(0, 10, 0);

  // Ribbon Trail
  private trailGeometry!: THREE.BufferGeometry;
  private trailPositions!: Float32Array;
  private trailLine!: THREE.Line;
  private trailHistory: THREE.Vector3[] = [];
  private maxTrailPoints = 140;

  // Particle Fire / Breath
  private breathParticles!: THREE.Points;
  private breathPositions!: Float32Array;
  private breathVelocities!: Float32Array;
  private breathLifes!: Float32Array;
  private numBreathParticles = 1200;

  // Ambient Dust
  private dustParticles!: THREE.Points;
  private dustPositions!: Float32Array;
  private numDust = 1500;

  // Module 2: Cyber Vortex Tunnel
  private vortexGroup = new THREE.Group();
  private vortexRings: THREE.Mesh[] = [];

  // Module 3: Audio Monolith
  private monolithGroup = new THREE.Group();
  private monolithCore!: THREE.Mesh;
  private monolithRings: THREE.Mesh[] = [];
  private monolithBars: THREE.Mesh[] = [];

  // Module 4: Scales Macro
  private macroGroup = new THREE.Group();
  private macroPlates: THREE.Mesh[] = [];

  // Subtle Animated Background Fog Layer (Scrolling Purple & Cyan Hues)
  private bgFogDome!: THREE.Mesh;
  private bgFogMaterial!: THREE.ShaderMaterial;
  private bgFogGroup = new THREE.Group();
  private volumetricFogWisps: THREE.Mesh[] = [];
  private wispData: {
    speed: number;
    radius: number;
    angle: number;
    yBase: number;
    wobbleSpeed: number;
    baseOpacity: number;
    baseScale: number;
  }[] = [];
  private fogRadialTexture: THREE.CanvasTexture | null = null;
  private audioBassSmoothed = 0.0;
  private fogIntensity = 1.0;

  // Lighting
  private dirLight!: THREE.DirectionalLight;
  private pointLightHead!: THREE.PointLight;
  private ambientLight!: THREE.AmbientLight;
  private rimLight!: THREE.PointLight;

  // Animation & Motion state
  private clock = new THREE.Clock();
  private dragonTime = 0;
  private mouse = { x: 0, y: 0, targetX: 0, targetY: 0, isDown: false };
  private cameraTarget = new THREE.Vector3(0, 0, 0);

  // Randomized Cinematic Camera State (Bass-triggered viewpoints)
  private activeViewpointIndex = 0;
  private lastCinematicSwitchTime = 0;
  private lastBassSample = 0;
  private currentCameraRoll = 0;
  private targetCameraRoll = 0;
  private targetCameraFov = 60;
  private viewpointSeed = 0;
  private activeViewpointName = 'Orbital 360° Wide Sweep';
  public onCinematicViewpointChange?: (info: {
    id: string;
    name: string;
    trigger: 'bass-peak' | 'cadence' | 'manual';
    bass: number;
  }) => void;

  // Materials for live theme updates
  private scaleMaterial!: THREE.MeshStandardMaterial;
  private darkChassisMaterial!: THREE.MeshStandardMaterial;
  private neckCollarMaterial!: THREE.MeshStandardMaterial;
  private circuitMaterial!: THREE.MeshBasicMaterial;
  private chromeTeethMaterial!: THREE.MeshStandardMaterial;
  private spikeMaterial!: THREE.MeshStandardMaterial;
  private hornMaterial!: THREE.MeshStandardMaterial;
  private eyeMaterial!: THREE.MeshBasicMaterial;
  private trailMaterial!: THREE.LineBasicMaterial;
  private breathMaterial!: THREE.PointsMaterial;

  // Real-time Bass-Reactive Spikes & Emissive Textures
  private cranialSpikes: THREE.Mesh[] = [];
  private scaleEmissiveTexture: THREE.CanvasTexture | null = null;
  private spikeEmissiveTexture: THREE.CanvasTexture | null = null;
  private chassisEmissiveTexture: THREE.CanvasTexture | null = null;
  private spikeScaleMultiplier = 1.0;
  private textureEmissionMultiplier = 1.0;

  // Real-time Cyber Spike Explosion Particle System
  private explosionParticles!: THREE.Points;
  private explosionGeometry!: THREE.BufferGeometry;
  private explosionMaterial!: THREE.ShaderMaterial;
  private explosionPositions!: Float32Array;
  private explosionColors!: Float32Array;
  private explosionSizes!: Float32Array;
  private explosionAlphas!: Float32Array;
  private explosionVelocities: { x: number; y: number; z: number; drag: number }[] = [];
  private explosionLifes!: Float32Array;
  private explosionMaxLifes!: Float32Array;
  private maxExplosionParticles = 2400;
  private nextExplosionIndex = 0;
  private explosionTexture: THREE.CanvasTexture | null = null;
  private lastSpikeExplosionTime = 0;
  private spikeExplosionCooldown = 0.22;
  public onSpikeExplosion?: (intensity: number) => void;

  // Real-time Dynamic Chromatic Aberration & Cyber Bloom Post-Processing Pass
  private postScene!: THREE.Scene;
  private postCamera!: THREE.OrthographicCamera;
  private postMaterial!: THREE.ShaderMaterial;
  private postQuad!: THREE.Mesh;
  private renderTarget!: THREE.WebGLRenderTarget;
  private chromaticAberrationAmount = 0.0;
  private targetChromaticAberration = 0.0;
  private chromaticGlitchIntensity = 0.0;
  private chromaticAberrationMultiplier = 1.0;
  private isChromaticAberrationEnabled = true;
  private bloomIntensity = 1.25;

  // =========================================================================
  // DRAGON9 MPEG-4 EXPORT PIPELINE STATE
  // =========================================================================
  private isRecordingVideo = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private exportCanvas: HTMLCanvasElement | null = null;
  private exportCtx: CanvasRenderingContext2D | null = null;
  private recordingStartTime = 0;
  private activeExportConfig: Dragon9ExportConfig | null = null;
  private exportWatermarkEnabled = true;
  private exportWatermarkText = 'Dragon9 with Raw Power';
  private exportWatermarkPos: WatermarkPosition = 'bottom-right';
  private exportStopResolver: ((res: Dragon9ExportResult) => void) | null = null;
  private exportStopRejecter: ((err: Error) => void) | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Renderer Setup (preserveDrawingBuffer enabled for high-fidelity MPEG-4 stream capture)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 2. Scene & Fog Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.currentTheme.bgFog);
    this.scene.fog = new THREE.FogExp2(this.currentTheme.bgFog, 0.012);

    // 3. Perspective Camera
    this.camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    this.camera.position.set(0, 15, 45);

    // 4. Lights
    this.setupLights();

    // 5. Build Shared Materials
    this.setupMaterials();

    // 6. Build Cyber Dragon Model (Fine Mecha Anatomy)
    this.buildCyberDragon();

    // 7. Build Ambient Particle Dust & Cyber Spike Explosion System
    this.buildDust();
    this.buildSpikeExplosionSystem();

    // 7.5 Build Animated Background Fog Layer (Scrolling Purple & Cyan Hues)
    this.buildBackgroundFogLayer();

    // 8. Build Modules (Lotus Enigma, Butterfly, Smile Hearts, Vortex, Monolith, Macro)
    this.buildLotusEnigma();
    this.buildButterfly();
    this.buildSmileHearts();
    this.buildVortexModule();
    this.buildMonolithModule();
    this.buildMacroModule();

    // 8.5 Setup Dynamic Chromatic Aberration Post-Processing
    this.setupPostProcessing(width, height);

    // 9. Attach Event Listeners
    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('touchmove', this.onTouchMove, { passive: true });
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);

    // 10. Start Loop
    this.animate();
  }

  private setupLights() {
    this.ambientLight = new THREE.AmbientLight(this.currentTheme.ambientLight, 2.0);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 2.8);
    this.dirLight.position.set(30, 60, 40);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.scene.add(this.dirLight);

    this.rimLight = new THREE.PointLight(this.currentTheme.spineColor, 4.5, 130);
    this.rimLight.position.set(-30, -10, -20);
    this.scene.add(this.rimLight);

    // Dynamic Point light that rides inside dragon's head
    this.pointLightHead = new THREE.PointLight(this.currentTheme.eyeColor, 5.0, 40);
    this.pointLightHead.position.set(0, 1.0, 1.5);
    this.headGroup.add(this.pointLightHead);
  }

  private setupMaterials() {
    // Generate Procedural High-Tech Emissive Maps
    this.scaleEmissiveTexture = this.createScaleEmissiveTexture();
    this.spikeEmissiveTexture = this.createSpikeEmissiveTexture();
    this.chassisEmissiveTexture = this.createChassisEmissiveTexture();

    this.scaleMaterial = new THREE.MeshStandardMaterial({
      color: this.currentTheme.scaleColor,
      metalness: 0.94,
      roughness: 0.16,
      emissive: this.currentTheme.scaleColor,
      emissiveMap: this.scaleEmissiveTexture,
      emissiveIntensity: 0.38,
    });

    this.darkChassisMaterial = new THREE.MeshStandardMaterial({
      color: 0x090d1a,
      metalness: 0.98,
      roughness: 0.12,
      emissive: 0x030612,
      emissiveMap: this.chassisEmissiveTexture,
      emissiveIntensity: 0.25,
    });

    this.neckCollarMaterial = new THREE.MeshStandardMaterial({
      color: 0x111628,
      metalness: 0.95,
      roughness: 0.14,
      emissive: this.currentTheme.scaleColor,
      emissiveMap: this.scaleEmissiveTexture,
      emissiveIntensity: 0.22,
    });

    this.circuitMaterial = new THREE.MeshBasicMaterial({
      color: this.currentTheme.scaleColor,
    });

    this.chromeTeethMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.04,
      emissive: this.currentTheme.eyeColor,
      emissiveIntensity: 0.35,
    });

    this.spikeMaterial = new THREE.MeshStandardMaterial({
      color: this.currentTheme.spineColor,
      metalness: 0.55,
      roughness: 0.12,
      emissive: this.currentTheme.spineColor,
      emissiveMap: this.spikeEmissiveTexture,
      emissiveIntensity: 1.3,
    });

    this.hornMaterial = new THREE.MeshStandardMaterial({
      color: 0x0d1020,
      metalness: 0.96,
      roughness: 0.08,
      emissive: this.currentTheme.glowColor,
      emissiveMap: this.spikeEmissiveTexture,
      emissiveIntensity: 0.55,
    });

    this.eyeMaterial = new THREE.MeshBasicMaterial({
      color: this.currentTheme.eyeColor,
    });

    this.trailMaterial = new THREE.LineBasicMaterial({
      color: this.currentTheme.trailColor,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      linewidth: 2,
    });

    this.breathMaterial = new THREE.PointsMaterial({
      color: this.currentTheme.eyeColor,
      size: 0.85,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }

  // =========================================================================
  // PROCEDURAL CYBERNETIC EMISSIVE TEXTURE GENERATORS
  // =========================================================================
  private createScaleEmissiveTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 512, 512);

      // Hexagonal armor cell pattern
      const hexRadius = 28;
      const h = hexRadius * Math.sqrt(3);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.0;

      for (let y = -h; y < 512 + h * 2; y += h) {
        for (let x = -hexRadius * 3; x < 512 + hexRadius * 3; x += hexRadius * 3) {
          this.drawHexagon(ctx, x, y, hexRadius);
          this.drawHexagon(ctx, x + hexRadius * 1.5, y + h / 2, hexRadius);
        }
      }

      // Glowing circuit nodes & traces
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 36; i++) {
        const cx = (i * 79) % 512;
        const cy = (i * 113) % 512;
        ctx.beginPath();
        ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + ((i % 4) - 1.5) * 30, cy + ((i % 3) - 1) * 30);
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 3);
    return tex;
  }

  private drawHexagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  private createSpikeEmissiveTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#040404';
      ctx.fillRect(0, 0, 256, 512);

      // Crystalline vertical energy gradient
      const grad = ctx.createLinearGradient(0, 512, 0, 0);
      grad.addColorStop(0, 'rgba(80, 80, 80, 0.25)');
      grad.addColorStop(0.5, 'rgba(210, 210, 210, 0.7)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 1.0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 512);

      // Energy strata line slices
      ctx.strokeStyle = '#ffffff';
      for (let y = 8; y < 512; y += 14) {
        ctx.lineWidth = y % 42 === 0 ? 3.0 : 1.2;
        ctx.beginPath();
        ctx.moveTo(24, y);
        ctx.lineTo(232, y);
        ctx.stroke();
      }

      // Central core laser spline
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(128, 512);
      ctx.lineTo(128, 0);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 2);
    return tex;
  }

  private createChassisEmissiveTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 512, 512);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.0;

      // Angular mecha armor seams
      for (let x = 0; x < 512; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 32, 256);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }

      for (let y = 0; y < 512; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }

  // ==========================================
  // FINE CYBER DRAGON ANATOMY
  // Guaranteed Gapless & Cohesive Mecha Architecture
  // ==========================================
  private buildCyberDragon() {
    this.dragonGroup = new THREE.Group();
    this.scene.add(this.dragonGroup);

    // 1. Build Fine Cyber Head
    this.buildCyberHead();
    this.dragonGroup.add(this.headGroup);

    // 2. Initialize Invariant Spine Backbone Chain
    // Segment 0 will ALWAYS be locked directly to the rear neck socket of the head
    this.spineNodes = [];
    const headInit = new THREE.Vector3(0, 0, 0);
    for (let i = 0; i < this.numSegments; i++) {
      this.spineNodes.push(new THREE.Vector3(headInit.x, headInit.y, headInit.z - (i + 1) * this.segSpacing));
    }

    // 3. Build 54 Fine Articulated Vertebrae
    // Each segment has overlapping armor plates that sleeve into the next, guaranteeing zero gaps
    const segCoreGeo = new THREE.CylinderGeometry(0.85, 1.25, 1.6, 6);
    segCoreGeo.rotateX(Math.PI / 2);

    const segFlangeGeo = new THREE.CylinderGeometry(1.22, 1.36, 0.65, 6);
    segFlangeGeo.rotateX(Math.PI / 2);

    const ventralGeo = new THREE.BoxGeometry(0.38, 0.24, 1.45);
    const spikeGeo = new THREE.ConeGeometry(0.36, 2.1, 4);
    spikeGeo.rotateX(-Math.PI / 4);

    for (let i = 0; i < this.numSegments; i++) {
      const taper = 1.0 - (i / this.numSegments) * 0.82; // Sleek taper to tail
      const segmentGroup = new THREE.Group();

      // Main faceted armor carapace
      const coreMesh = new THREE.Mesh(segCoreGeo, this.scaleMaterial);
      coreMesh.scale.set(taper * 1.35, taper * 1.15, taper * 1.4);
      coreMesh.castShadow = true;
      coreMesh.receiveShadow = true;
      segmentGroup.add(coreMesh);

      // Overlapping Rear Armor Flange (Sleeves into the next vertebra so no gap can appear)
      const flangeMesh = new THREE.Mesh(segFlangeGeo, this.neckCollarMaterial);
      flangeMesh.scale.set(taper * 1.42, taper * 1.22, taper * 1.35);
      flangeMesh.position.set(0, 0, -0.45 * taper);
      segmentGroup.add(flangeMesh);

      // Ventral neon power conduit on belly
      const ventral = new THREE.Mesh(ventralGeo, this.circuitMaterial);
      ventral.position.set(0, -0.68 * taper, 0);
      ventral.scale.set(taper, taper, taper);
      segmentGroup.add(ventral);

      // Audio-reactive Crystalline Dorsal Fin / Energy Spike
      const spike = new THREE.Mesh(spikeGeo, this.spikeMaterial);
      spike.position.set(0, 1.18 * taper, 0);
      const baseScale = new THREE.Vector3(taper * 1.1, taper * (1.1 + (i % 3) * 0.35), taper * 1.1);
      spike.scale.copy(baseScale);
      spike.userData = { baseScale, segIndex: i };
      segmentGroup.add(spike);
      this.spineSpikes.push(spike);

      this.dragonGroup.add(segmentGroup);
      this.spineSegments.push(segmentGroup);
    }

    // 4. Claws (Limbs) along body
    this.buildDragonClaws();

    // 5. Whiskers (Left & Right)
    this.buildWhiskers();

    // 6. Fluid Ribbon Trail
    this.buildTrail();

    // 7. Fire / Breath Particle Aura
    this.buildBreathParticles();
  }

  // High-Fidelity Cyber Dragon Cranium, Visors & Jaw
  private buildCyberHead() {
    this.headGroup = new THREE.Group();

    // 1. Telescoping Neck Collar Sleeves (Sleeves seamlessly into segment 0)
    // 4 overlapping cybernetic rings anchored to the head base
    const neckBase = new THREE.Group();
    neckBase.position.set(0, 0, -0.5);

    for (let c = 0; c < 4; c++) {
      const radius = 1.45 - c * 0.08;
      const collarGeo = new THREE.CylinderGeometry(radius * 0.9, radius, 0.7, 6);
      collarGeo.rotateX(Math.PI / 2);
      const collarMesh = new THREE.Mesh(collarGeo, c % 2 === 0 ? this.neckCollarMaterial : this.scaleMaterial);
      collarMesh.position.set(0, -c * 0.06, -c * 0.55);
      neckBase.add(collarMesh);
      this.neckSleeveVertebrae.push(collarMesh);
    }
    this.headGroup.add(neckBase);

    // 2. Main Cyber Skull Chassis (Stealth angular mecha geometry)
    const craniumGeo = new THREE.CylinderGeometry(1.0, 1.7, 3.4, 6);
    craniumGeo.rotateX(Math.PI / 2);
    const craniumMesh = new THREE.Mesh(craniumGeo, this.darkChassisMaterial);
    craniumMesh.position.set(0, 0.15, 1.0);
    craniumMesh.castShadow = true;
    this.headGroup.add(craniumMesh);

    // Angular brow cowl & upper cranial armor
    const browGeo = new THREE.ConeGeometry(1.5, 3.2, 5);
    browGeo.rotateX(Math.PI / 2);
    const browMesh = new THREE.Mesh(browGeo, this.scaleMaterial);
    browMesh.position.set(0, 0.42, 1.2);
    browMesh.scale.set(1.05, 0.75, 1.05);
    browMesh.castShadow = true;
    this.headGroup.add(browMesh);

    // Fine Snout Ridge & Nasal Bridge
    const snoutGeo = new THREE.BoxGeometry(1.15, 0.65, 2.8);
    const snoutMesh = new THREE.Mesh(snoutGeo, this.scaleMaterial);
    snoutMesh.position.set(0, 0.24, 2.5);
    this.headGroup.add(snoutMesh);

    // Central Snout Circuit Inlay
    const circuitGeo = new THREE.BoxGeometry(0.18, 0.1, 2.6);
    const circuitStrip = new THREE.Mesh(circuitGeo, this.circuitMaterial);
    circuitStrip.position.set(0, 0.58, 2.5);
    this.headGroup.add(circuitStrip);

    // Sleek Nose Tip
    const noseTipGeo = new THREE.BoxGeometry(0.85, 0.46, 0.75);
    const noseTip = new THREE.Mesh(noseTipGeo, this.darkChassisMaterial);
    noseTip.position.set(0, 0.18, 3.8);
    this.headGroup.add(noseTip);

    // 3. Butterfly Landing Pad Beacon on Dragon Snout
    // Concentric holographic dock where the cyber butterfly perches
    const beaconGeo = new THREE.CylinderGeometry(0.36, 0.4, 0.08, 8);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    this.butterflyLandingBeacon = new THREE.Mesh(beaconGeo, beaconMat);
    this.butterflyLandingBeacon.position.set(0, 0.54, 3.3);
    this.headGroup.add(this.butterflyLandingBeacon);

    const ringGeo = new THREE.RingGeometry(0.48, 0.56, 16);
    ringGeo.rotateX(-Math.PI / 2);
    this.butterflyBeaconRing = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
    );
    this.butterflyBeaconRing.position.set(0, 0.55, 3.3);
    this.headGroup.add(this.butterflyBeaconRing);

    // Upper Chrome Fangs
    const fangGeo = new THREE.ConeGeometry(0.08, 0.45, 4);
    fangGeo.rotateX(Math.PI);
    for (let f = 0; f < 5; f++) {
      const zPos = 2.0 + f * 0.32;
      const xPos = 0.52 - f * 0.05;
      const fangL = new THREE.Mesh(fangGeo, this.chromeTeethMaterial);
      fangL.position.set(xPos, -0.08, zPos);
      this.headGroup.add(fangL);

      const fangR = new THREE.Mesh(fangGeo, this.chromeTeethMaterial);
      fangR.position.set(-xPos, -0.08, zPos);
      this.headGroup.add(fangR);
    }

    // 4. Articulated Mecha Lower Mandible (Jaw)
    // Mounted on side ball-and-socket hinges so it articulates cleanly without clipping
    this.jawGroup = new THREE.Group();
    this.jawGroup.position.set(0, -0.25, 0.3); // anatomical pivot
    this.headGroup.add(this.jawGroup);

    // Hinge Pivot Cylinders
    const hingeGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.28, 8);
    hingeGeo.rotateZ(Math.PI / 2);
    const hingeL = new THREE.Mesh(hingeGeo, this.neckCollarMaterial);
    hingeL.position.set(1.0, 0, 0);
    this.jawGroup.add(hingeL);

    const hingeR = new THREE.Mesh(hingeGeo, this.neckCollarMaterial);
    hingeR.position.set(-1.0, 0, 0);
    this.jawGroup.add(hingeR);

    // Mandible Hull
    const jawHullGeo = new THREE.BoxGeometry(0.96, 0.44, 2.7);
    this.jawMesh = new THREE.Mesh(jawHullGeo, this.darkChassisMaterial);
    this.jawMesh.position.set(0, -0.16, 1.35);
    this.jawGroup.add(this.jawMesh);

    // Chin Armor Plate
    const chinGeo = new THREE.ConeGeometry(0.58, 1.7, 5);
    chinGeo.rotateX(Math.PI / 2);
    const chin = new THREE.Mesh(chinGeo, this.scaleMaterial);
    chin.position.set(0, -0.28, 2.2);
    this.jawGroup.add(chin);

    // Lower Cyber Fangs
    const lowerFangGeo = new THREE.ConeGeometry(0.08, 0.4, 4);
    for (let f = 0; f < 4; f++) {
      const zPos = 0.85 + f * 0.35;
      const xPos = 0.44 - f * 0.05;
      const lFangL = new THREE.Mesh(lowerFangGeo, this.chromeTeethMaterial);
      lFangL.position.set(xPos, 0.12, zPos);
      this.jawGroup.add(lFangL);

      const lFangR = new THREE.Mesh(lowerFangGeo, this.chromeTeethMaterial);
      lFangR.position.set(-xPos, 0.12, zPos);
      this.jawGroup.add(lFangR);
    }

    // 5. Faceted Optic Sensor Eyes & Visor Housings
    const eyeHousingGeo = new THREE.BoxGeometry(0.52, 0.28, 0.9);
    this.leftEyeHousing = new THREE.Mesh(eyeHousingGeo, this.darkChassisMaterial);
    this.leftEyeHousing.position.set(0.96, 0.52, 1.65);
    this.leftEyeHousing.rotation.y = 0.35;
    this.leftEyeHousing.rotation.z = -0.18;
    this.headGroup.add(this.leftEyeHousing);

    this.rightEyeHousing = new THREE.Mesh(eyeHousingGeo, this.darkChassisMaterial);
    this.rightEyeHousing.position.set(-0.96, 0.52, 1.65);
    this.rightEyeHousing.rotation.y = -0.35;
    this.rightEyeHousing.rotation.z = 0.18;
    this.headGroup.add(this.rightEyeHousing);

    const eyeGeo = new THREE.BoxGeometry(0.42, 0.2, 0.8);
    this.leftEye = new THREE.Mesh(eyeGeo, this.eyeMaterial);
    this.leftEye.position.set(1.0, 0.53, 1.68);
    this.leftEye.rotation.y = 0.35;
    this.leftEye.rotation.z = -0.18;
    this.headGroup.add(this.leftEye);

    this.rightEye = new THREE.Mesh(eyeGeo, this.eyeMaterial);
    this.rightEye.position.set(-1.0, 0.53, 1.68);
    this.rightEye.rotation.y = -0.35;
    this.rightEye.rotation.z = 0.18;
    this.headGroup.add(this.rightEye);

    // 6. Cheek Heat-Sink Blushes (Pulse warmly when smiling)
    const cheekGeo = new THREE.BoxGeometry(0.38, 0.15, 0.65);
    const cheekMat = new THREE.MeshStandardMaterial({
      color: 0xff2a85,
      emissive: 0xff2a85,
      emissiveIntensity: 0.1,
      roughness: 0.2,
      metalness: 0.8,
    });
    this.smileCheekLeft = new THREE.Mesh(cheekGeo, cheekMat);
    this.smileCheekLeft.position.set(0.92, -0.04, 2.0);
    this.smileCheekLeft.rotation.z = 0.22;
    this.headGroup.add(this.smileCheekLeft);

    this.smileCheekRight = new THREE.Mesh(cheekGeo, cheekMat.clone());
    this.smileCheekRight.position.set(-0.92, -0.04, 2.0);
    this.smileCheekRight.rotation.z = -0.22;
    this.headGroup.add(this.smileCheekRight);

    // 7. Quad Swept-Back Cyber Horns with Luminous Heat-Dissipating Vanes
    this.cranialSpikes = [];
    const hornGeo = new THREE.ConeGeometry(0.34, 3.8, 5);
    hornGeo.rotateX(-Math.PI / 5);

    const leftHorn = new THREE.Mesh(hornGeo, this.hornMaterial);
    leftHorn.position.set(0.88, 1.2, -0.5);
    leftHorn.rotation.z = -0.32;
    leftHorn.rotation.y = 0.18;
    leftHorn.userData = { baseScale: leftHorn.scale.clone() };
    this.headGroup.add(leftHorn);
    this.cranialSpikes.push(leftHorn);

    const rightHorn = new THREE.Mesh(hornGeo, this.hornMaterial);
    rightHorn.position.set(-0.88, 1.2, -0.5);
    rightHorn.rotation.z = 0.32;
    rightHorn.rotation.y = -0.18;
    rightHorn.userData = { baseScale: rightHorn.scale.clone() };
    this.headGroup.add(rightHorn);
    this.cranialSpikes.push(rightHorn);

    // Luminous Horn Fins
    const hornFinGeo = new THREE.BoxGeometry(0.08, 0.42, 2.5);
    hornFinGeo.rotateX(-Math.PI / 5);
    const leftFin = new THREE.Mesh(hornFinGeo, this.spikeMaterial);
    leftFin.position.set(0.92, 1.4, -0.4);
    leftFin.rotation.z = -0.32;
    leftFin.userData = { baseScale: leftFin.scale.clone() };
    this.headGroup.add(leftFin);
    this.cranialSpikes.push(leftFin);

    const rightFin = new THREE.Mesh(hornFinGeo, this.spikeMaterial);
    rightFin.position.set(-0.92, 1.4, -0.4);
    rightFin.rotation.z = 0.32;
    rightFin.userData = { baseScale: rightFin.scale.clone() };
    this.headGroup.add(rightFin);
    this.cranialSpikes.push(rightFin);

    // Secondary Cheek Canards
    const subHornGeo = new THREE.ConeGeometry(0.22, 1.9, 4);
    const leftSub = new THREE.Mesh(subHornGeo, this.hornMaterial);
    leftSub.position.set(1.38, 0.38, -0.2);
    leftSub.rotation.z = -0.65;
    leftSub.userData = { baseScale: leftSub.scale.clone() };
    this.headGroup.add(leftSub);
    this.cranialSpikes.push(leftSub);

    const rightSub = new THREE.Mesh(subHornGeo, this.hornMaterial);
    rightSub.position.set(-1.38, 0.38, -0.2);
    rightSub.rotation.z = 0.65;
    rightSub.userData = { baseScale: rightSub.scale.clone() };
    this.headGroup.add(rightSub);
    this.cranialSpikes.push(rightSub);
  }

  // 4 Articulated Claws (Limbs)
  private buildDragonClaws() {
    const legIndices = [9, 18, 30, 42];
    const limbMat = this.scaleMaterial;

    for (let i = 0; i < 4; i++) {
      const isLeft = i % 2 === 0;
      const legGroup = new THREE.Group();

      // Upper arm strut
      const upperGeo = new THREE.CylinderGeometry(0.32, 0.42, 2.4, 5);
      const upper = new THREE.Mesh(upperGeo, limbMat);
      upper.position.set(isLeft ? 1.45 : -1.45, -0.5, 0);
      upper.rotation.z = isLeft ? -0.5 : 0.5;
      legGroup.add(upper);

      // Hydraulic joint cuff
      const jointGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.4, 8);
      jointGeo.rotateX(Math.PI / 2);
      const joint = new THREE.Mesh(jointGeo, this.neckCollarMaterial);
      joint.position.set(isLeft ? 2.0 : -2.0, -1.3, 0.2);
      legGroup.add(joint);

      // Forearm with chrome talons
      const pawGeo = new THREE.ConeGeometry(0.42, 1.3, 4);
      pawGeo.rotateX(Math.PI / 2);
      const paw = new THREE.Mesh(pawGeo, this.hornMaterial);
      paw.position.set(isLeft ? 2.5 : -2.5, -1.9, 0.6);
      legGroup.add(paw);

      const parentSegment = this.spineSegments[legIndices[i]];
      if (parentSegment) {
        parentSegment.add(legGroup);
        this.claws.push(legGroup);
      }
    }
  }

  // Cybernetic Flowing Whiskers
  private buildWhiskers() {
    const numPoints = 16;
    this.leftWhiskerPoints = [];
    this.rightWhiskerPoints = [];

    for (let i = 0; i < numPoints; i++) {
      this.leftWhiskerPoints.push(new THREE.Vector3(0.85 + i * 0.35, -i * 0.1, 3.6 - i * 0.4));
      this.rightWhiskerPoints.push(new THREE.Vector3(-0.85 - i * 0.35, -i * 0.1, 3.6 - i * 0.4));
    }

    const leftGeo = new THREE.BufferGeometry().setFromPoints(this.leftWhiskerPoints);
    this.leftWhiskerLine = new THREE.Line(leftGeo, this.trailMaterial);
    this.headGroup.add(this.leftWhiskerLine);

    const rightGeo = new THREE.BufferGeometry().setFromPoints(this.rightWhiskerPoints);
    this.rightWhiskerLine = new THREE.Line(rightGeo, this.trailMaterial);
    this.headGroup.add(this.rightWhiskerLine);
  }

  // Ribbon Trail
  private buildTrail() {
    this.trailGeometry = new THREE.BufferGeometry();
    this.trailPositions = new Float32Array(this.maxTrailPoints * 3);
    this.trailGeometry.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3));
    this.trailLine = new THREE.Line(this.trailGeometry, this.trailMaterial);
    this.scene.add(this.trailLine);
  }

  // Fire / Breath Particle Aura
  private buildBreathParticles() {
    this.breathPositions = new Float32Array(this.numBreathParticles * 3);
    this.breathVelocities = new Float32Array(this.numBreathParticles * 3);
    this.breathLifes = new Float32Array(this.numBreathParticles);

    for (let i = 0; i < this.numBreathParticles; i++) {
      this.resetBreathParticle(i);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.breathPositions, 3));
    this.breathParticles = new THREE.Points(geo, this.breathMaterial);
    this.scene.add(this.breathParticles);
  }

  private resetBreathParticle(index: number) {
    const i3 = index * 3;
    this.breathPositions[i3] = this.headGroup.position.x + (Math.random() - 0.5) * 0.6;
    this.breathPositions[i3 + 1] = this.headGroup.position.y - 0.4 + (Math.random() - 0.5) * 0.6;
    this.breathPositions[i3 + 2] = this.headGroup.position.z + 3.0 + (Math.random() - 0.5) * 0.6;

    this.breathVelocities[i3] = (Math.random() - 0.5) * 0.4;
    this.breathVelocities[i3 + 1] = (Math.random() - 0.5) * 0.4;
    this.breathVelocities[i3 + 2] = 0.8 + Math.random() * 0.9;

    this.breathLifes[index] = 0.05 + Math.random() * 0.95;
  }

  // Ambient Dust
  private buildDust() {
    this.dustPositions = new Float32Array(this.numDust * 3);
    for (let i = 0; i < this.numDust * 3; i += 3) {
      this.dustPositions[i] = (Math.random() - 0.5) * 140;
      this.dustPositions[i + 1] = (Math.random() - 0.5) * 90;
      this.dustPositions[i + 2] = (Math.random() - 0.5) * 140;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.dustPositions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x66ccff,
      size: 0.35,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    this.dustParticles = new THREE.Points(geo, mat);
    this.scene.add(this.dustParticles);
  }

  // ==========================================
  // REAL-TIME CYBER SPIKE EXPLOSION PARTICLE SYSTEM
  // Disperses luminous cyber-particles from dragon's spikes during highest bass peaks
  // ==========================================
  private createExplosionSparkTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Radial intense glowing core
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.18, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.42, 'rgba(220, 240, 255, 0.6)');
    grad.addColorStop(0.75, 'rgba(120, 180, 255, 0.18)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    // 4-point cyber diffraction spikes (cross flare)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(64, 8);
    ctx.lineTo(64, 120);
    ctx.moveTo(8, 64);
    ctx.lineTo(120, 64);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  private buildSpikeExplosionSystem() {
    this.explosionTexture = this.createExplosionSparkTexture();

    this.explosionPositions = new Float32Array(this.maxExplosionParticles * 3);
    this.explosionColors = new Float32Array(this.maxExplosionParticles * 3);
    this.explosionSizes = new Float32Array(this.maxExplosionParticles);
    this.explosionAlphas = new Float32Array(this.maxExplosionParticles);
    this.explosionLifes = new Float32Array(this.maxExplosionParticles);
    this.explosionMaxLifes = new Float32Array(this.maxExplosionParticles);
    this.explosionVelocities = [];

    for (let i = 0; i < this.maxExplosionParticles; i++) {
      const i3 = i * 3;
      this.explosionPositions[i3] = 0;
      this.explosionPositions[i3 + 1] = -9999;
      this.explosionPositions[i3 + 2] = 0;

      this.explosionColors[i3] = 0.0;
      this.explosionColors[i3 + 1] = 0.94;
      this.explosionColors[i3 + 2] = 1.0;

      this.explosionSizes[i] = 1.0;
      this.explosionAlphas[i] = 0.0;
      this.explosionLifes[i] = 0.0;
      this.explosionMaxLifes[i] = 1.0;

      this.explosionVelocities.push({ x: 0, y: 0, z: 0, drag: 0.94 });
    }

    this.explosionGeometry = new THREE.BufferGeometry();
    this.explosionGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.explosionPositions, 3)
    );
    this.explosionGeometry.setAttribute(
      'customColor',
      new THREE.BufferAttribute(this.explosionColors, 3)
    );
    this.explosionGeometry.setAttribute(
      'size',
      new THREE.BufferAttribute(this.explosionSizes, 1)
    );
    this.explosionGeometry.setAttribute(
      'alpha',
      new THREE.BufferAttribute(this.explosionAlphas, 1)
    );

    this.explosionMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: this.explosionTexture },
      },
      vertexShader: `
        attribute float size;
        attribute float alpha;
        attribute vec3 customColor;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = customColor;
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (340.0 / -mvPosition.z);
          gl_PointSize = clamp(gl_PointSize, 1.0, 110.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          if (vAlpha <= 0.002) discard;
          vec4 texColor = texture2D(uTexture, gl_PointCoord);
          vec3 outCol = vColor * texColor.rgb * 1.5;
          gl_FragColor = vec4(outCol, texColor.a * vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.explosionParticles = new THREE.Points(this.explosionGeometry, this.explosionMaterial);
    this.explosionParticles.renderOrder = 200;
    this.scene.add(this.explosionParticles);
  }

  /**
   * Triggers a burst of cyber-particles dispersing outwards from all
   * dorsal vertebrae spikes and cranial horns.
   */
  public triggerSpikeExplosion(intensity = 1.0) {
    const now = performance.now();
    if ((now - this.lastSpikeExplosionTime) / 1000 < this.spikeExplosionCooldown) {
      return;
    }
    this.lastSpikeExplosionTime = now;

    // 1. Gather all spike emitter points in world coordinates
    const emitters: { pos: THREE.Vector3; dir: THREE.Vector3; color: THREE.Color }[] = [];

    // Cranial swept-back horns & cheek canards
    for (let h = 0; h < this.cranialSpikes.length; h++) {
      const horn = this.cranialSpikes[h];
      const worldPos = new THREE.Vector3();
      horn.getWorldPosition(worldPos);

      const up = new THREE.Vector3(0, 1.2 * (horn.scale.y || 1.0), 0);
      up.applyQuaternion(this.headGroup.quaternion);
      worldPos.add(up);

      const emitDir = up.clone().normalize();
      emitters.push({
        pos: worldPos,
        dir: emitDir,
        color: new THREE.Color(this.currentTheme.glowColor),
      });
    }

    // Dorsal spine spikes along the dragon vertebrae
    const step = 2; // Step across vertebrae for high performance & broad dispersal
    for (let i = 0; i < this.spineSpikes.length; i += step) {
      const spike = this.spineSpikes[i];
      const segMesh = this.spineSegments[i];
      const worldPos = new THREE.Vector3();
      spike.getWorldPosition(worldPos);

      const normal = new THREE.Vector3(0, 1.4 * (spike.scale.y || 1.0), 0);
      if (segMesh) {
        normal.applyQuaternion(segMesh.quaternion);
      }
      worldPos.add(normal);

      const isAlternate = (i / step) % 2 === 0;
      const spikeColor = isAlternate
        ? new THREE.Color(this.currentTheme.spineColor)
        : new THREE.Color(this.currentTheme.scaleColor);

      emitters.push({
        pos: worldPos,
        dir: normal.normalize(),
        color: spikeColor,
      });
    }

    // 2. Disperse cyber-particles per emitter
    const particlesPerEmitter = Math.floor(THREE.MathUtils.lerp(12, 36, intensity));
    const speedBase = THREE.MathUtils.lerp(16.0, 38.0, intensity);

    for (let e = 0; e < emitters.length; e++) {
      const emitter = emitters[e];
      for (let p = 0; p < particlesPerEmitter; p++) {
        const idx = this.nextExplosionIndex;
        this.nextExplosionIndex = (this.nextExplosionIndex + 1) % this.maxExplosionParticles;

        const i3 = idx * 3;
        // Spawn with tiny jitter at the spike tip
        this.explosionPositions[i3] = emitter.pos.x + (Math.random() - 0.5) * 0.3;
        this.explosionPositions[i3 + 1] = emitter.pos.y + (Math.random() - 0.5) * 0.3;
        this.explosionPositions[i3 + 2] = emitter.pos.z + (Math.random() - 0.5) * 0.3;

        // Conical explosion blast trajectory away from spike normal
        const spread = 1.1;
        const vx = emitter.dir.x * speedBase + (Math.random() - 0.5) * speedBase * spread;
        const vy = emitter.dir.y * speedBase + (Math.random() * 0.8 + 0.2) * speedBase * spread;
        const vz = emitter.dir.z * speedBase + (Math.random() - 0.5) * speedBase * spread;

        const speedVar = 0.65 + Math.random() * 0.8;
        this.explosionVelocities[idx] = {
          x: vx * speedVar,
          y: vy * speedVar,
          z: vz * speedVar,
          drag: 0.92 + Math.random() * 0.05,
        };

        // Cyber neon color variation (theme hue, electric white core, plasma cyan, neon magenta)
        const pColor = emitter.color.clone();
        const rand = Math.random();
        if (rand > 0.7) {
          pColor.setRGB(1.0, 1.0, 1.0); // Super-intense white core spark
        } else if (rand > 0.45) {
          pColor.lerp(new THREE.Color(0x00f0ff), 0.75); // Vivid cyber cyan
        } else if (rand > 0.2) {
          pColor.lerp(new THREE.Color(0xff0077), 0.75); // Neon magenta flare
        }

        this.explosionColors[i3] = pColor.r;
        this.explosionColors[i3 + 1] = pColor.g;
        this.explosionColors[i3 + 2] = pColor.b;

        this.explosionSizes[idx] = THREE.MathUtils.lerp(2.2, 5.2, Math.random()) * intensity;
        this.explosionLifes[idx] = 1.0;
        this.explosionMaxLifes[idx] = THREE.MathUtils.lerp(0.5, 1.1, Math.random());
        this.explosionAlphas[idx] = 1.0;
      }
    }

    if (this.explosionGeometry) {
      this.explosionGeometry.attributes.position.needsUpdate = true;
      this.explosionGeometry.attributes.customColor.needsUpdate = true;
      this.explosionGeometry.attributes.size.needsUpdate = true;
      this.explosionGeometry.attributes.alpha.needsUpdate = true;
    }

    if (this.onSpikeExplosion) {
      this.onSpikeExplosion(intensity);
    }
  }

  // Update physics and fadeout for cyber spike explosion particles
  private updateSpikeExplosionParticles(delta: number) {
    if (!this.explosionGeometry) return;

    let hasActiveParticles = false;
    for (let i = 0; i < this.maxExplosionParticles; i++) {
      if (this.explosionLifes[i] > 0) {
        hasActiveParticles = true;
        const maxLife = this.explosionMaxLifes[i] || 1.0;
        this.explosionLifes[i] -= delta / maxLife;

        if (this.explosionLifes[i] <= 0) {
          this.explosionLifes[i] = 0;
          this.explosionAlphas[i] = 0;
          this.explosionPositions[i * 3 + 1] = -9999;
        } else {
          const life = this.explosionLifes[i];
          this.explosionAlphas[i] = Math.pow(life, 1.35); // Smooth quadratic dissipation

          const vel = this.explosionVelocities[i];
          const i3 = i * 3;

          this.explosionPositions[i3] += vel.x * delta;
          this.explosionPositions[i3 + 1] += vel.y * delta;
          this.explosionPositions[i3 + 2] += vel.z * delta;

          // Air resistance / drag
          const dragFactor = Math.pow(vel.drag, delta * 60);
          vel.x *= dragFactor;
          vel.y *= dragFactor;
          vel.z *= dragFactor;

          // Subtle thermal lift
          vel.y -= 2.0 * delta;

          // Gradual expansion of spark size as it diffuses
          this.explosionSizes[i] *= 1.0 + 0.25 * delta;
        }
      }
    }

    if (hasActiveParticles) {
      this.explosionGeometry.attributes.position.needsUpdate = true;
      this.explosionGeometry.attributes.alpha.needsUpdate = true;
      this.explosionGeometry.attributes.size.needsUpdate = true;
    }
  }

  // ==========================================
  // DYNAMIC CHROMATIC ABERRATION POST-PROCESSING PASS
  // Subtle radial RGB split that escalates into cybernetic channel distortion on bass peaks
  // ==========================================
  private setupPostProcessing(width: number, height: number) {
    const dpr = Math.min(window.devicePixelRatio, 2);
    this.renderTarget = new THREE.WebGLRenderTarget(
      Math.max(1, Math.floor(width * dpr)),
      Math.max(1, Math.floor(height * dpr)),
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        colorSpace: THREE.SRGBColorSpace,
      }
    );

    this.postScene = new THREE.Scene();
    this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.postMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: this.renderTarget.texture },
        uTime: { value: 0 },
        uBass: { value: 0 },
        uAberrationAmount: { value: 0 },
        uGlitchIntensity: { value: 0 },
        uBloomIntensity: { value: this.bloomIntensity },
        uResolution: { value: new THREE.Vector2(width * dpr, height * dpr) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform float uBass;
        uniform float uAberrationAmount;
        uniform float uGlitchIntensity;
        uniform float uBloomIntensity;
        uniform vec2 uResolution;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          vec2 center = vec2(0.5, 0.5);
          vec2 dir = uv - center;
          float dist = length(dir);

          // 1. Dynamic radial dispersion (expands quadratically towards frame corners)
          float baseDistortion = (0.0018 + uAberrationAmount * 0.026) * dist;

          // 2. High bass scanline micro-jitter for cybernetic raw power
          float glitchJitter = 0.0;
          if (uGlitchIntensity > 0.02) {
            float scanline = floor(uv.y * (uResolution.y * 0.25));
            float noise = sin(scanline * 0.35 + uTime * 48.0) * cos(scanline * 0.7 - uTime * 32.0);
            if (abs(noise) > 0.7) {
              glitchJitter = noise * 0.007 * uGlitchIntensity;
            }
          }

          // Directional RGB channel shifts
          vec2 redOffset = dir * baseDistortion + vec2(glitchJitter + uAberrationAmount * 0.004, 0.0);
          vec2 blueOffset = -dir * baseDistortion - vec2(glitchJitter + uAberrationAmount * 0.004, 0.0);

          float r = texture2D(tDiffuse, clamp(uv + redOffset, 0.0, 1.0)).r;
          float g = texture2D(tDiffuse, clamp(uv, 0.0, 1.0)).g;
          float b = texture2D(tDiffuse, clamp(uv + blueOffset, 0.0, 1.0)).b;
          float a = texture2D(tDiffuse, uv).a;

          // Base rendered color with chromatic aberration
          vec3 baseCol = vec3(r, g, b);

          // 3. Multi-tap Cyber Bloom Glow Pass (Extract highlights from dragon spines, optics & energy sparks)
          vec3 bloomAccum = vec3(0.0);
          float bloomWeight = 0.0;
          vec2 texelSize = vec2(1.0 / uResolution.x, 1.0 / uResolution.y) * 3.2;

          vec2 offsets[8];
          offsets[0] = vec2(-1.5, -1.5) * texelSize;
          offsets[1] = vec2( 1.5, -1.5) * texelSize;
          offsets[2] = vec2(-1.5,  1.5) * texelSize;
          offsets[3] = vec2( 1.5,  1.5) * texelSize;
          offsets[4] = vec2(-3.2,  0.0) * texelSize;
          offsets[5] = vec2( 3.2,  0.0) * texelSize;
          offsets[6] = vec2( 0.0, -3.2) * texelSize;
          offsets[7] = vec2( 0.0,  3.2) * texelSize;

          for (int i = 0; i < 8; i++) {
            vec3 sampleCol = texture2D(tDiffuse, clamp(uv + offsets[i], 0.0, 1.0)).rgb;
            float luma = dot(sampleCol, vec3(0.299, 0.587, 0.114));
            float thresholdLuma = max(0.0, luma - 0.38);
            if (thresholdLuma > 0.0) {
              bloomAccum += sampleCol * (thresholdLuma / (luma + 0.001));
              bloomWeight += 1.0;
            }
          }

          if (bloomWeight > 0.0) {
            bloomAccum /= bloomWeight;
            // Additive bloom aura with audio bass surge amplification
            baseCol += bloomAccum * (uBloomIntensity * 1.35 * (1.0 + uBass * 0.42));
          }

          // 4. Cybernetic vignette & contrast enhancement
          float vignette = 1.0 - smoothstep(0.45, 1.35, dist) * (0.12 + uBass * 0.16);
          vec3 col = baseCol * vignette;

          // 5. Subtle electric cyan/magenta fringe boost during peak sub-bass drops
          if (uBass > 0.72) {
            float surge = (uBass - 0.72) * 2.5;
            col += vec3(0.01, 0.04, 0.09) * surge * dist;
          }

          gl_FragColor = vec4(col, a);
        }
      `,
      depthTest: false,
      depthWrite: false,
    });

    this.postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMaterial);
    this.postScene.add(this.postQuad);
  }

  // ==========================================
  // ANIMATED BACKGROUND FOG LAYER
  // Scrolling Purple & Cyan Hues for Deep Immersion
  // ==========================================
  private createFogRadialTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
    grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.22)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  private buildBackgroundFogLayer() {
    this.bgFogGroup = new THREE.Group();
    this.scene.add(this.bgFogGroup);

    // 1. Inverted Infinite Background Sky Dome with Custom Scrolling Purple & Cyan Shader
    const domeGeo = new THREE.SphereGeometry(380, 48, 32);
    this.bgFogMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPurpleColor: { value: new THREE.Color(0x7928ca) }, // Vivid deep purple
        uCyanColor: { value: new THREE.Color(0x00f0ff) },   // Electric cyber cyan
        uDeepColor: { value: new THREE.Color(this.currentTheme.bgFog) },
        uBass: { value: 0 },
        uIntensity: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uPurpleColor;
        uniform vec3 uCyanColor;
        uniform vec3 uDeepColor;
        uniform float uBass;
        uniform float uIntensity;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        // Smooth wave flow for organic scrolling nebula mist
        float fogHarmonic(vec2 p, float speed, float freq) {
          float v = 0.0;
          v += sin(p.x * freq + uTime * speed) * cos(p.y * (freq * 0.85) + uTime * (speed * 0.72));
          v += sin(p.x * (freq * 1.65) - uTime * (speed * 1.08) + 1.6) * sin(p.y * (freq * 1.35) + uTime * (speed * 0.92));
          v += cos((p.x + p.y) * (freq * 2.4) + uTime * (speed * 1.25)) * 0.5;
          return v * 0.5 + 0.5;
        }

        void main() {
          vec2 uv = vUv;

          // Continuous dual-axis scrolling coordinates
          // Layer A: Purple nebula rolls slowly diagonally upwards-right
          vec2 uvPurple = vec2(uv.x * 2.8 + uTime * 0.016, uv.y * 1.8 - uTime * 0.009);
          // Layer B: Cyan energy current scrolls in opposition downwards-left
          vec2 uvCyan = vec2(uv.x * 3.5 - uTime * 0.022 + 0.4, uv.y * 2.3 + uTime * 0.012 + 0.2);

          float nPurple = fogHarmonic(uvPurple, 0.45, 2.2);
          float nCyan = fogHarmonic(uvCyan, 0.55, 2.7);

          // Billowing organic smoke thresholds
          float purpleDensity = smoothstep(0.24, 0.76, nPurple);
          float cyanDensity = smoothstep(0.26, 0.80, nCyan);

          // Atmospheric horizon gradient curve: peaks along equatorial horizon and softly dissipates at poles
          float horizon = sin(clamp(uv.y, 0.0, 1.0) * 3.14159);
          horizon = pow(horizon, 0.85);

          // Audio-reactive expansion
          float audioPulse = 1.0 + uBass * 0.4;

          // Deep void backdrop
          vec3 col = uDeepColor;

          // Layer 1: Scrolling subtle purple nebula mist
          vec3 purpleFog = uPurpleColor * (purpleDensity * 0.62 * horizon * audioPulse * uIntensity);
          col += purpleFog;

          // Layer 2: Scrolling luminous cyan fog filaments
          vec3 cyanFog = uCyanColor * (cyanDensity * 0.48 * horizon * audioPulse * uIntensity);
          col += cyanFog;

          // Layer 3: Intersecting harmonic glow where layers overlap
          float inter = purpleDensity * cyanDensity;
          col += vec3(0.25, 0.08, 0.38) * (inter * 0.4 * horizon * uIntensity);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });

    this.bgFogDome = new THREE.Mesh(domeGeo, this.bgFogMaterial);
    this.bgFogDome.renderOrder = -1000;
    this.bgFogGroup.add(this.bgFogDome);

    // 2. Midground 3D Volumetric Drifting Mist Wisps
    this.fogRadialTexture = this.createFogRadialTexture();
    const numWisps = 22;
    this.volumetricFogWisps = [];
    this.wispData = [];

    const wispGeo = new THREE.PlaneGeometry(1, 1);

    for (let i = 0; i < numWisps; i++) {
      const isCyan = i % 2 === 0;
      const colorHex = isCyan ? 0x00f0ff : 0x9d4edd;
      const baseOpacity = isCyan ? 0.09 : 0.12;

      const wispMat = new THREE.MeshBasicMaterial({
        map: this.fogRadialTexture,
        color: colorHex,
        transparent: true,
        opacity: baseOpacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      const wisp = new THREE.Mesh(wispGeo, wispMat);
      wisp.renderOrder = -500;

      // Position in 3D cylindrical space around scene
      const radius = 45 + (i / numWisps) * 75; // 45 to 120 radius
      const angle = (i / numWisps) * Math.PI * 2 + Math.random() * 0.5;
      const yBase = -12 + (i % 5) * 8.5; // -12 to 22 elevation
      const scale = 38 + Math.random() * 26; // 38 to 64 units wide

      wisp.position.set(Math.cos(angle) * radius, yBase, Math.sin(angle) * radius);
      wisp.scale.set(scale, scale, scale);

      this.bgFogGroup.add(wisp);
      this.volumetricFogWisps.push(wisp);

      this.wispData.push({
        speed: (0.04 + Math.random() * 0.06) * (i % 2 === 0 ? 1 : -1),
        radius,
        angle,
        yBase,
        wobbleSpeed: 0.3 + Math.random() * 0.4,
        baseOpacity,
        baseScale: scale,
      });
    }
  }

  private updateBackgroundFog(delta: number) {
    if (!this.bgFogMaterial || !this.bgFogDome) return;

    // 1. Keep the sky dome centered on camera so horizon never clips
    this.bgFogDome.position.copy(this.camera.position);

    // 2. Advance scrolling shader time uniform
    this.bgFogMaterial.uniforms.uTime.value = this.dragonTime;

    // 3. Smooth decay of bass uniform
    const currentBass = this.bgFogMaterial.uniforms.uBass.value;
    this.bgFogMaterial.uniforms.uBass.value += (this.audioBassSmoothed - currentBass) * 0.15;
    this.audioBassSmoothed *= 0.94; // natural decay

    // 4. Update Midground 3D Volumetric Mist Wisps
    const t = this.dragonTime;
    const pulseScale = 1.0 + this.bgFogMaterial.uniforms.uBass.value * 0.22;

    for (let i = 0; i < this.volumetricFogWisps.length; i++) {
      const wisp = this.volumetricFogWisps[i];
      const data = this.wispData[i];

      // Orbit and lateral drift
      data.angle += data.speed * delta * this.speedMultiplier;
      const x = Math.cos(data.angle) * data.radius;
      const z = Math.sin(data.angle) * data.radius;
      const y = data.yBase + Math.sin(t * data.wobbleSpeed + i) * 3.5;

      wisp.position.set(x, y, z);

      // Face camera for volumetric billboard immersion
      wisp.quaternion.copy(this.camera.quaternion);

      // Slow gentle rotation of the mist texture
      wisp.rotateZ(t * 0.02 * (i % 2 === 0 ? 1 : -1));

      // Audio-reactive breath
      const s = data.baseScale * pulseScale;
      wisp.scale.set(s, s, s);

      const mat = wisp.material as THREE.MeshBasicMaterial;
      mat.opacity = data.baseOpacity * this.fogIntensity * (1.0 + this.bgFogMaterial.uniforms.uBass.value * 0.35);
    }

    // 5. Modulate Scene Distance Fog Color harmoniously with the scrolling waves
    if (this.scene.fog) {
      const fogWave = Math.sin(t * 0.25);
      const deepPurpleFog = new THREE.Color(0x110520);
      const deepCyanFog = new THREE.Color(0x02141e);
      const targetTint = fogWave > 0 ? deepPurpleFog : deepCyanFog;
      const tintFactor = Math.abs(fogWave) * 0.42 * this.fogIntensity;

      const dynamicFogColor = new THREE.Color(this.currentTheme.bgFog).lerp(targetTint, tintFactor);
      (this.scene.fog as THREE.FogExp2).color.copy(dynamicFogColor);
    }
  }

  // ==========================================
  // MODULE 1: THE LOTUS ENIGMA
  // ==========================================
  private buildLotusEnigma() {
    this.lotusGroup = new THREE.Group();
    this.lotusGroup.position.set(0, -6, 0);
    this.scene.add(this.lotusGroup);

    // Reflective Holographic Lotus Pond Disc
    const padGeo = new THREE.CylinderGeometry(26, 28, 0.6, 32);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x070b16,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0x002244,
      emissiveIntensity: 0.4,
    });
    this.lotusPondPad = new THREE.Mesh(padGeo, padMat);
    this.lotusPondPad.position.set(0, -1.2, 0);
    this.lotusPondPad.receiveShadow = true;
    this.lotusGroup.add(this.lotusPondPad);

    // Concentric Energy Ripple Rings
    for (let r = 0; r < 4; r++) {
      const ringGeo = new THREE.RingGeometry(8 + r * 5, 8.4 + r * 5, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: r % 2 === 0 ? 0x00f0ff : 0xff00aa,
        transparent: true,
        opacity: 0.35 - r * 0.06,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(0, -0.85, 0);
      this.lotusGroup.add(ringMesh);
    }

    // Outer Tier Petals: 10 large curving cyber petals
    const numOuter = 10;
    const outerPetalGeo = new THREE.ConeGeometry(3.2, 13, 5);
    outerPetalGeo.rotateX(Math.PI / 4);
    for (let i = 0; i < numOuter; i++) {
      const angle = (i / numOuter) * Math.PI * 2;
      const petalMat = new THREE.MeshPhysicalMaterial({
        color: 0x091428,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.45,
        metalness: 0.85,
        roughness: 0.2,
        clearcoat: 0.8,
      });
      const petal = new THREE.Mesh(outerPetalGeo, petalMat);
      petal.position.set(Math.cos(angle) * 11, 1.2, Math.sin(angle) * 11);
      petal.rotation.y = -angle + Math.PI / 2;
      petal.rotation.z = 0.55;
      this.lotusGroup.add(petal);
      this.lotusOuterPetals.push(petal);
    }

    // Inner Tier Petals: 12 glowing translucent magenta/cyan lotus petals
    const numInner = 12;
    const innerPetalGeo = new THREE.ConeGeometry(2.2, 9, 5);
    innerPetalGeo.rotateX(Math.PI / 6);
    for (let i = 0; i < numInner; i++) {
      const angle = (i / numInner) * Math.PI * 2 + 0.25;
      const petalMat = new THREE.MeshPhysicalMaterial({
        color: 0x1f082e,
        emissive: 0xff0088,
        emissiveIntensity: 0.6,
        metalness: 0.7,
        roughness: 0.25,
        clearcoat: 1.0,
      });
      const petal = new THREE.Mesh(innerPetalGeo, petalMat);
      petal.position.set(Math.cos(angle) * 6.5, 2.0, Math.sin(angle) * 6.5);
      petal.rotation.y = -angle + Math.PI / 2;
      petal.rotation.z = 0.38;
      this.lotusGroup.add(petal);
      this.lotusInnerPetals.push(petal);
    }

    // Glowing Fiber-Optic Stamens & Golden Pistils
    const numStamens = 20;
    const stamenGeo = new THREE.CylinderGeometry(0.08, 0.12, 5.0, 5);
    const pollenGeo = new THREE.SphereGeometry(0.25, 8, 8);
    const stamenMat = new THREE.MeshBasicMaterial({ color: 0xffe600 });
    for (let i = 0; i < numStamens; i++) {
      const angle = (i / numStamens) * Math.PI * 2;
      const stamenGroup = new THREE.Group();
      stamenGroup.position.set(Math.cos(angle) * 3.8, 1.5, Math.sin(angle) * 3.8);

      const stalk = new THREE.Mesh(stamenGeo, stamenMat);
      stalk.position.y = 2.0;
      stalk.rotation.z = -0.25;
      stalk.rotation.y = angle;
      stamenGroup.add(stalk);

      const pollen = new THREE.Mesh(pollenGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      pollen.position.set(stalk.position.x - 0.4, 4.4, stalk.position.z);
      stamenGroup.add(pollen);

      this.lotusGroup.add(stamenGroup);
      this.lotusCoreStamens.push(stalk);
    }

    // Lotus Center Resting Cradle (soft glowing nest for the dragon)
    const cradleGeo = new THREE.CylinderGeometry(3.8, 4.4, 1.2, 16);
    const cradleMat = new THREE.MeshStandardMaterial({
      color: 0x120826,
      emissive: 0x7b2cbf,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    });
    this.lotusCradleRing = new THREE.Mesh(cradleGeo, cradleMat);
    this.lotusCradleRing.position.set(0, 0.5, 0);
    this.lotusGroup.add(this.lotusCradleRing);

    // Warm Lotus Heart Light
    this.lotusGlowLight = new THREE.PointLight(0xff00aa, 5.0, 35);
    this.lotusGlowLight.position.set(0, 3.5, 0);
    this.lotusGroup.add(this.lotusGlowLight);
  }

  // ==========================================
  // THE CYBER BUTTERFLY
  // ==========================================
  private buildButterfly() {
    this.butterflyGroup = new THREE.Group();
    this.scene.add(this.butterflyGroup);

    // Body & Head
    const bodyGeo = new THREE.CapsuleGeometry(0.12, 0.9, 4, 8);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x101525,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.7,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    this.butterflyGroup.add(body);

    const headGeo = new THREE.SphereGeometry(0.16, 8, 8);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(0, 0.05, 0.55);
    this.butterflyGroup.add(head);

    // Glowing Antennae
    const antGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 3);
    antGeo.rotateX(-Math.PI / 3);
    const antMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const antL = new THREE.Mesh(antGeo, antMat);
    antL.position.set(0.08, 0.2, 0.75);
    antL.rotation.z = -0.3;
    this.butterflyGroup.add(antL);

    const antR = new THREE.Mesh(antGeo, antMat);
    antR.position.set(-0.08, 0.2, 0.75);
    antR.rotation.z = 0.3;
    this.butterflyGroup.add(antR);

    // Wings Materials (Holographic Cyber Neon)
    const wingMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff,
      emissive: 0xff0099,
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      roughness: 0.1,
      metalness: 0.5,
      transmission: 0.3,
    });

    // Left Wing Group (Forewing + Hindwing)
    this.butterflyWingLeft = new THREE.Group();
    this.butterflyWingLeft.position.set(0.1, 0.08, 0);

    const foreGeo = new THREE.ConeGeometry(0.8, 1.8, 4);
    foreGeo.rotateZ(-Math.PI / 2);
    foreGeo.rotateY(Math.PI / 4);
    const foreL = new THREE.Mesh(foreGeo, wingMat);
    foreL.scale.set(1.0, 0.04, 0.7);
    foreL.position.set(0.9, 0, 0.2);
    this.butterflyWingLeft.add(foreL);

    const hindGeo = new THREE.ConeGeometry(0.55, 1.2, 4);
    hindGeo.rotateZ(-Math.PI / 2);
    const hindL = new THREE.Mesh(hindGeo, wingMat);
    hindL.scale.set(0.9, 0.04, 0.6);
    hindL.position.set(0.65, 0, -0.45);
    this.butterflyWingLeft.add(hindL);

    this.butterflyGroup.add(this.butterflyWingLeft);

    // Right Wing Group (Forewing + Hindwing)
    this.butterflyWingRight = new THREE.Group();
    this.butterflyWingRight.position.set(-0.1, 0.08, 0);

    const foreR = new THREE.Mesh(foreGeo, wingMat);
    foreR.scale.set(-1.0, 0.04, 0.7);
    foreR.position.set(-0.9, 0, 0.2);
    this.butterflyWingRight.add(foreR);

    const hindR = new THREE.Mesh(hindGeo, wingMat);
    hindR.scale.set(-0.9, 0.04, 0.6);
    hindR.position.set(-0.65, 0, -0.45);
    this.butterflyWingRight.add(hindR);

    this.butterflyGroup.add(this.butterflyWingRight);

    // Butterfly Glow Light
    this.butterflyGlowLight = new THREE.PointLight(0x00f0ff, 3.0, 15);
    this.butterflyGroup.add(this.butterflyGlowLight);

    // Butterfly Smile Indicator
    const haloGeo = new THREE.TorusGeometry(0.28, 0.05, 4, 16);
    haloGeo.rotateX(Math.PI / 2);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffdd00,
      transparent: true,
      opacity: 0,
    });
    this.butterflySmileIndicator = new THREE.Mesh(haloGeo, haloMat);
    this.butterflySmileIndicator.position.set(0, 0.45, 0.2);
    this.butterflyGroup.add(this.butterflySmileIndicator);

    // Butterfly Sparkle Trail
    const maxTrail = 40;
    this.butterflyTrailPositions = new Float32Array(maxTrail * 3);
    const bTrailGeo = new THREE.BufferGeometry();
    bTrailGeo.setAttribute('position', new THREE.BufferAttribute(this.butterflyTrailPositions, 3));
    this.butterflyTrailLine = new THREE.Line(
      bTrailGeo,
      new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      })
    );
    this.scene.add(this.butterflyTrailLine);
  }

  // Joyful Smiling Sparks / Hearts
  private buildSmileHearts() {
    this.heartSmilePositions = new Float32Array(this.numHeartParticles * 3);
    this.heartSmileLifes = new Float32Array(this.numHeartParticles);

    for (let i = 0; i < this.numHeartParticles; i++) {
      this.heartSmilePositions[i * 3] = 0;
      this.heartSmilePositions[i * 3 + 1] = -100;
      this.heartSmilePositions[i * 3 + 2] = 0;
      this.heartSmileLifes[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.heartSmilePositions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xff33aa,
      size: 0.65,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.heartSmileParticles = new THREE.Points(geo, mat);
    this.scene.add(this.heartSmileParticles);
  }

  // MODULE 2: Cyber Vortex Tunnel
  private buildVortexModule() {
    this.vortexGroup = new THREE.Group();
    this.vortexGroup.visible = false;
    this.scene.add(this.vortexGroup);

    const numRings = 32;
    for (let i = 0; i < numRings; i++) {
      const radius = 12 + Math.sin(i * 0.3) * 4;
      const ringGeo = new THREE.TorusGeometry(radius, 0.25, 6, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? this.currentTheme.scaleColor : this.currentTheme.spineColor,
        wireframe: true,
        transparent: true,
        opacity: 0.65,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(0, 0, -i * 12);
      this.vortexGroup.add(ringMesh);
      this.vortexRings.push(ringMesh);
    }
  }

  // MODULE 3: Raw Power Audio Monolith Core
  private buildMonolithModule() {
    this.monolithGroup = new THREE.Group();
    this.monolithGroup.visible = false;
    this.scene.add(this.monolithGroup);

    const crystalGeo = new THREE.OctahedronGeometry(6, 0);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x080812,
      emissive: this.currentTheme.spineColor,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.9,
      wireframe: false,
    });
    this.monolithCore = new THREE.Mesh(crystalGeo, crystalMat);
    this.monolithGroup.add(this.monolithCore);

    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.TorusGeometry(9 + i * 3.5, 0.2, 4, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? this.currentTheme.scaleColor : this.currentTheme.eyeColor,
        wireframe: true,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      this.monolithGroup.add(ring);
      this.monolithRings.push(ring);
    }

    const numBars = 32;
    const barGeo = new THREE.BoxGeometry(0.6, 2.0, 0.6);
    for (let i = 0; i < numBars; i++) {
      const angle = (i / numBars) * Math.PI * 2;
      const barMat = new THREE.MeshStandardMaterial({
        color: this.currentTheme.scaleColor,
        emissive: this.currentTheme.scaleColor,
        emissiveIntensity: 0.6,
      });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(Math.cos(angle) * 22, 0, Math.sin(angle) * 22);
      bar.lookAt(0, 0, 0);
      this.monolithGroup.add(bar);
      this.monolithBars.push(bar);
    }
  }

  // MODULE 4: Scales Macro
  private buildMacroModule() {
    this.macroGroup = new THREE.Group();
    this.macroGroup.visible = false;
    this.scene.add(this.macroGroup);

    const hexGeo = new THREE.CylinderGeometry(2.5, 2.8, 0.5, 6);
    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        const mat = new THREE.MeshStandardMaterial({
          color: this.currentTheme.scaleColor,
          metalness: 0.9,
          roughness: 0.15,
          emissive: this.currentTheme.glowColor,
          emissiveIntensity: 0.3,
        });
        const plate = new THREE.Mesh(hexGeo, mat);
        plate.position.set(x * 5.2 + (y % 2) * 2.6, y * 4.5, 0);
        plate.rotation.x = Math.PI / 2;
        this.macroGroup.add(plate);
        this.macroPlates.push(plate);
      }
    }
  }

  // ==========================================
  // MAIN ANIMATION LOOP
  // ==========================================
  private animate = () => {
    if (this.isDestroyed) return;
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    this.dragonTime += delta * 1.6 * this.speedMultiplier;

    // Mouse ease
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Update active module animations
    if (this.activeModule === 'lotus-enigma') {
      this.updateLotusAndButterfly(delta);
      this.updateSmileHearts(delta);
    } else {
      this.lotusGroup.visible = false;
      this.butterflyGroup.visible = false;
      this.butterflyTrailLine.visible = false;
      this.heartSmileParticles.visible = false;
    }

    // Kinematics & Anatomy update (Guaranteed gapless, solid Cyber Dragon)
    this.updateCyberDragonKinematics(delta);
    this.updateWhiskers();
    this.updateBreathParticles();
    this.updateTrail();
    this.updateDust(delta);
    this.updateSpikeExplosionParticles(delta);

    if (this.activeModule === 'cyber-vortex') {
      this.updateVortex(delta);
    } else if (this.activeModule === 'audio-monolith') {
      this.updateMonolith(delta);
    } else if (this.activeModule === 'scales-macro') {
      this.updateMacro(delta);
    }

    // Animated Background Fog Layer (scrolling purple & cyan hues)
    this.updateBackgroundFog(delta);

    // Camera choreographer
    this.updateCamera(delta);

    // Smooth lerp chromatic aberration amount towards target
    this.chromaticAberrationAmount = THREE.MathUtils.lerp(
      this.chromaticAberrationAmount,
      this.targetChromaticAberration,
      delta * 14.0
    );

    // Render with dynamic chromatic aberration post-processing or standard direct rendering
    if (this.isChromaticAberrationEnabled && this.renderTarget && this.postMaterial) {
      this.renderer.setRenderTarget(this.renderTarget);
      this.renderer.render(this.scene, this.camera);

      this.renderer.setRenderTarget(null);
      this.postMaterial.uniforms.tDiffuse.value = this.renderTarget.texture;
      this.postMaterial.uniforms.uTime.value = this.dragonTime;
      this.postMaterial.uniforms.uBass.value = this.audioBassSmoothed;
      this.postMaterial.uniforms.uAberrationAmount.value = this.chromaticAberrationAmount;
      this.postMaterial.uniforms.uGlitchIntensity.value = this.chromaticGlitchIntensity;
      this.postMaterial.uniforms.uBloomIntensity.value = this.bloomIntensity;
      this.renderer.render(this.postScene, this.postCamera);
    } else {
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.scene, this.camera);
    }

    // =========================================================================
    // MPEG-4 Video Frame Processing & Artist Credit Watermark Compositor
    // =========================================================================
    if (this.isRecordingVideo && this.exportCanvas && this.exportCtx) {
      // 1. Draw 3D rendered buffer onto export canvas
      this.exportCtx.drawImage(
        this.renderer.domElement,
        0,
        0,
        this.exportCanvas.width,
        this.exportCanvas.height
      );

      const elapsedSec = (performance.now() - this.recordingStartTime) / 1000;

      // 2. Render Artist Credit Watermark: "Dragon9 with Raw Power"
      if (this.exportWatermarkEnabled) {
        this.drawArtistCreditWatermark(
          this.exportCtx,
          this.exportCanvas.width,
          this.exportCanvas.height,
          elapsedSec
        );
      }

      // 3. Callback progress & frame counter
      const targetDuration = this.activeExportConfig?.durationSeconds || 0;
      const progress = targetDuration > 0 ? Math.min(1.0, elapsedSec / targetDuration) : 0;

      if (this.activeExportConfig?.onProgress) {
        this.activeExportConfig.onProgress(progress, elapsedSec, targetDuration);
      }

      // 4. Auto-stop when automated duration is reached
      if (targetDuration > 0 && elapsedSec >= targetDuration) {
        this.stopMpeg4Recording();
      }
    }
  };

  // Lotus & Butterfly Animation
  private updateLotusAndButterfly(delta: number) {
    this.lotusGroup.visible = true;
    this.butterflyGroup.visible = true;
    this.butterflyTrailLine.visible = true;
    this.heartSmileParticles.visible = this.smileAmount > 0.15;

    // Petals breathing & cup gesture
    for (let i = 0; i < this.lotusOuterPetals.length; i++) {
      const petal = this.lotusOuterPetals[i];
      const wave = Math.sin(this.dragonTime * 1.5 + i * 0.5) * 0.04;
      const cupOffset = this.storyStage === 'lotus-nest-smile' ? -0.15 : 0;
      petal.rotation.z = 0.55 + wave + cupOffset;
    }

    for (let i = 0; i < this.lotusInnerPetals.length; i++) {
      const petal = this.lotusInnerPetals[i];
      const wave = Math.cos(this.dragonTime * 1.8 + i * 0.4) * 0.05;
      const cupOffset = this.storyStage === 'lotus-nest-smile' ? -0.12 : 0;
      petal.rotation.z = 0.38 + wave + cupOffset;
    }

    // Pond pad slow spin
    if (this.lotusPondPad) {
      this.lotusPondPad.rotation.y += delta * 0.05;
    }

    // Butterfly wing flapping
    let flapSpeed = 28;
    let flapAmp = 0.85;

    if (this.storyStage === 'perch-nose') {
      flapSpeed = 7;
      flapAmp = 0.28;
    } else if (this.storyStage === 'lotus-nest-smile') {
      flapSpeed = 16;
      flapAmp = 0.45; // gentle, joyful flutter
    } else if (this.storyStage === 'approach') {
      flapSpeed = 22;
      flapAmp = 0.7;
    }

    const wingAngle = Math.sin(this.dragonTime * flapSpeed) * flapAmp;
    this.butterflyWingLeft.rotation.y = wingAngle;
    this.butterflyWingRight.rotation.y = -wingAngle;

    // Butterfly Smile Indicator (Halo blooms when smiling)
    if (this.butterflySmileIndicator) {
      (this.butterflySmileIndicator.material as THREE.MeshBasicMaterial).opacity = this.smileAmount;
      this.butterflySmileIndicator.rotation.z += delta * 3.0;
      const pulse = 1.0 + Math.sin(this.dragonTime * 8) * 0.25;
      this.butterflySmileIndicator.scale.set(pulse, pulse, pulse);
    }

    // Snout Landing Beacon Glow
    if (this.butterflyLandingBeacon) {
      const isPerched = this.storyStage === 'perch-nose' || this.storyStage === 'lotus-nest-smile';
      (this.butterflyLandingBeacon.material as THREE.MeshBasicMaterial).color.setHex(isPerched ? 0xffea00 : 0x00f0ff);
      const bScale = isPerched ? 1.0 + Math.sin(this.dragonTime * 6) * 0.25 : 1.0;
      this.butterflyLandingBeacon.scale.set(bScale, 1.0, bScale);
    }

    if (this.butterflyBeaconRing) {
      this.butterflyBeaconRing.rotation.z += delta * 2.0;
    }

    // Butterfly positioning according to story stage
    const t = this.dragonTime;
    if (this.storyStage === 'chase') {
      const bX = Math.sin(t * 1.3) * 22 + Math.cos(t * 0.6) * 6;
      const bY = Math.sin(t * 1.9) * 11 + 5;
      const bZ = Math.cos(t * 1.1) * 22;
      this.butterflyPos.set(bX, bY, bZ);
      this.butterflyGroup.position.lerp(this.butterflyPos, delta * 8.0);

      const nextBX = Math.sin((t + 0.1) * 1.3) * 22 + Math.cos((t + 0.1) * 0.6) * 6;
      const nextBY = Math.sin((t + 0.1) * 1.9) * 11 + 5;
      const nextBZ = Math.cos((t + 0.1) * 1.1) * 22;
      this.butterflyGroup.lookAt(nextBX, nextBY, nextBZ);
    } else if (this.storyStage === 'approach') {
      const localAhead = new THREE.Vector3(0, 0.45, 4.6 + Math.sin(t * 5.0) * 0.4);
      const worldAhead = this.headGroup.localToWorld(localAhead);
      this.butterflyGroup.position.lerp(worldAhead, delta * 7.0);
      this.butterflyGroup.lookAt(this.headGroup.position);
    } else {
      // 'perch-nose' and 'lotus-nest-smile': Butterfly sits snugly on dragon's snout beacon!
      const localNose = new THREE.Vector3(0, 0.62, 3.3);
      const worldNose = this.headGroup.localToWorld(localNose);
      this.butterflyGroup.position.copy(worldNose);
      this.butterflyGroup.quaternion.copy(this.headGroup.quaternion);
      this.butterflyGroup.rotateX(0.12);
    }

    // Butterfly Sparkle Trail
    if (this.butterflyTrailLine && this.storyStage !== 'perch-nose' && this.storyStage !== 'lotus-nest-smile') {
      this.butterflyTrailHistory.unshift(this.butterflyGroup.position.clone());
      if (this.butterflyTrailHistory.length > 40) {
        this.butterflyTrailHistory.pop();
      }
      for (let i = 0; i < 40; i++) {
        const i3 = i * 3;
        if (i < this.butterflyTrailHistory.length) {
          this.butterflyTrailPositions[i3] = this.butterflyTrailHistory[i].x;
          this.butterflyTrailPositions[i3 + 1] = this.butterflyTrailHistory[i].y;
          this.butterflyTrailPositions[i3 + 2] = this.butterflyTrailHistory[i].z;
        } else if (this.butterflyTrailHistory.length > 0) {
          const last = this.butterflyTrailHistory[this.butterflyTrailHistory.length - 1];
          this.butterflyTrailPositions[i3] = last.x;
          this.butterflyTrailPositions[i3 + 1] = last.y;
          this.butterflyTrailPositions[i3 + 2] = last.z;
        }
      }
      this.butterflyTrailLine.geometry.attributes.position.needsUpdate = true;
    }
  }

  // Smiling Joy Particles
  private updateSmileHearts(delta: number) {
    if (this.smileAmount < 0.1) return;

    const headPos = this.headGroup.position;
    for (let i = 0; i < this.numHeartParticles; i++) {
      const i3 = i * 3;
      this.heartSmileLifes[i] -= delta * 0.8;
      if (this.heartSmileLifes[i] <= 0) {
        this.heartSmileLifes[i] = 1.0;
        this.heartSmilePositions[i3] = headPos.x + (Math.random() - 0.5) * 3.5;
        this.heartSmilePositions[i3 + 1] = headPos.y + 0.6 + Math.random() * 2.2;
        this.heartSmilePositions[i3 + 2] = headPos.z + (Math.random() - 0.5) * 3.5;
      } else {
        this.heartSmilePositions[i3 + 1] += delta * 2.5; // float upward
        this.heartSmilePositions[i3] += Math.sin(this.dragonTime * 3 + i) * delta * 0.8;
      }
    }
    this.heartSmileParticles.geometry.attributes.position.needsUpdate = true;
  }

  // ==========================================
  // INVERSE KINEMATICS & GAPLESS KINEMATICS
  // Solves the "head coming apart" bug with 100% mathematical guarantees
  // ==========================================
  private updateCyberDragonKinematics(delta: number) {
    const t = this.dragonTime;

    // 1. Determine target smile amount based on stage
    let targetSmile = 0.0;
    if (this.activeModule === 'lotus-enigma') {
      if (this.storyStage === 'approach') {
        targetSmile = 0.35;
      } else if (this.storyStage === 'perch-nose') {
        targetSmile = 0.75;
      } else if (this.storyStage === 'lotus-nest-smile') {
        targetSmile = 1.0;
      }
    }
    this.smileAmount += (targetSmile - this.smileAmount) * 0.08;

    // 2. Anatomical Jaw Smile Animation
    if (this.jawGroup) {
      if (this.smileAmount > 0.05) {
        // Rotates smoothly on hinge into a warm, open smile
        this.jawGroup.rotation.x = this.smileAmount * 0.26;
      }
    }

    // 3. Optic Sensor Visor squinting into joyful crescents
    if (this.leftEye && this.rightEye) {
      const eyeScaleY = Math.max(0.18, 1.0 - this.smileAmount * 0.72);
      const eyeScaleX = 1.0 + this.smileAmount * 0.35;
      this.leftEye.scale.set(eyeScaleX, eyeScaleY, 1.0);
      this.rightEye.scale.set(eyeScaleX, eyeScaleY, 1.0);
      this.leftEye.rotation.z = -0.18 + this.smileAmount * 0.25;
      this.rightEye.rotation.z = 0.18 - this.smileAmount * 0.25;

      if (this.smileAmount > 0.3) {
        this.eyeMaterial.color.setHex(0xffea00); // Warm glowing golden optic sensor
      } else {
        this.eyeMaterial.color.setHex(this.currentTheme.eyeColor);
      }
    }

    // 4. Cheeks rosy-gold neon blush
    if (this.smileCheekLeft && this.smileCheekRight) {
      const blushMatL = this.smileCheekLeft.material as THREE.MeshStandardMaterial;
      const blushMatR = this.smileCheekRight.material as THREE.MeshStandardMaterial;
      blushMatL.emissiveIntensity = 0.1 + this.smileAmount * 2.8;
      blushMatR.emissiveIntensity = 0.1 + this.smileAmount * 2.8;
    }

    // 5. Head Position & Trajectory Calculation
    let targetHeadPos = new THREE.Vector3();
    let targetLookAt = new THREE.Vector3();

    if (this.activeModule === 'lotus-enigma') {
      if (this.storyStage === 'chase') {
        const chaseLag = 0.2;
        const chaseX = Math.sin((t - chaseLag) * 1.3) * 22 + this.mouse.x * 6;
        const chaseY = Math.sin((t - chaseLag) * 1.9) * 11 + 5 - this.mouse.y * 5;
        const chaseZ = Math.cos((t - chaseLag) * 1.1) * 22;
        targetHeadPos.set(chaseX, chaseY, chaseZ);
        targetLookAt.copy(this.butterflyGroup.position);
      } else if (this.storyStage === 'approach') {
        const hoverX = Math.sin(t * 0.6) * 4 + this.mouse.x * 4;
        const hoverY = 4 + Math.cos(t * 0.8) * 2 - this.mouse.y * 3;
        const hoverZ = Math.cos(t * 0.5) * 6;
        targetHeadPos.set(hoverX, hoverY, hoverZ);
        targetLookAt.copy(this.butterflyGroup.position);
      } else if (this.storyStage === 'perch-nose') {
        const steadyX = Math.sin(t * 0.3) * 2 + this.mouse.x * 2;
        const steadyY = 2.5 + Math.cos(t * 0.4) * 1.0;
        const steadyZ = Math.cos(t * 0.3) * 3;
        targetHeadPos.set(steadyX, steadyY, steadyZ);
        targetLookAt.set(steadyX, steadyY + 0.5, steadyZ + 10.0);
      } else if (this.storyStage === 'lotus-nest-smile') {
        // Resting peacefully inside the Lotus Enigma
        const nestHeadX = 0 + this.mouse.x * 1.5;
        const nestHeadY = -2.0 + Math.sin(t * 0.8) * 0.25;
        const nestHeadZ = 3.6 + Math.cos(t * 0.6) * 0.2;
        targetHeadPos.set(nestHeadX, nestHeadY, nestHeadZ);
        targetLookAt.set(nestHeadX, nestHeadY + 0.8, nestHeadZ + 8.0);
      }
    } else {
      // Default dynamic flight
      const headX = Math.sin(t * 0.8) * 16 + this.mouse.x * 6;
      const headY = Math.cos(t * 1.1) * 7 - this.mouse.y * 5;
      const headZ = Math.sin(t * 0.5) * 8;
      targetHeadPos.set(headX, headY, headZ);

      const nextX = Math.sin((t + 0.1) * 0.8) * 16 + this.mouse.x * 6;
      const nextY = Math.cos((t + 0.1) * 1.1) * 7 - this.mouse.y * 5;
      const nextZ = Math.sin((t + 0.1) * 0.5) * 8;
      targetLookAt.set(nextX, nextY, nextZ);
    }

    // Smooth head position interpolation
    this.headGroup.position.lerp(targetHeadPos, Math.min(1.0, delta * 12.0));

    // Smooth head orientation with forward vector along +Z
    const dir = new THREE.Vector3().subVectors(targetLookAt, this.headGroup.position);
    if (dir.lengthSq() > 0.001) {
      dir.normalize();
      const m = new THREE.Matrix4();
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(up, dir).normalize();
      const correctedUp = new THREE.Vector3().crossVectors(dir, right).normalize();
      m.makeBasis(right, correctedUp, dir);
      const targetQuat = new THREE.Quaternion().setFromRotationMatrix(m);
      this.headGroup.quaternion.slerp(targetQuat, Math.min(1.0, delta * 14.0));
    }

    // 6. INVARIANT NECK SOCKET ANCHOR
    // The rear neck socket of the head chassis is local (0, 0, -1.8)
    const neckBaseSocket = this.headGroup.localToWorld(new THREE.Vector3(0, 0, -1.8));

    // CRITICAL: Segment 0 is RIGIDLY GLUED to neck socket. ZERO GAP, ZERO LAG!
    this.spineNodes[0].copy(neckBaseSocket);

    // 7. INVERSE KINEMATICS DISTANCE CONSTRAINT (VERLET CHAIN)
    if (this.activeModule === 'lotus-enigma' && this.storyStage === 'lotus-nest-smile') {
      // Coiled spiral bed nestled inside the lotus petals
      // Begins seamlessly from segment 0 at the head neck base
      for (let i = 1; i < this.numSegments; i++) {
        const spiralT = i / this.numSegments;
        const nestRadius = 2.4 + spiralT * 5.2;
        const nestAngle = spiralT * Math.PI * 3.6 + t * 0.05;
        const nestY = -3.4 - spiralT * 0.85 + Math.sin(t * 1.2 + i * 0.1) * 0.15;
        const targetPos = new THREE.Vector3(Math.cos(nestAngle) * nestRadius, nestY, Math.sin(nestAngle) * nestRadius);

        this.spineNodes[i].lerp(targetPos, Math.min(1.0, delta * 3.5));

        // Enforce exact segment spacing constraint from previous segment
        const prev = this.spineNodes[i - 1];
        const segDir = new THREE.Vector3().subVectors(this.spineNodes[i], prev);
        if (segDir.lengthSq() > 0.0001) {
          segDir.normalize();
        } else {
          segDir.set(0, 0, -1);
        }
        this.spineNodes[i].copy(prev).addScaledVector(segDir, this.segSpacing);
      }
    } else {
      // Serpentine Flight IK with harmonic swimming undulation
      for (let i = 1; i < this.numSegments; i++) {
        const prev = this.spineNodes[i - 1];
        const curr = this.spineNodes[i];

        let segDir = new THREE.Vector3().subVectors(curr, prev);
        if (segDir.lengthSq() > 0.00001) {
          segDir.normalize();
        } else {
          segDir.set(0, 0, -1);
        }

        // Harmonic lateral wave
        const waveAmp = Math.sin(t * 3.4 - i * 0.24) * 0.22 * Math.min(1.0, i * 0.15);
        const lateralRight = new THREE.Vector3(-segDir.z, 0, segDir.x).normalize();
        const targetPos = prev.clone().addScaledVector(segDir, this.segSpacing).addScaledVector(lateralRight, waveAmp);

        curr.lerp(targetPos, Math.min(1.0, delta * 32.0));

        // Clamping to invariant distance guarantees zero tearing
        const correctedDir = new THREE.Vector3().subVectors(curr, prev);
        if (correctedDir.lengthSq() > 0.00001) {
          correctedDir.normalize();
        } else {
          correctedDir.set(0, 0, -1);
        }
        curr.copy(prev).addScaledVector(correctedDir, this.segSpacing);
      }
    }

    // 8. Place and Orient Each Vertebra
    for (let i = 0; i < this.numSegments; i++) {
      const segMesh = this.spineSegments[i];
      segMesh.position.copy(this.spineNodes[i]);

      // Orient forward toward preceding node (or neck base for segment 0)
      const forwardTarget = i === 0 ? this.headGroup.position : this.spineNodes[i - 1];
      const forwardDir = new THREE.Vector3().subVectors(forwardTarget, segMesh.position);

      if (forwardDir.lengthSq() > 0.0001) {
        forwardDir.normalize();
        const m = new THREE.Matrix4();
        const up = new THREE.Vector3(0, 1, 0);
        const right = new THREE.Vector3().crossVectors(up, forwardDir).normalize();
        const correctedUp = new THREE.Vector3().crossVectors(forwardDir, right).normalize();
        m.makeBasis(right, correctedUp, forwardDir);
        segMesh.quaternion.setFromRotationMatrix(m);
      }
    }

    // 9. Claws banking & swimming stroke
    for (let i = 0; i < this.claws.length; i++) {
      const claw = this.claws[i];
      if (this.storyStage === 'lotus-nest-smile') {
        claw.rotation.set(-0.2, 0, 0);
      } else {
        const stroke = Math.sin(t * 3.0 + i * Math.PI) * 0.45;
        claw.rotation.x = stroke;
        claw.rotation.y = Math.cos(t * 2.0 + i * 1.5) * 0.3;
      }
    }
  }

  // Whisker Physics
  private updateWhiskers() {
    const t = this.dragonTime;
    const numPoints = this.leftWhiskerPoints.length;

    for (let i = 1; i < numPoints; i++) {
      const wave = Math.sin(t * 4.0 - i * 0.4) * (i * 0.15);
      const waveY = Math.cos(t * 3.5 - i * 0.4) * (i * 0.12);

      this.leftWhiskerPoints[i].x = 0.85 + i * 0.35 + wave;
      this.leftWhiskerPoints[i].y = -i * 0.12 + waveY;

      this.rightWhiskerPoints[i].x = -0.85 - i * 0.35 - wave;
      this.rightWhiskerPoints[i].y = -i * 0.12 + waveY;
    }

    this.leftWhiskerLine.geometry.setFromPoints(this.leftWhiskerPoints);
    this.rightWhiskerLine.geometry.setFromPoints(this.rightWhiskerPoints);
  }

  // Ribbon Trail
  private updateTrail() {
    const tailSeg = this.spineSegments[this.numSegments - 1];
    if (tailSeg) {
      this.trailHistory.unshift(tailSeg.position.clone());
      if (this.trailHistory.length > this.maxTrailPoints) {
        this.trailHistory.pop();
      }

      for (let i = 0; i < this.maxTrailPoints; i++) {
        const i3 = i * 3;
        if (i < this.trailHistory.length) {
          this.trailPositions[i3] = this.trailHistory[i].x;
          this.trailPositions[i3 + 1] = this.trailHistory[i].y;
          this.trailPositions[i3 + 2] = this.trailHistory[i].z;
        } else if (this.trailHistory.length > 0) {
          const last = this.trailHistory[this.trailHistory.length - 1];
          this.trailPositions[i3] = last.x;
          this.trailPositions[i3 + 1] = last.y;
          this.trailPositions[i3 + 2] = last.z;
        }
      }
      this.trailGeometry.attributes.position.needsUpdate = true;
    }
  }

  // Fire / Breath Particles
  private updateBreathParticles() {
    for (let i = 0; i < this.numBreathParticles; i++) {
      const i3 = i * 3;
      this.breathLifes[i] -= 0.012;
      if (this.breathLifes[i] <= 0) {
        this.resetBreathParticle(i);
      } else {
        this.breathPositions[i3] += this.breathVelocities[i3];
        this.breathPositions[i3 + 1] += this.breathVelocities[i3 + 1];
        this.breathPositions[i3 + 2] += this.breathVelocities[i3 + 2];
      }
    }
    this.breathParticles.geometry.attributes.position.needsUpdate = true;
  }

  // Dust Particles
  private updateDust(delta: number) {
    for (let i = 1; i < this.numDust * 3; i += 3) {
      this.dustPositions[i] -= delta * 2.0;
      if (this.dustPositions[i] < -45) {
        this.dustPositions[i] = 45;
      }
    }
    this.dustParticles.geometry.attributes.position.needsUpdate = true;
  }

  // Vortex Module
  private updateVortex(delta: number) {
    this.vortexGroup.visible = true;
    for (let i = 0; i < this.vortexRings.length; i++) {
      const ring = this.vortexRings[i];
      ring.position.z += delta * 20.0;
      ring.rotation.z += delta * (i % 2 === 0 ? 0.4 : -0.4);
      if (ring.position.z > 20) {
        ring.position.z -= 32 * 12;
      }
    }
  }

  // Monolith Module
  private updateMonolith(delta: number) {
    this.monolithGroup.visible = true;
    if (this.monolithCore) {
      this.monolithCore.rotation.x += delta * 0.4;
      this.monolithCore.rotation.y += delta * 0.6;
    }
    for (let i = 0; i < this.monolithRings.length; i++) {
      const ring = this.monolithRings[i];
      ring.rotation.x += delta * (0.3 + i * 0.1);
      ring.rotation.y += delta * (0.2 - i * 0.15);
    }
  }

  // Macro Module
  private updateMacro(delta: number) {
    this.macroGroup.visible = true;
    for (let i = 0; i < this.macroPlates.length; i++) {
      const plate = this.macroPlates[i];
      plate.position.z = Math.sin(this.dragonTime * 2.0 + i * 0.4) * 0.6;
    }
  }

  // ==========================================
  // CAMERA CHOREOGRAPHY
  // ==========================================
  private updateCamera(delta: number) {
    const head = this.headGroup.position;

    if (this.cameraMode === 'story-director') {
      if (this.storyStage === 'chase') {
        const midX = (head.x + this.butterflyGroup.position.x) * 0.5;
        const midY = (head.y + this.butterflyGroup.position.y) * 0.5;
        const midZ = (head.z + this.butterflyGroup.position.z) * 0.5;
        const targetPos = new THREE.Vector3(midX + 16, midY + 14, midZ + 28);
        this.camera.position.lerp(targetPos, delta * 3.5);
        this.cameraTarget.lerp(new THREE.Vector3(midX, midY, midZ), delta * 4.5);
        this.camera.lookAt(this.cameraTarget);
      } else if (this.storyStage === 'approach') {
        const targetPos = new THREE.Vector3(head.x + 8, head.y + 4, head.z + 14);
        this.camera.position.lerp(targetPos, delta * 4.0);
        this.cameraTarget.lerp(this.butterflyGroup.position, delta * 5.0);
        this.camera.lookAt(this.cameraTarget);
      } else if (this.storyStage === 'perch-nose') {
        const targetPos = new THREE.Vector3(head.x + 4.5, head.y + 1.8, head.z + 7.5);
        this.camera.position.lerp(targetPos, delta * 4.5);
        this.cameraTarget.lerp(head, delta * 5.5);
        this.camera.lookAt(this.cameraTarget);
      } else {
        // 'lotus-nest-smile': Epic crane view over the resting smiling dragon
        const angle = this.dragonTime * 0.25;
        const targetPos = new THREE.Vector3(Math.sin(angle) * 18, 9 + Math.sin(angle * 2) * 1.5, Math.cos(angle) * 18);
        this.camera.position.lerp(targetPos, delta * 3.0);
        this.cameraTarget.lerp(new THREE.Vector3(0, -1.0, 0), delta * 4.0);
        this.camera.lookAt(this.cameraTarget);
      }
    } else if (this.cameraMode === 'butterfly-cam') {
      const bPos = this.butterflyGroup.position;
      const targetPos = new THREE.Vector3(bPos.x + 2, bPos.y + 1.5, bPos.z + 5);
      this.camera.position.lerp(targetPos, delta * 6.0);
      this.cameraTarget.lerp(head, delta * 6.0);
      this.camera.lookAt(this.cameraTarget);
    } else if (this.cameraMode === 'follow-dragon') {
      const targetPos = new THREE.Vector3(
        head.x + this.mouse.x * 10,
        head.y + 8 - this.mouse.y * 8,
        head.z + 28
      );
      this.camera.position.lerp(targetPos, delta * 4.0);
      this.cameraTarget.lerp(head, delta * 5.0);
      this.camera.lookAt(this.cameraTarget);
    } else if (this.cameraMode === 'orbit') {
      const radius = 45;
      const angle = this.dragonTime * 0.25 + this.mouse.x * 2.5;
      const height = 15 - this.mouse.y * 20;

      const targetPos = new THREE.Vector3(
        Math.sin(angle) * radius,
        height,
        Math.cos(angle) * radius
      );
      this.camera.position.lerp(targetPos, delta * 3.0);
      this.cameraTarget.lerp(new THREE.Vector3(0, 0, 0), delta * 4.0);
      this.camera.lookAt(this.cameraTarget);
    } else if (this.cameraMode === 'cinematic') {
      const flyX = Math.sin(this.dragonTime * 0.4) * 35;
      const flyY = Math.cos(this.dragonTime * 0.3) * 20 + 5;
      const flyZ = Math.cos(this.dragonTime * 0.25) * 45;

      this.camera.position.lerp(new THREE.Vector3(flyX, flyY, flyZ), delta * 2.5);
      this.cameraTarget.lerp(head, delta * 3.5);
      this.camera.up.set(0, 1, 0);
      this.camera.lookAt(this.cameraTarget);
    } else if (this.cameraMode === 'random-cinematic') {
      this.updateRandomCinematicCamera(delta);
    } else if (this.cameraMode === 'macro') {
      const focusSegment = this.spineSegments[12] || this.headGroup;
      const targetPos = new THREE.Vector3(
        focusSegment.position.x + 3.5,
        focusSegment.position.y + 2.5,
        focusSegment.position.z + 6.0
      );
      this.camera.position.lerp(targetPos, delta * 5.0);
      this.cameraTarget.lerp(focusSegment.position, delta * 6.0);
      this.camera.up.set(0, 1, 0);
      this.camera.lookAt(this.cameraTarget);
    }
  }

  /**
   * Evaluates the current active viewpoint in Randomized Cinematic mode,
   * applying smooth camera positioning, orientation lerping, dynamic roll (Dutch angle),
   * and bass-reactive FOV breathing.
   */
  private updateRandomCinematicCamera(delta: number) {
    const head = this.headGroup.position;
    const vp = CINEMATIC_VIEWPOINTS[this.activeViewpointIndex] || CINEMATIC_VIEWPOINTS[0];
    const calculated = vp.calculate(
      this.dragonTime,
      this.audioBassSmoothed,
      head,
      this.spineSegments,
      this.mouse,
      this.viewpointSeed
    );

    const speed = calculated.speed || 4.2;
    this.camera.position.lerp(calculated.position, delta * speed);
    this.cameraTarget.lerp(calculated.target, delta * (speed + 1.2));

    // Dynamic camera roll (Dutch angle tilt)
    this.targetCameraRoll = calculated.roll || 0;
    this.currentCameraRoll = THREE.MathUtils.lerp(
      this.currentCameraRoll,
      this.targetCameraRoll,
      delta * 4.0
    );
    this.camera.up.set(Math.sin(this.currentCameraRoll), Math.cos(this.currentCameraRoll), 0);
    this.camera.lookAt(this.cameraTarget);

    // Dynamic FOV interpolation
    this.targetCameraFov = calculated.fov || 60;
    if (Math.abs(this.camera.fov - this.targetCameraFov) > 0.05) {
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.targetCameraFov, delta * 4.0);
      this.camera.updateProjectionMatrix();
    }
  }

  // ==========================================
  // AUDIO REACTION ENGINE
  // ==========================================
  public updateAudio(data: AudioVisualizerData) {
    const { bass, mid, treble } = data;

    // 1. Dragon Jaw Reaction (moves on anatomical hinge)
    if (this.jawGroup) {
      if (this.smileAmount < 0.1) {
        this.jawGroup.rotation.x = -bass * 0.42;
      } else {
        // While smiling, maintain warm curve with vocal/bass bounce
        this.jawGroup.rotation.x = this.smileAmount * 0.26 + bass * 0.12;
      }
    }

    // 2. Dragon Eye & Head Light Pulsing
    if (this.pointLightHead) {
      this.pointLightHead.intensity = 3.5 + bass * 8.5;
    }
    if (this.eyeMaterial) {
      if (this.smileAmount > 0.4) {
        this.eyeMaterial.color.setHex(bass > 0.6 ? 0xfff0aa : 0xffea00);
      } else {
        this.eyeMaterial.color.setHex(bass > 0.6 ? 0xffffff : this.currentTheme.eyeColor);
      }
    }

    // 3. REAL-TIME BASS-PROPORTIONAL TEXTURE EMISSION INTENSITY SCALING
    // Calculate sub-bass (20-60Hz) and punch-bass (60-150Hz) from real-time FFT spectrum bins
    const subBassBin = data.frequencies.length > 2
      ? (data.frequencies[0] + data.frequencies[1]) / (2 * 255)
      : bass;
    const punchBassBin = data.frequencies.length > 6
      ? (data.frequencies[2] + data.frequencies[3] + data.frequencies[4]) / (3 * 255)
      : bass;
    const effectiveBass = Math.max(bass, subBassBin * 0.9, punchBassBin * 0.95);
    const bassPeak = Math.pow(effectiveBass, 1.5); // High dynamic contrast response curve

    // Scale texture emission intensity across materials proportionally to bass frequency data
    if (this.scaleMaterial) {
      this.scaleMaterial.emissiveIntensity =
        (0.32 + effectiveBass * 2.4 + bassPeak * 1.8) * this.textureEmissionMultiplier;
    }
    if (this.spikeMaterial) {
      this.spikeMaterial.emissiveIntensity =
        (1.1 + effectiveBass * 4.8 + bassPeak * 3.6) * this.textureEmissionMultiplier;
    }
    if (this.hornMaterial) {
      this.hornMaterial.emissiveIntensity =
        (0.48 + effectiveBass * 3.2 + bassPeak * 2.0) * this.textureEmissionMultiplier;
    }
    if (this.darkChassisMaterial) {
      this.darkChassisMaterial.emissiveIntensity =
        (0.20 + effectiveBass * 1.4 + bassPeak * 0.8) * this.textureEmissionMultiplier;
    }
    if (this.neckCollarMaterial) {
      this.neckCollarMaterial.emissiveIntensity =
        (0.24 + effectiveBass * 2.0 + bassPeak * 1.2) * this.textureEmissionMultiplier;
    }
    if (this.chromeTeethMaterial) {
      this.chromeTeethMaterial.emissiveIntensity =
        (0.35 + effectiveBass * 1.6) * this.textureEmissionMultiplier;
    }

    // Scroll procedural texture coordinates with real-time bass pulsation
    if (this.scaleEmissiveTexture) {
      this.scaleEmissiveTexture.offset.y = (this.dragonTime * 0.12 + effectiveBass * 0.15) % 1.0;
    }
    if (this.spikeEmissiveTexture) {
      this.spikeEmissiveTexture.offset.y = (this.dragonTime * 0.28 + effectiveBass * 0.35) % 1.0;
    }

    // 4. REAL-TIME BASS-PROPORTIONAL SPIKE SCALING (DORSAL SPINE & CRANIAL)
    // A. 54 Articulated Dorsal Spine Vertebrae Spikes
    for (let i = 0; i < this.spineSpikes.length; i++) {
      const spike = this.spineSpikes[i];
      const base = (spike.userData.baseScale as THREE.Vector3) || new THREE.Vector3(1, 1, 1);
      const freqIndex = Math.min(i % 16, data.frequencies.length - 1);
      const localFreq = data.frequencies[freqIndex] / 255;

      // Dynamic 3D spike scaling: length and lateral thickness flare with 808 sub-bass & FFT wave
      const lengthScale = 1.0 + effectiveBass * 2.4 + localFreq * 1.3 + bassPeak * 1.1;
      const thicknessScale = 1.0 + effectiveBass * 0.85 + bassPeak * 0.45;

      spike.scale.set(
        base.x * thicknessScale * this.spikeScaleMultiplier,
        base.y * lengthScale * this.spikeScaleMultiplier,
        base.z * thicknessScale * this.spikeScaleMultiplier
      );
    }

    // B. Cranial Spikes, Swept-Back Horns & Luminous Horn Fins
    for (let i = 0; i < this.cranialSpikes.length; i++) {
      const cSpike = this.cranialSpikes[i];
      const base = (cSpike.userData.baseScale as THREE.Vector3) || new THREE.Vector3(1, 1, 1);
      const hornLengthScale = 1.0 + effectiveBass * 1.75 + bassPeak * 0.9;
      const hornThickScale = 1.0 + effectiveBass * 0.65;
      cSpike.scale.set(
        base.x * hornThickScale * this.spikeScaleMultiplier,
        base.y * hornLengthScale * this.spikeScaleMultiplier,
        base.z * hornThickScale * this.spikeScaleMultiplier
      );
    }

    // 5. Monolith Core Pulse
    if (this.monolithCore && this.activeModule === 'audio-monolith') {
      const scale = 1.0 + bass * 0.75;
      this.monolithCore.scale.set(scale, scale, scale);

      for (let i = 0; i < this.monolithBars.length; i++) {
        const bar = this.monolithBars[i];
        const val = data.frequencies[i % data.frequencies.length] / 255;
        bar.scale.y = 0.5 + val * 6.0;
      }
    }

    // 6. Camera Shake on heavy 808 drops
    if (bass > 0.75 && this.cameraMode !== 'macro') {
      this.camera.position.x += (Math.random() - 0.5) * bass * 0.5;
      this.camera.position.y += (Math.random() - 0.5) * bass * 0.5;
    }

    // 7. Background Fog Layer Bass Surge
    this.audioBassSmoothed = Math.max(this.audioBassSmoothed * 0.92, bass);

    // 8. HIGH-ENERGY SPIKE EXPLOSION TRIGGER
    // Disperses cyber-particles outwards from the dragon's spikes on highest bass peaks
    const deltaBass = bass - this.lastBassSample;
    const isHighestBassPeak = effectiveBass > 0.76 || (bass > 0.65 && deltaBass > 0.13);
    if (isHighestBassPeak) {
      const explosionIntensity = Math.min(1.0, Math.max(0.45, (effectiveBass - 0.5) / 0.5));
      this.triggerSpikeExplosion(explosionIntensity);
    }

    // 9. RANDOMIZED CINEMATIC BEAT-SYNC SWITCHER
    // Detects significant bass peaks in the Raw Power audio track to dynamically
    // switch between orbital and tracking viewpoints.
    if (this.cameraMode === 'random-cinematic') {
      const now = performance.now();
      const timeSinceSwitch = (now - this.lastCinematicSwitchTime) / 1000;

      // Peak Conditions:
      // A. Sharp transient bass onset (808 drop / kick hit): bass > 0.62 && deltaBass > 0.12 (min 0.65s cooldown)
      // B. Major sub-bass peak: bass > 0.82 (min 0.75s cooldown)
      // C. Cadence timeout: 4.5s auto-cut if music enters a calm breakdown
      const isTransientPeak = bass > 0.62 && deltaBass > 0.12 && timeSinceSwitch > 0.65;
      const isHeavySubPeak = bass > 0.82 && timeSinceSwitch > 0.75;
      const isCadenceTimeout = timeSinceSwitch > 4.5;

      if (isTransientPeak || isHeavySubPeak) {
        this.triggerRandomCinematicCut('bass-peak', bass);
      } else if (isCadenceTimeout) {
        this.triggerRandomCinematicCut('cadence', bass);
      }
    }

    // 10. DYNAMIC CHROMATIC ABERRATION AUDIO MODULATION
    // Shifts color channels proportionally based on current bass level & transient surges
    const baseAberration = 0.08;
    const bassAberration = Math.pow(effectiveBass, 2.0) * 2.2;
    const transientAberration = (deltaBass > 0.12 && bass > 0.58) ? 1.5 : 0.0;
    this.targetChromaticAberration =
      (baseAberration + bassAberration + transientAberration) * this.chromaticAberrationMultiplier;

    // Micro-scanline RGB split jitter during heavy 808 sub drops
    this.chromaticGlitchIntensity =
      effectiveBass > 0.70 ? Math.min(1.0, (effectiveBass - 0.70) * 3.6) : 0.0;

    this.lastBassSample = bass;
  }

  // Module Switcher
  public setModule(module: ModuleType) {
    this.activeModule = module;

    this.lotusGroup.visible = module === 'lotus-enigma';
    this.butterflyGroup.visible = module === 'lotus-enigma';
    this.butterflyTrailLine.visible = module === 'lotus-enigma';
    this.heartSmileParticles.visible = module === 'lotus-enigma';
    this.vortexGroup.visible = module === 'cyber-vortex';
    this.monolithGroup.visible = module === 'audio-monolith';
    this.macroGroup.visible = module === 'scales-macro';

    if (module === 'lotus-enigma') {
      this.cameraMode = 'story-director';
    } else if (module === 'scales-macro') {
      this.cameraMode = 'macro';
    } else if (module === 'cyber-vortex') {
      this.cameraMode = 'follow-dragon';
    } else if (module === 'audio-monolith') {
      this.cameraMode = 'orbit';
    } else {
      this.cameraMode = 'follow-dragon';
    }

    this.pointLightHead.intensity = 15.0;
  }

  public setStoryStage(stage: StoryStage) {
    this.storyStage = stage;
    this.pointLightHead.intensity = 12.0;
  }

  public getStoryStage(): StoryStage {
    return this.storyStage;
  }

  public setStoryTime(currentTime: number, _duration: number) {
    if (this.activeModule !== 'lotus-enigma') return;
    if (currentTime < 75) {
      if (this.storyStage !== 'chase') this.storyStage = 'chase';
    } else if (currentTime < 98) {
      if (this.storyStage !== 'approach') this.storyStage = 'approach';
    } else if (currentTime < 112) {
      if (this.storyStage !== 'perch-nose') this.storyStage = 'perch-nose';
    } else {
      if (this.storyStage !== 'lotus-nest-smile') this.storyStage = 'lotus-nest-smile';
    }
  }

  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
    if (mode === 'random-cinematic') {
      this.lastCinematicSwitchTime = performance.now();
      this.triggerRandomCinematicCut('manual', 0.8);
    } else {
      // Reset camera orientation up vector and FOV
      this.currentCameraRoll = 0;
      this.targetCameraRoll = 0;
      this.camera.up.set(0, 1, 0);
      this.camera.fov = 60;
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * Randomly switches the cinematic camera to a new viewpoint.
   * Triggered automatically on heavy 808 bass drops or cadence intervals.
   */
  public triggerRandomCinematicCut(
    trigger: 'bass-peak' | 'cadence' | 'manual' = 'bass-peak',
    bass = 0.8
  ) {
    const prevIndex = this.activeViewpointIndex;
    const len = CINEMATIC_VIEWPOINTS.length;
    let nextIndex = prevIndex;
    let attempts = 0;

    // Pick a new viewpoint different from current
    while (nextIndex === prevIndex && attempts < 12) {
      nextIndex = Math.floor(Math.random() * len);
      attempts++;
    }

    this.activeViewpointIndex = nextIndex;
    this.lastCinematicSwitchTime = performance.now();
    this.viewpointSeed = Math.random() * 1000;

    const vp = CINEMATIC_VIEWPOINTS[nextIndex] || CINEMATIC_VIEWPOINTS[0];
    this.activeViewpointName = vp.name;

    // Subtle punch-in zoom on heavy bass drop for cinematic impact
    if (trigger === 'bass-peak' && bass > 0.65) {
      this.camera.fov = Math.max(38, this.camera.fov - 3.5 * bass);
      this.camera.updateProjectionMatrix();
    }

    if (this.onCinematicViewpointChange) {
      this.onCinematicViewpointChange({
        id: vp.id,
        name: vp.name,
        trigger,
        bass,
      });
    }
  }

  public getActiveViewpointName(): string {
    return this.activeViewpointName;
  }

  public getCinematicViewpoints(): CinematicViewpointDef[] {
    return CINEMATIC_VIEWPOINTS;
  }

  public getActiveCinematicIndex(): number {
    return this.activeViewpointIndex;
  }

  public setTheme(themeId: string) {
    const found = COLOR_THEMES.find(t => t.id === themeId);
    if (!found) return;
    this.currentTheme = found;

    this.scene.background = new THREE.Color(found.bgFog);
    if (this.scene.fog) {
      this.scene.fog.color.setHex(found.bgFog);
    }
    if (this.bgFogMaterial) {
      this.bgFogMaterial.uniforms.uDeepColor.value.setHex(found.bgFog);
    }
    this.ambientLight.color.setHex(found.ambientLight);
    this.rimLight.color.setHex(found.spineColor);
    this.pointLightHead.color.setHex(found.eyeColor);

    this.scaleMaterial.color.setHex(found.scaleColor);
    this.scaleMaterial.emissive.setHex(found.scaleColor);
    this.circuitMaterial.color.setHex(found.scaleColor);
    this.chromeTeethMaterial.emissive.setHex(found.eyeColor);
    this.neckCollarMaterial.emissive.setHex(found.scaleColor);
    this.spikeMaterial.color.setHex(found.spineColor);
    this.spikeMaterial.emissive.setHex(found.spineColor);
    this.hornMaterial.emissive.setHex(found.glowColor);
    this.eyeMaterial.color.setHex(found.eyeColor);
    this.trailMaterial.color.setHex(found.trailColor);
    this.breathMaterial.color.setHex(found.eyeColor);
  }

  public setSpeed(multiplier: number) {
    this.speedMultiplier = multiplier;
  }

  public setFogIntensity(intensity: number) {
    this.fogIntensity = THREE.MathUtils.clamp(intensity, 0, 2);
    if (this.bgFogMaterial) {
      this.bgFogMaterial.uniforms.uIntensity.value = this.fogIntensity;
    }
  }

  public getFogIntensity(): number {
    return this.fogIntensity;
  }

  // Event Handlers
  private onResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    const dpr = Math.min(window.devicePixelRatio, 2);
    if (this.renderTarget) {
      this.renderTarget.setSize(
        Math.max(1, Math.floor(width * dpr)),
        Math.max(1, Math.floor(height * dpr))
      );
    }
    if (this.postMaterial) {
      this.postMaterial.uniforms.uResolution.value.set(
        Math.max(1, Math.floor(width * dpr)),
        Math.max(1, Math.floor(height * dpr))
      );
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.targetY = (e.clientY / window.innerHeight) * 2 - 1;
  };

  private onTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      this.mouse.targetX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = (e.touches[0].clientY / window.innerHeight) * 2 - 1;
    }
  };

  private onMouseDown = () => {
    this.mouse.isDown = true;
  };

  private onMouseUp = () => {
    this.mouse.isDown = false;
  };

  // =========================================================================
  // DRAGON9 × RAW POWER: ARTIST MPEG-4 EXPORT PIPELINE
  //
  // Embedded WebGL export pipeline for 3D motion designers and visual artists.
  // Outputs broadcast-grade MPEG-4 (H.264 / AAC) with embedded "Dragon9 with
  // Raw Power" credit watermark, synchronized Web Audio, and custom resolution.
  //
  // ARTIST WORKFLOW INSTRUCTIONS:
  // 1. Programmatic Trigger:
  //    scene.startMpeg4Recording({
  //      format: 'mp4',
  //      resolution: '1080p',
  //      fps: 60,
  //      durationSeconds: 15,
  //      includeAudio: true,
  //      audioStreamDestination: audioEngine.getOrCreateMediaStreamDestination(),
  //      creditText: 'Dragon9 with Raw Power',
  //      showWatermark: true,
  //      watermarkPosition: 'bottom-right',
  //      onComplete: (res) => console.log('MP4 exported:', res.filename)
  //    });
  //
  // 2. Headless / Termux Post-Processing:
  //    See scripts/export_pipeline_dragon9.sh for ffmpeg remuxing and native
  //    Android intent sharing via termux-share.
  // =========================================================================

  /**
   * Evaluates browser MediaRecorder capabilities for MPEG-4 / H.264 support
   */
  public static getCapabilities(): PipelineCapabilities {
    const candidates = [
      { mime: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', ext: 'mp4' },
      { mime: 'video/mp4;codecs=avc1', ext: 'mp4' },
      { mime: 'video/mp4', ext: 'mp4' },
      { mime: 'video/webm;codecs=h264,opus', ext: 'mp4' },
      { mime: 'video/webm;codecs=vp9,opus', ext: 'webm' },
      { mime: 'video/webm;codecs=vp8,opus', ext: 'webm' },
      { mime: 'video/webm', ext: 'webm' },
    ];
    const available: string[] = [];
    let optimalMime = 'video/webm';
    let optimalExt = 'webm';
    let isMp4 = false;

    if (typeof MediaRecorder !== 'undefined') {
      for (const c of candidates) {
        if (MediaRecorder.isTypeSupported(c.mime)) {
          available.push(c.mime);
          if (!isMp4) {
            optimalMime = c.mime;
            optimalExt = c.ext;
            if (c.mime.includes('mp4') || c.mime.includes('h264')) {
              isMp4 = true;
            }
          }
        }
      }
    }

    return {
      isMp4Supported: isMp4 || optimalExt === 'mp4',
      optimalMimeType: optimalMime,
      optimalExtension: optimalExt,
      availableCodecs: available,
    };
  }

  /**
   * Starts real-time WebGL canvas stream recording to an MPEG-4 container
   */
  public async startMpeg4Recording(config: Dragon9ExportConfig): Promise<boolean> {
    if (this.isRecordingVideo) {
      console.warn('Dragon9 Export Pipeline: Recording already active.');
      return false;
    }

    try {
      this.activeExportConfig = config;
      this.exportWatermarkEnabled = config.showWatermark !== false;
      this.exportWatermarkText = config.creditText || 'Dragon9 with Raw Power';
      this.exportWatermarkPos = config.watermarkPosition || 'bottom-right';

      // 1. Determine output dimensions (macroblock-aligned)
      let targetW = this.renderer.domElement.width;
      let targetH = this.renderer.domElement.height;

      if (config.resolution === '1080p') {
        targetW = 1920;
        targetH = 1080;
      } else if (config.resolution === '720p') {
        targetW = 1280;
        targetH = 720;
      }

      targetW = targetW & ~1;
      targetH = targetH & ~1;

      // 2. Offscreen composite canvas for clean watermark embedding
      this.exportCanvas = document.createElement('canvas');
      this.exportCanvas.width = targetW;
      this.exportCanvas.height = targetH;
      this.exportCtx = this.exportCanvas.getContext('2d', { alpha: false });

      // 3. Capture stream at specified FPS (default 60 fps)
      const videoStream = this.exportCanvas.captureStream(config.fps || 60);
      let streamToRecord: MediaStream = videoStream;

      // 4. Attach audio tracks from Web Audio synthesizer / Raw Power track
      if (config.includeAudio && config.audioStreamDestination) {
        const audioTracks = config.audioStreamDestination.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          streamToRecord = new MediaStream([
            videoStream.getVideoTracks()[0],
            audioTracks[0],
          ]);
        }
      }

      // 5. Determine optimal codec
      const caps = DragonScene.getCapabilities();
      let chosenMime = caps.optimalMimeType;
      if (config.format === 'mp4' && caps.isMp4Supported) {
        chosenMime = caps.optimalMimeType;
      }

      const recorder = new MediaRecorder(streamToRecord, {
        mimeType: chosenMime,
        videoBitsPerSecond: 16_000_000, // 16 Mbps high profile
      });

      this.recordedChunks = [];

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(this.recordedChunks, { type: chosenMime });
        const ext = chosenMime.includes('mp4') || chosenMime.includes('avc1') ? 'mp4' : 'webm';
        const url = URL.createObjectURL(finalBlob);
        const filename = `Dragon9_RawPower_${this.currentTheme.id}_${Date.now()}.${ext}`;

        const elapsed = (performance.now() - this.recordingStartTime) / 1000;
        const result: Dragon9ExportResult = {
          blob: finalBlob,
          mimeType: chosenMime,
          filename,
          url,
          durationSeconds: elapsed,
          width: targetW,
          height: targetH,
          credit: this.exportWatermarkText,
          fileSizeBytes: finalBlob.size,
        };

        if (this.activeExportConfig?.onComplete) {
          this.activeExportConfig.onComplete(result);
        }

        if (this.exportStopResolver) {
          this.exportStopResolver(result);
          this.exportStopResolver = null;
        }

        this.isRecordingVideo = false;
        this.activeExportConfig = null;
        this.mediaRecorder = null;
      };

      this.mediaRecorder = recorder;
      this.isRecordingVideo = true;
      this.recordingStartTime = performance.now();

      recorder.start(100);
      return true;
    } catch (err: any) {
      console.error('Dragon9 Export Pipeline Error:', err);
      this.isRecordingVideo = false;
      if (config.onError) config.onError(err);
      return false;
    }
  }

  /**
   * Stops recording and returns the final MPEG-4 export package
   */
  public stopMpeg4Recording(): Promise<Dragon9ExportResult | null> {
    return new Promise((resolve, reject) => {
      if (!this.isRecordingVideo || !this.mediaRecorder) {
        resolve(null);
        return;
      }
      this.exportStopResolver = resolve;
      this.exportStopRejecter = reject;

      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
    });
  }

  public isRecording(): boolean {
    return this.isRecordingVideo;
  }

  public setExportWatermark(
    enabled: boolean,
    text = 'Dragon9 with Raw Power',
    position: WatermarkPosition = 'bottom-right'
  ) {
    this.exportWatermarkEnabled = enabled;
    this.exportWatermarkText = text;
    this.exportWatermarkPos = position;
  }

  /**
   * Draws the stylized "Dragon9 with Raw Power" artist credit overlay
   */
  public drawArtistCreditWatermark(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    elapsedSec: number
  ) {
    ctx.save();

    const scale = Math.max(0.6, Math.min(width / 1920, height / 1080));
    const padding = 24 * scale;
    const boxW = 390 * scale;
    const boxH = 78 * scale;

    let posX = width - boxW - padding;
    let posY = height - boxH - padding;

    if (this.exportWatermarkPos === 'bottom-left') {
      posX = padding;
      posY = height - boxH - padding;
    } else if (this.exportWatermarkPos === 'top-right') {
      posX = width - boxW - padding;
      posY = padding;
    } else if (this.exportWatermarkPos === 'center-lower') {
      posX = (width - boxW) / 2;
      posY = height - boxH - padding - 16 * scale;
    }

    // Glass panel backdrop
    ctx.fillStyle = 'rgba(5, 5, 14, 0.82)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.lineWidth = 1.5 * scale;

    const radius = 10 * scale;
    ctx.beginPath();
    ctx.roundRect(posX, posY, boxW, boxH, radius);
    ctx.fill();
    ctx.stroke();

    // Glowing cyan/magenta accent bar
    const barGradient = ctx.createLinearGradient(posX, posY, posX + boxW, posY);
    barGradient.addColorStop(0, '#00f0ff');
    barGradient.addColorStop(0.5, '#ec4899');
    barGradient.addColorStop(1, '#a855f7');
    ctx.fillStyle = barGradient;
    ctx.fillRect(posX + 4 * scale, posY + 4 * scale, 3.5 * scale, boxH - 8 * scale);

    // Audio reactive micro meter
    const numBars = 8;
    const meterStartX = posX + boxW - 68 * scale;
    const meterBaseY = posY + boxH - 20 * scale;
    const meterMaxH = 24 * scale;
    for (let b = 0; b < numBars; b++) {
      const barH = Math.max(
        3 * scale,
        meterMaxH * (this.audioBassSmoothed * 0.9 + Math.sin(elapsedSec * 8 + b) * 0.2)
      );
      ctx.fillStyle = b > 5 ? '#ec4899' : '#00f0ff';
      ctx.fillRect(meterStartX + b * 6 * scale, meterBaseY - barH, 4 * scale, barH);
    }

    // Primary Artist Credit Text: "DRAGON9 WITH RAW POWER"
    ctx.font = `bold ${Math.round(13.5 * scale)}px "JetBrains Mono", monospace, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(this.exportWatermarkText.toUpperCase(), posX + 16 * scale, posY + 26 * scale);

    // Subtitle Line: "FLUID MOTION WEBGL // RAW POWER"
    ctx.font = `${Math.round(10 * scale)}px monospace, sans-serif`;
    ctx.fillStyle = 'rgba(165, 180, 252, 0.88)';
    ctx.fillText('FLUID MOTION WEBGL • RAW POWER SOUNDTRACK', posX + 16 * scale, posY + 44 * scale);

    // Timecode & Rec status
    const mins = Math.floor(elapsedSec / 60);
    const secs = (elapsedSec % 60).toFixed(1).padStart(4, '0');
    const isBlink = Math.floor(elapsedSec * 2) % 2 === 0;

    // Red recording dot
    if (isBlink) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(posX + 20 * scale, posY + 62 * scale, 3.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = `600 ${Math.round(9.5 * scale)}px monospace, sans-serif`;
    ctx.fillStyle = '#67e8f9';
    ctx.fillText(
      `REC ${String(mins).padStart(2, '0')}:${secs} • 60 FPS • 124 BPM`,
      posX + 30 * scale,
      posY + 64 * scale
    );

    ctx.restore();
  }

  /**
   * Captures an instant high-resolution PNG snapshot with artist credit
   */
  public async captureHighResScreenshot(
    options: { width?: number; height?: number; credit?: boolean } = {}
  ): Promise<string> {
    const width = (options.width || 1920) & ~1;
    const height = (options.height || 1080) & ~1;
    const credit = options.credit !== false;

    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = width;
    snapCanvas.height = height;
    const snapCtx = snapCanvas.getContext('2d');
    if (!snapCtx) return '';

    snapCtx.drawImage(this.renderer.domElement, 0, 0, width, height);

    if (credit) {
      this.drawArtistCreditWatermark(snapCtx, width, height, 0);
    }

    return snapCanvas.toDataURL('image/png');
  }

  /**
   * Exports the entire 3D Cyber Dragon and Scene structure as Three.js Object JSON
   * for artists to import into Blender or Three.js Editor
   */
  public exportSceneJSON(): string {
    return JSON.stringify(this.scene.toJSON(), null, 2);
  }

  /**
   * Pre-configures and triggers a Cinematic MPEG-4 export run
   */
  public triggerCinematicExport(
    durationSeconds = 15,
    audioDest?: MediaStreamAudioDestinationNode | null
  ): Promise<boolean> {
    this.cameraMode = 'cinematic';
    return this.startMpeg4Recording({
      format: 'mp4',
      fps: 60,
      durationSeconds,
      resolution: '1080p',
      includeAudio: !!audioDest,
      audioStreamDestination: audioDest || null,
      creditText: 'Dragon9 with Raw Power',
      showWatermark: true,
      watermarkPosition: 'bottom-right',
    });
  }

  public setSpikeBassScaling(multiplier: number) {
    this.spikeScaleMultiplier = THREE.MathUtils.clamp(multiplier, 0.2, 3.0);
  }

  public getSpikeBassScaling(): number {
    return this.spikeScaleMultiplier;
  }

  public setTextureEmissionScaling(multiplier: number) {
    this.textureEmissionMultiplier = THREE.MathUtils.clamp(multiplier, 0.2, 3.0);
  }

  public getTextureEmissionScaling(): number {
    return this.textureEmissionMultiplier;
  }

  public setChromaticAberrationEnabled(enabled: boolean) {
    this.isChromaticAberrationEnabled = enabled;
  }

  public isChromaticAberrationActive(): boolean {
    return this.isChromaticAberrationEnabled;
  }

  public setChromaticAberrationMultiplier(multiplier: number) {
    this.chromaticAberrationMultiplier = THREE.MathUtils.clamp(multiplier, 0, 3.0);
  }

  public getChromaticAberrationMultiplier(): number {
    return this.chromaticAberrationMultiplier;
  }

  public getChromaticAberrationAmount(): number {
    return this.chromaticAberrationAmount;
  }

  public setBloomIntensity(intensity: number) {
    this.bloomIntensity = THREE.MathUtils.clamp(intensity, 0.0, 3.0);
    if (this.postMaterial) {
      this.postMaterial.uniforms.uBloomIntensity.value = this.bloomIntensity;
    }
  }

  public getBloomIntensity(): number {
    return this.bloomIntensity;
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.isRecordingVideo && this.mediaRecorder) {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        // ignore
      }
    }
    this.exportCanvas = null;
    this.exportCtx = null;

    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);

    this.renderer.dispose();
    if (this.renderTarget) {
      this.renderTarget.dispose();
    }
    if (this.postMaterial) {
      this.postMaterial.dispose();
    }
    if (this.postQuad) {
      this.postQuad.geometry.dispose();
    }
    if (this.scaleEmissiveTexture) {
      this.scaleEmissiveTexture.dispose();
    }
    if (this.spikeEmissiveTexture) {
      this.spikeEmissiveTexture.dispose();
    }
    if (this.chassisEmissiveTexture) {
      this.chassisEmissiveTexture.dispose();
    }
    if (this.bgFogMaterial) {
      this.bgFogMaterial.dispose();
    }
    if (this.bgFogDome) {
      this.bgFogDome.geometry.dispose();
    }
    if (this.fogRadialTexture) {
      this.fogRadialTexture.dispose();
    }
    if (this.explosionTexture) {
      this.explosionTexture.dispose();
    }
    if (this.explosionMaterial) {
      this.explosionMaterial.dispose();
    }
    if (this.explosionGeometry) {
      this.explosionGeometry.dispose();
    }
    for (const wisp of this.volumetricFogWisps) {
      (wisp.material as THREE.Material).dispose();
      wisp.geometry.dispose();
    }
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}

