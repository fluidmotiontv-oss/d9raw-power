export type ModuleType = 'lotus-enigma' | 'spine-genesis' | 'cyber-vortex' | 'audio-monolith' | 'scales-macro';

export type StoryStage = 'chase' | 'approach' | 'perch-nose' | 'lotus-nest-smile';

export type CameraMode = 'story-director' | 'follow-dragon' | 'butterfly-cam' | 'orbit' | 'cinematic' | 'random-cinematic' | 'macro';

export interface DragonColorTheme {
  id: string;
  name: string;
  scaleColor: number;
  spineColor: number;
  glowColor: number;
  trailColor: number;
  eyeColor: number;
  ambientLight: number;
  bgFog: number;
}

export interface AudioVisualizerData {
  bass: number;       // 0 to 1
  mid: number;        // 0 to 1
  treble: number;     // 0 to 1
  overall: number;    // 0 to 1
  frequencies: Uint8Array;
  waveformData: Uint8Array;
}

export interface TtsPreset {
  id: string;
  title: string;
  text: string;
  style: string;
  voice: 'Fenrir' | 'Charon' | 'Puck' | 'Kore' | 'Zephyr';
}

export type ExportResolution = 'native' | '1080p' | '720p';

export type WatermarkPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'center-lower';

export interface Dragon9ExportConfig {
  format: 'mp4' | 'webm';
  fps: number; // 30 or 60
  durationSeconds: number; // 0 for continuous / manual stop, or > 0 for automated timer
  resolution: ExportResolution;
  includeAudio: boolean;
  creditText: string; // e.g. "Dragon9 with Raw Power"
  showWatermark: boolean;
  watermarkPosition: WatermarkPosition;
  audioStreamDestination?: MediaStreamAudioDestinationNode | null;
  onProgress?: (progress: number, elapsedSec: number, totalSec: number) => void;
  onFrame?: (frameIndex: number, fps: number) => void;
  onComplete?: (result: Dragon9ExportResult) => void;
  onError?: (err: Error) => void;
}

export interface Dragon9ExportResult {
  blob: Blob;
  mimeType: string;
  filename: string;
  url: string;
  durationSeconds: number;
  width: number;
  height: number;
  credit: string;
  fileSizeBytes: number;
}

export interface PipelineCapabilities {
  isMp4Supported: boolean;
  optimalMimeType: string;
  optimalExtension: string;
  availableCodecs: string[];
}

