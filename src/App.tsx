import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Flame,
  Zap,
  Mic,
  Sliders,
  Sparkles,
  Maximize2,
  Minimize2,
  Upload,
  Radio,
  Eye,
  Disc,
  Layers,
  ChevronRight,
  Send,
  Loader2,
  Smile,
  Heart,
  Video,
  Download,
  Share2,
  Camera,
  Film,
  CheckCircle2,
  X,
  SlidersHorizontal,
  Info,
  Clapperboard,
  Globe,
  FileCode,
  Shuffle,
  Sun,
} from 'lucide-react';
import { DragonScene, COLOR_THEMES } from './webgl/DragonScene';
import { AudioEngine } from './audio/AudioEngine';
import {
  ModuleType,
  CameraMode,
  StoryStage,
  TtsPreset,
  Dragon9ExportResult,
  PipelineCapabilities,
  WatermarkPosition,
  ExportResolution,
} from './types';

const TTS_PRESETS: TtsPreset[] = [
  {
    id: 'story-smile',
    title: 'Act IV: Lotus Nest & Both Smile',
    text: 'Resting in the glowing Lotus Enigma petals! Butterfly on the nose, look at that dragon smile! Pure peace and raw power!',
    style: 'Deep, warm, joyful MC hype delivery with heavy resonant 808 sub glow',
    voice: 'Fenrir',
  },
  {
    id: 'story-perch',
    title: 'Act III: Butterfly on the Nose',
    text: 'Check it right there! Neon wings fluttering on his snout, frozen in awe, mutual cyber wonder!',
    style: 'Smooth, rhythmic, laid-back fat bar with deep vocal warmth',
    voice: 'Charon',
  },
  {
    id: 'story-chase',
    title: 'Act I: Chasing the Enigma',
    text: 'Cyber dragon spiraling round the Lotus Enigma! Chasing the glowing butterfly through neon soundwaves, Raw Power in the air!',
    style: 'High octane, rapid-fire hype rap cadence with heavy punch',
    voice: 'Fenrir',
  },
  {
    id: 'rap-hype',
    title: 'Raw Power Soundtrack Tribute',
    text: 'Raw Power on the track, two minutes seven of pure fluid kinetic dragon line motion!',
    style: 'Aggressive, punchy hype rap delivery with fat resonant sub harmonics',
    voice: 'Puck',
  },
];

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sceneRef = useRef<DragonScene | null>(null);
  const audioRef = useRef<AudioEngine | null>(null);

  // App UI state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(127); // 2:07 Raw Power
  const [activeModule, setActiveModule] = useState<ModuleType>('lotus-enigma');
  const [storyStage, setStoryStage] = useState<StoryStage>('chase');
  const [cameraMode, setCameraMode] = useState<CameraMode>('story-director');
  const [activeTheme, setActiveTheme] = useState('cyber-neon');
  const [isMuted, setIsMuted] = useState(false);
  const [bassBoost, setBassBoost] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Gemini 3.8 Flash TTS state
  const [ttsInput, setTtsInput] = useState(TTS_PRESETS[0].text);
  const [selectedVoice, setSelectedVoice] = useState<'Fenrir' | 'Charon' | 'Puck' | 'Kore' | 'Zephyr'>('Fenrir');
  const [ttsStyle, setTtsStyle] = useState(TTS_PRESETS[0].style);
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [ttsStatusMsg, setTtsStatusMsg] = useState<string | null>(null);
  const [showVocalConsole, setShowVocalConsole] = useState(false);

  // Live metrics
  const [fps, setFps] = useState(60);
  const [bassLevel, setBassLevel] = useState(0);
  const [fogIntensity, setFogIntensity] = useState<number>(1.0);
  const [bloomIntensity, setBloomIntensity] = useState<number>(1.25);
  const [autoBloom, setAutoBloom] = useState<boolean>(true);
  const [liveAutoBloomVal, setLiveAutoBloomVal] = useState<number>(1.25);

  // Bloom Timeline Automation State & Keyframes
  const [isRecordingBloomAutomation, setIsRecordingBloomAutomation] = useState<boolean>(false);
  const [bloomKeyframes, setBloomKeyframes] = useState<Array<{ time: number; value: number }>>([]);
  const [isAutomationActive, setIsAutomationActive] = useState<boolean>(false);
  const [bezierInterpolation, setBezierInterpolation] = useState<boolean>(true);
  const [selectedKeyframeIndex, setSelectedKeyframeIndex] = useState<number | null>(null);
  const [draggingKeyframeIndex, setDraggingKeyframeIndex] = useState<number | null>(null);
  const timelineTrackRef = useRef<HTMLDivElement>(null);

  // MPEG-4 Render Pipeline state (Dragon9 with Raw Power credit)
  const [showExportModal, setShowExportModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordingElapsed, setRecordingElapsed] = useState(0);
  const [exportDuration, setExportDuration] = useState<number>(15); // 15s default reel
  const [exportResolution, setExportResolution] = useState<ExportResolution>('1080p');
  const [exportFps, setExportFps] = useState<number>(60);
  const [exportIncludeAudio, setExportIncludeAudio] = useState(true);
  const [exportWatermark, setExportWatermark] = useState(true);
  const [exportWatermarkPos, setExportWatermarkPos] = useState<WatermarkPosition>('bottom-right');
  const [exportCreditText, setExportCreditText] = useState('Dragon9 with Raw Power');
  const [exportResult, setExportResult] = useState<Dragon9ExportResult | null>(null);
  const [pipelineCaps, setPipelineCaps] = useState<PipelineCapabilities | null>(null);
  const [exportStatusMsg, setExportStatusMsg] = useState<string | null>(null);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);

  // Randomized Cinematic Viewpoint & Beat-Sync State
  const [cinematicViewpoint, setCinematicViewpoint] = useState<string>('Orbital 360° Wide Sweep');
  const [bassCutFlash, setBassCutFlash] = useState<boolean>(false);
  const [cinematicCutCount, setCinematicCutCount] = useState<number>(0);
  const [isSpikeExploding, setIsSpikeExploding] = useState<boolean>(false);
  const [chromaticAberration, setChromaticAberration] = useState<boolean>(true);

  // High-Intensity 808 Screen Shake State & Refs
  const [screenShakeEnabled, setScreenShakeEnabled] = useState<boolean>(true);
  const [screenShakeIntensity, setScreenShakeIntensity] = useState<'normal' | 'heavy' | 'extreme'>('heavy');
  const [currentShakeMagnitude, setCurrentShakeMagnitude] = useState<number>(0);
  const [isHeavyShaking, setIsHeavyShaking] = useState<boolean>(false);
  const shakeViewportRef = useRef<HTMLDivElement>(null);
  const traumaRef = useRef<number>(0);
  const lastBassRef = useRef<number>(0);
  const lastShakeTimeRef = useRef<number>(performance.now());
  const screenShakeEnabledRef = useRef<boolean>(true);
  const screenShakeIntensityRef = useRef<'normal' | 'heavy' | 'extreme'>('heavy');
  const autoBloomRef = useRef<boolean>(true);
  const bloomIntensityRef = useRef<number>(1.25);
  const isRecordingBloomAutomationRef = useRef<boolean>(false);
  const bloomKeyframesRef = useRef<Array<{ time: number; value: number }>>([]);
  const isAutomationActiveRef = useRef<boolean>(false);
  const bezierInterpolationRef = useRef<boolean>(true);
  const currentTimeRef = useRef<number>(0);

  useEffect(() => {
    screenShakeEnabledRef.current = screenShakeEnabled;
  }, [screenShakeEnabled]);

  useEffect(() => {
    screenShakeIntensityRef.current = screenShakeIntensity;
  }, [screenShakeIntensity]);

  useEffect(() => {
    autoBloomRef.current = autoBloom;
  }, [autoBloom]);

  useEffect(() => {
    bloomIntensityRef.current = bloomIntensity;
  }, [bloomIntensity]);

  useEffect(() => {
    isRecordingBloomAutomationRef.current = isRecordingBloomAutomation;
  }, [isRecordingBloomAutomation]);

  useEffect(() => {
    bloomKeyframesRef.current = bloomKeyframes;
  }, [bloomKeyframes]);

  useEffect(() => {
    isAutomationActiveRef.current = isAutomationActive;
  }, [isAutomationActive]);

  useEffect(() => {
    bezierInterpolationRef.current = bezierInterpolation;
  }, [bezierInterpolation]);

  // 1. Initialize Audio Engine & WebGL Scene
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    // Initialize Audio Engine
    const audioEngine = new AudioEngine();
    audioRef.current = audioEngine;

    audioEngine.onTimeUpdate = (cur, dur) => {
      setCurrentTime(cur);
      currentTimeRef.current = cur;
      setDuration(dur);
      if (sceneRef.current) {
        sceneRef.current.setStoryTime(cur, dur);
        setStoryStage(sceneRef.current.getStoryStage());
      }
    };

    audioEngine.onStateChange = (playing) => {
      setIsPlaying(playing);
    };

    // Initialize Dragon Scene
    const scene = new DragonScene(canvasContainerRef.current);
    sceneRef.current = scene;

    // Listen to Randomized Cinematic Viewpoint changes
    scene.onCinematicViewpointChange = ({ name, trigger }) => {
      setCinematicViewpoint(name);
      setCinematicCutCount((prev) => prev + 1);
      if (trigger === 'bass-peak') {
        setBassCutFlash(true);
        setTimeout(() => setBassCutFlash(false), 300);
      }
    };

    // Listen to Cyber Spike Explosions
    scene.onSpikeExplosion = () => {
      setIsSpikeExploding(true);
      setTimeout(() => setIsSpikeExploding(false), 350);
    };

    // Loop for passing audio data to WebGL and drawing HUD oscilloscope
    let animationFrameId: number;
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const renderHud = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastFpsUpdate >= 500) {
        setFps(Math.round((frameCount * 1000) / (now - lastFpsUpdate)));
        frameCount = 0;
        lastFpsUpdate = now;
      }

      if (audioRef.current && sceneRef.current) {
        const audioData = audioRef.current.getVisualizerData();
        sceneRef.current.updateAudio(audioData);
        setBassLevel(Math.round(audioData.bass * 100));

        // =========================================================================
        // HIGH-INTENSITY 808 SCREEN SHAKE ENGINE
        // Triggers seismic viewport shake during peak 808 bass levels
        // =========================================================================
        if (screenShakeEnabledRef.current) {
          const dt = Math.min(0.05, (now - lastShakeTimeRef.current) / 1000);
          lastShakeTimeRef.current = now;

          // 1. Analyze sub-bass (20-60Hz) & punch-bass (60-150Hz) FFT bins
          const subBass = audioData.frequencies.length > 2
            ? (audioData.frequencies[0] + audioData.frequencies[1]) / (2 * 255)
            : audioData.bass;
          const punchBass = audioData.frequencies.length > 5
            ? (audioData.frequencies[2] + audioData.frequencies[3] + audioData.frequencies[4]) / (3 * 255)
            : audioData.bass;
          const effectiveBass = Math.max(audioData.bass, subBass * 0.95, punchBass * 0.92);
          const deltaBass = audioData.bass - lastBassRef.current;
          lastBassRef.current = audioData.bass;

          // 2. Intensity multiplier
          const mode = screenShakeIntensityRef.current;
          const intensityMult = mode === 'extreme' ? 1.6 : mode === 'heavy' ? 1.2 : 0.8;

          // 3. Inject trauma on peak 808 drops and sharp transient onsets
          if (effectiveBass > 0.65 || (deltaBass > 0.12 && audioData.bass > 0.50)) {
            const bassExcess = Math.max(0, effectiveBass - 0.52) / 0.48;
            const transientBoost = deltaBass > 0.10 ? deltaBass * 2.4 : 0;
            const addedTrauma = (Math.pow(bassExcess, 1.4) * 0.88 + transientBoost) * intensityMult;
            traumaRef.current = Math.min(1.0, traumaRef.current + addedTrauma);
          }

          // 4. Exponential trauma decay
          traumaRef.current = Math.max(0, traumaRef.current - dt * 2.3);

          // 5. Non-linear power shake curve (Trauma^1.8)
          const shake = Math.pow(traumaRef.current, 1.8);
          const maxOffset = 26 * intensityMult; // Max pixels displacement (up to 42px in extreme mode)
          const maxAngle = 2.4 * intensityMult;  // Max degrees roll (up to 3.8deg)
          const maxZoom = 0.035 * intensityMult; // Max zoom rumble

          if (shake > 0.004) {
            const seed = now * 0.04;
            const shakeX = (Math.sin(seed * 2.3) * 0.7 + (Math.random() - 0.5) * 0.6) * maxOffset * shake;
            const shakeY = (Math.cos(seed * 2.9) * 0.7 + (Math.random() - 0.5) * 0.6) * maxOffset * shake;
            const shakeRot = (Math.sin(seed * 1.5) * 0.7 + (Math.random() - 0.5) * 0.6) * maxAngle * shake;
            const shakeScale = 1.0 + Math.abs(Math.sin(seed * 3.1)) * maxZoom * shake;

            if (shakeViewportRef.current) {
              shakeViewportRef.current.style.transform =
                `translate3d(${shakeX.toFixed(2)}px, ${shakeY.toFixed(2)}px, 0px) rotate(${shakeRot.toFixed(2)}deg) scale(${shakeScale.toFixed(4)})`;
            }
          } else if (shakeViewportRef.current && shakeViewportRef.current.style.transform !== 'none') {
            shakeViewportRef.current.style.transform = 'none';
          }

          // Update React UI states at throttled cadence for smooth performance
          if (frameCount % 4 === 0) {
            setCurrentShakeMagnitude(Math.round(shake * 100));
            setIsHeavyShaking(shake > 0.32);
          }
        } else if (shakeViewportRef.current && shakeViewportRef.current.style.transform !== 'none') {
          shakeViewportRef.current.style.transform = 'none';
          if (frameCount % 4 === 0) {
            setCurrentShakeMagnitude(0);
            setIsHeavyShaking(false);
          }
        }

        // =========================================================================
        // BLOOM TIMELINE AUTOMATION ENGINE (Recording & Playback)
        // Maps bloom intensity changes to the audio timeline for custom cinematic sequences
        // =========================================================================
        if (isRecordingBloomAutomationRef.current) {
          const curTime = currentTimeRef.current;
          const curVal = bloomIntensityRef.current;
          const frames = bloomKeyframesRef.current;
          const last = frames[frames.length - 1];

          // Sample keyframes at ~80ms intervals or significant value change
          if (!last || Math.abs(last.time - curTime) >= 0.08 || Math.abs(last.value - curVal) > 0.1) {
            // Remove any existing keyframe very close to current timestamp, then append
            const filtered = frames.filter((f) => Math.abs(f.time - curTime) > 0.04);
            const updated = [...filtered, { time: Number(curTime.toFixed(2)), value: Number(curVal.toFixed(2)) }]
              .sort((a, b) => a.time - b.time);
            bloomKeyframesRef.current = updated;

            if (frameCount % 6 === 0) {
              setBloomKeyframes([...updated]);
            }
          }
        } else if (isAutomationActiveRef.current && bloomKeyframesRef.current.length > 1) {
          // Playback recorded bloom automation along the audio timeline
          const curTime = currentTimeRef.current;
          const frames = bloomKeyframesRef.current;
          let interpolatedVal = 1.25;

          if (curTime <= frames[0].time) {
            interpolatedVal = frames[0].value;
          } else if (curTime >= frames[frames.length - 1].time) {
            interpolatedVal = frames[frames.length - 1].value;
          } else {
            for (let i = 0; i < frames.length - 1; i++) {
              if (curTime >= frames[i].time && curTime <= frames[i + 1].time) {
                const span = frames[i + 1].time - frames[i].time;
                let t = span > 0.001 ? (curTime - frames[i].time) / span : 0;
                t = Math.max(0, Math.min(1, t));

                if (bezierInterpolationRef.current) {
                  // Smooth cubic Bézier ease-in-out S-curve (3t^2 - 2t^3)
                  const bezierT = t * t * (3 - 2 * t);
                  interpolatedVal = frames[i].value + bezierT * (frames[i + 1].value - frames[i].value);
                } else {
                  // Linear interpolation
                  interpolatedVal = frames[i].value + t * (frames[i + 1].value - frames[i].value);
                }
                break;
              }
            }
          }

          bloomIntensityRef.current = interpolatedVal;
          if (!autoBloomRef.current && sceneRef.current) {
            sceneRef.current.setBloomIntensity(interpolatedVal);
          }

          if (frameCount % 4 === 0) {
            setBloomIntensity(Number(interpolatedVal.toFixed(2)));
          }
        }

        // =========================================================================
        // AUTO-BLOOM DYNAMIC GLOW OSCILLATOR
        // Subtly oscillates bloom intensity based on overall audio energy levels
        // =========================================================================
        if (autoBloomRef.current && sceneRef.current) {
          // Calculate composite multi-band audio energy (Bass 50%, Mid 30%, Treble 20%)
          const totalEnergy = audioData.bass * 0.50 + audioData.mid * 0.30 + audioData.treble * 0.20;

          // Harmonic breathing oscillation (~0.4 Hz subtle sinus wave)
          const harmonicBreath = Math.sin(now * 0.0025) * 0.15;

          // Dynamic audio energy surge
          const audioEnergyMod = (totalEnergy * 0.85) + harmonicBreath;

          // Modulate around user baseline bloomIntensity
          const baseIntensity = bloomIntensityRef.current;
          const dynamicBloom = Math.min(3.0, Math.max(0.05, baseIntensity * (0.65 + audioEnergyMod)));

          sceneRef.current.setBloomIntensity(dynamicBloom);

          if (frameCount % 4 === 0) {
            setLiveAutoBloomVal(dynamicBloom);
          }
        }

        // Draw 2D canvas visualizer in HUD
        if (visualizerCanvasRef.current) {
          const cvs = visualizerCanvasRef.current;
          const ctx = cvs.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, cvs.width, cvs.height);

            // Draw Frequency Bars
            const barWidth = cvs.width / audioData.frequencies.length;
            for (let i = 0; i < audioData.frequencies.length; i++) {
              const val = audioData.frequencies[i] / 255;
              const barHeight = val * (cvs.height - 4);
              const hue = 180 + val * 120; // Cyan to purple
              ctx.fillStyle = `hsl(${hue}, 100%, ${40 + val * 40}%)`;
              ctx.fillRect(i * barWidth, cvs.height - barHeight, barWidth - 1, barHeight);
            }

            // Draw Oscilloscope wave overlay
            ctx.beginPath();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#00f0ff';
            const sliceWidth = cvs.width / audioData.waveformData.length;
            let x = 0;
            for (let i = 0; i < audioData.waveformData.length; i++) {
              const v = audioData.waveformData[i] / 128.0;
              const y = (v * cvs.height) / 2;
              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
              x += sliceWidth;
            }
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderHud);
    };

    renderHud();

    return () => {
      cancelAnimationFrame(animationFrameId);
      scene.destroy();
      audioEngine.pause();
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Music playback triggers
  const handleTogglePlay = () => {
    if (audioRef.current) {
      audioRef.current.togglePlay();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    currentTimeRef.current = val;
    if (audioRef.current) {
      audioRef.current.seek(val);
    }
    if (sceneRef.current) {
      sceneRef.current.setStoryTime(val, duration);
      setStoryStage(sceneRef.current.getStoryStage());
    }
  };

  const handleStoryStageJump = (stage: StoryStage) => {
    setStoryStage(stage);
    let targetSeconds = 0;
    if (stage === 'chase') targetSeconds = 0;
    else if (stage === 'approach') targetSeconds = 76;
    else if (stage === 'perch-nose') targetSeconds = 99;
    else if (stage === 'lotus-nest-smile') targetSeconds = 113;

    setCurrentTime(targetSeconds);
    if (audioRef.current) {
      audioRef.current.seek(targetSeconds);
    }
    if (sceneRef.current) {
      sceneRef.current.setStoryStage(stage);
    }
  };

  const handleToggleMute = () => {
    if (audioRef.current) {
      setIsMuted(audioRef.current.toggleMute());
    }
  };

  const handleToggleBassBoost = () => {
    if (audioRef.current) {
      setBassBoost(audioRef.current.toggleBassBoost());
    }
  };

  const handleModuleSelect = (mod: ModuleType) => {
    setActiveModule(mod);
    if (sceneRef.current) {
      sceneRef.current.setModule(mod);
    }
  };

  const handleCameraSelect = (cam: CameraMode) => {
    setCameraMode(cam);
    if (sceneRef.current) {
      sceneRef.current.setCameraMode(cam);
      if (cam === 'random-cinematic') {
        setCinematicViewpoint(sceneRef.current.getActiveViewpointName());
      }
    }
  };

  const handleTriggerNextCinematicCut = () => {
    if (sceneRef.current) {
      sceneRef.current.triggerRandomCinematicCut('manual', 0.85);
    }
  };

  const handleTriggerSpikeBurst = () => {
    if (sceneRef.current) {
      sceneRef.current.triggerSpikeExplosion(1.0);
    }
  };

  const handleTriggerManualShake = () => {
    traumaRef.current = 1.0;
  };

  const handleCycleShakeIntensity = () => {
    if (!screenShakeEnabled) {
      setScreenShakeEnabled(true);
      setScreenShakeIntensity('heavy');
    } else if (screenShakeIntensity === 'heavy') {
      setScreenShakeIntensity('extreme');
    } else if (screenShakeIntensity === 'extreme') {
      setScreenShakeIntensity('normal');
    } else {
      setScreenShakeEnabled(false);
    }
  };

  const handleToggleChromaticAberration = () => {
    const next = !chromaticAberration;
    setChromaticAberration(next);
    if (sceneRef.current) {
      sceneRef.current.setChromaticAberrationEnabled(next);
    }
  };

  const handleThemeSelect = (themeId: string) => {
    setActiveTheme(themeId);
    if (sceneRef.current) {
      sceneRef.current.setTheme(themeId);
    }
  };

  const handleFogIntensityChange = (val: number) => {
    setFogIntensity(val);
    if (sceneRef.current) {
      sceneRef.current.setFogIntensity(val);
    }
  };

  const BLOOM_PROFILES = [
    { id: 'low', name: 'Low', value: 0.45 },
    { id: 'cyber-night', name: 'Cyber-Night', value: 1.25 },
    { id: 'hyper-glow', name: 'Hyper-Glow', value: 2.50 },
  ] as const;

  const handleToggleAutoBloom = () => {
    const next = !autoBloom;
    setAutoBloom(next);
    autoBloomRef.current = next;
    if (!next && sceneRef.current) {
      sceneRef.current.setBloomIntensity(bloomIntensity);
    }
  };

  const handleBloomIntensityChange = (val: number) => {
    setBloomIntensity(val);
    bloomIntensityRef.current = val;
    if (!autoBloomRef.current && sceneRef.current) {
      sceneRef.current.setBloomIntensity(val);
    }
    if (isRecordingBloomAutomationRef.current) {
      const curTime = currentTimeRef.current;
      const filtered = bloomKeyframesRef.current.filter((f) => Math.abs(f.time - curTime) > 0.04);
      const updated = [...filtered, { time: Number(curTime.toFixed(2)), value: Number(val.toFixed(2)) }]
        .sort((a, b) => a.time - b.time);
      bloomKeyframesRef.current = updated;
      setBloomKeyframes(updated);
    }
  };

  const handleToggleRecordBloomAutomation = () => {
    if (!isRecordingBloomAutomation) {
      setIsRecordingBloomAutomation(true);
      isRecordingBloomAutomationRef.current = true;
      setIsAutomationActive(true);
      isAutomationActiveRef.current = true;
      if (audioRef.current && !isPlaying) {
        audioRef.current.start();
      }
    } else {
      setIsRecordingBloomAutomation(false);
      isRecordingBloomAutomationRef.current = false;
      setBloomKeyframes([...bloomKeyframesRef.current]);
    }
  };

  const handleToggleAutomationPlayback = () => {
    const next = !isAutomationActive;
    setIsAutomationActive(next);
    isAutomationActiveRef.current = next;
    if (!next && sceneRef.current) {
      sceneRef.current.setBloomIntensity(bloomIntensity);
    }
  };

  const handleClearBloomAutomation = () => {
    setIsRecordingBloomAutomation(false);
    isRecordingBloomAutomationRef.current = false;
    setIsAutomationActive(false);
    isAutomationActiveRef.current = false;
    bloomKeyframesRef.current = [];
    setBloomKeyframes([]);
    setSelectedKeyframeIndex(null);
    setDraggingKeyframeIndex(null);
  };

  const handleKeyframePointerDown = (index: number, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedKeyframeIndex(index);
    setDraggingKeyframeIndex(index);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleKeyframePointerMove = (index: number, e: React.PointerEvent) => {
    if (draggingKeyframeIndex !== index || !timelineTrackRef.current) return;
    const rect = timelineTrackRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const clampedRatio = Math.max(0, Math.min(1, rawX / rect.width));
    const newTime = Number((clampedRatio * duration).toFixed(2));

    const currentKeyframe = bloomKeyframes[index];
    if (!currentKeyframe) return;

    const updated = bloomKeyframes.map((kf, i) => (i === index ? { ...kf, time: newTime } : kf));
    updated.sort((a, b) => a.time - b.time);
    const newIdx = updated.findIndex((kf) => kf.time === newTime && kf.value === currentKeyframe.value);

    bloomKeyframesRef.current = updated;
    setBloomKeyframes(updated);
    if (newIdx !== -1) {
      setSelectedKeyframeIndex(newIdx);
      setDraggingKeyframeIndex(newIdx);
    }
  };

  const handleKeyframePointerUp = (e: React.PointerEvent) => {
    setDraggingKeyframeIndex(null);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleRemoveKeyframe = (index: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const updated = bloomKeyframes.filter((_, i) => i !== index);
    bloomKeyframesRef.current = updated;
    setBloomKeyframes(updated);
    if (selectedKeyframeIndex === index) {
      setSelectedKeyframeIndex(null);
    } else if (selectedKeyframeIndex !== null && selectedKeyframeIndex > index) {
      setSelectedKeyframeIndex(selectedKeyframeIndex - 1);
    }
    setDraggingKeyframeIndex(null);
  };

  const handleTimelineTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineTrackRef.current) return;
    const rect = timelineTrackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = Number((ratio * duration).toFixed(2));

    const newKeyframe = { time: newTime, value: Number(bloomIntensity.toFixed(2)) };
    const updated = [...bloomKeyframes.filter((kf) => Math.abs(kf.time - newTime) > 0.4), newKeyframe].sort(
      (a, b) => a.time - b.time
    );
    bloomKeyframesRef.current = updated;
    setBloomKeyframes(updated);
    setIsAutomationActive(true);
    isAutomationActiveRef.current = true;
    const idx = updated.findIndex((kf) => kf.time === newTime);
    setSelectedKeyframeIndex(idx);

    // Also sync audio seek to preview the point
    if (audioRef.current) {
      audioRef.current.seek(newTime);
      setCurrentTime(newTime);
      currentTimeRef.current = newTime;
    }
  };

  const handleToggleBezierInterpolation = () => {
    const next = !bezierInterpolation;
    setBezierInterpolation(next);
    bezierInterpolationRef.current = next;
  };

  const handleCycleBloomProfile = () => {
    const currentIndex = BLOOM_PROFILES.findIndex((p) => Math.abs(p.value - bloomIntensity) < 0.2);
    const nextIndex = (currentIndex + 1) % BLOOM_PROFILES.length;
    const target = BLOOM_PROFILES[nextIndex];
    handleBloomIntensityChange(target.value);
  };

  const handleSpeedSelect = (mult: number) => {
    setSpeedMultiplier(mult);
    if (sceneRef.current) {
      sceneRef.current.setSpeed(mult);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Custom audio file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && audioRef.current) {
      audioRef.current.loadUserFile(file);
    }
  };

  // Trigger Gemini 3.8 Flash TTS
  const handleGenerateTts = async (textToSpeak?: string) => {
    const prompt = textToSpeak || ttsInput;
    if (!prompt.trim()) return;

    setIsGeneratingTts(true);
    setTtsStatusMsg('Synthesizing fat vocals with gemini-3.8-flash-tts...');

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: prompt,
          voice: selectedVoice,
          style: ttsStyle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'TTS error');
      }

      setTtsStatusMsg('Playing vocals through dragon line audio visualizer!');
      if (audioRef.current && data.audioBase64) {
        await audioRef.current.playTtsAudio(data.audioBase64);
      }

      setTimeout(() => {
        setTtsStatusMsg(null);
      }, 4000);
    } catch (err: any) {
      console.error('TTS Failed:', err);
      setTtsStatusMsg(`Vocal drop error: ${err.message}`);
    } finally {
      setIsGeneratingTts(false);
    }
  };

  // =========================================================================
  // DRAGON9 MPEG-4 EXPORT PIPELINE HANDLERS
  // =========================================================================
  const handleOpenExportModal = () => {
    const caps = DragonScene.getCapabilities();
    setPipelineCaps(caps);
    setShowExportModal(true);
  };

  const handleStartExport = async () => {
    if (!sceneRef.current) return;
    setExportStatusMsg(null);
    setExportResult(null);

    // Audio stream routing
    let streamDest = null;
    if (exportIncludeAudio && audioRef.current) {
      streamDest = audioRef.current.getOrCreateMediaStreamDestination();
      if (!isPlaying) {
        audioRef.current.start();
      }
    }

    setIsRecording(true);
    setRecordingProgress(0);
    setRecordingElapsed(0);

    const success = await sceneRef.current.startMpeg4Recording({
      format: 'mp4',
      fps: exportFps,
      durationSeconds: exportDuration,
      resolution: exportResolution,
      includeAudio: exportIncludeAudio,
      audioStreamDestination: streamDest,
      creditText: exportCreditText,
      showWatermark: exportWatermark,
      watermarkPosition: exportWatermarkPos,
      onProgress: (prog, elapsed) => {
        setRecordingProgress(prog);
        setRecordingElapsed(elapsed);
      },
      onComplete: (res) => {
        setIsRecording(false);
        setExportResult(res);
        setExportStatusMsg(`Render complete: ${res.filename} (${(res.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB)`);
      },
      onError: (err) => {
        setIsRecording(false);
        setExportStatusMsg(`Recording failed: ${err.message}`);
      },
    });

    if (!success) {
      setIsRecording(false);
      setExportStatusMsg('Failed to initialize video recording stream.');
    }
  };

  const handleStopExport = async () => {
    if (!sceneRef.current) return;
    await sceneRef.current.stopMpeg4Recording();
    setIsRecording(false);
  };

  const handleDownloadVideo = () => {
    if (!exportResult) return;
    const a = document.createElement('a');
    a.href = exportResult.url;
    a.download = exportResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShareVideo = async () => {
    if (!exportResult) return;
    try {
      const file = new File([exportResult.blob], exportResult.filename, {
        type: exportResult.mimeType,
      });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: exportResult.credit,
          text: 'Rendered with Dragon9 Fluid Motion WebGL Pipeline // Raw Power Soundtrack',
        });
        return;
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.warn('Share intent error:', e);
      }
    }
    // Fallback if Web Share is not accepted
    handleDownloadVideo();
  };

  const handleQuickScreenshot = async () => {
    if (!sceneRef.current) return;
    setIsCapturingScreenshot(true);
    try {
      const dataUrl = await sceneRef.current.captureHighResScreenshot({
        width: 1920,
        height: 1080,
        credit: true,
      });
      if (dataUrl) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `Dragon9_RawPower_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e) {
      console.error('Screenshot error:', e);
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  // 1-Click Cinematic MPEG-4 Pipeline Export
  const handleCinematicExport = async () => {
    setCameraMode('cinematic');
    if (sceneRef.current) {
      sceneRef.current.setCameraMode('cinematic');
    }
    setExportDuration(15);
    setExportResolution('1080p');
    setExportFps(60);
    setExportIncludeAudio(true);
    setExportWatermark(true);
    setExportWatermarkPos('bottom-right');
    setExportCreditText('Dragon9 with Raw Power');
    setShowExportModal(true);
    await handleStartExport();
  };

  // Download pre-rendered broadcast master
  const handleDownloadPreRenderedCinematic = () => {
    const a = document.createElement('a');
    a.href = '/exports/Dragon9_RawPower_Cinematic.mp4';
    a.download = 'Dragon9_with_Raw_Power_Cinematic.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Standalone WebGL HTML file export
  const handleExportWebGLHtml = () => {
    const a = document.createElement('a');
    a.href = '/exports/Dragon9_Cinematic_WebGL.html';
    a.download = 'Dragon9_Cinematic_WebGL.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 3D Scene Graph JSON export for Blender/Three.js
  const handleExportSceneJSON = () => {
    if (!sceneRef.current) return;
    const jsonStr = sceneRef.current.exportSceneJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dragon9_Scene_Graph_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05050e] font-mono select-none">
      {/* 1. Full-screen Shaking Viewport Container (Peak 808 Bass Seismic Rumble) */}
      <div
        ref={shakeViewportRef}
        className="absolute inset-0 w-full h-full z-0 will-change-transform pointer-events-none"
        style={{ transformOrigin: 'center center' }}
      >
        {/* Overscanned WebGL Canvas Target to prevent boundary clipping during high-magnitude shake */}
        <div
          ref={canvasContainerRef}
          className="absolute -inset-8 w-[calc(100%+64px)] h-[calc(100%+64px)] cursor-grab active:cursor-grabbing pointer-events-auto"
        />
      </div>

      {/* Dynamic 808 Seismic Shockwave Border Vignette Flash */}
      {isHeavyShaking && (
        <div
          className="absolute inset-0 z-10 pointer-events-none border-[3px] border-cyan-400/50 shadow-[inset_0_0_80px_rgba(0,240,255,0.4),inset_0_0_120px_rgba(255,0,128,0.25)] animate-pulse transition-opacity duration-75"
          style={{ opacity: Math.min(1.0, currentShakeMagnitude / 50) }}
        />
      )}

      {/* 2. Top Header HUD: Branding, Raw Power Credit, and Module Transition Switcher */}
      <header className="absolute top-0 left-0 right-0 z-20 px-4 py-3 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-b from-[#050510ee] via-[#050510aa] to-transparent pointer-events-auto">
        {/* Brand & Artist Credit */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Flame className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <div className="text-xs font-bold tracking-wider text-cyan-300">
                DRAGON LINE <span className="text-white/40">//</span> FLUID MOTION
              </div>
              <div className="text-[10px] text-zinc-400">Cyber Lotus & Butterfly Enigma</div>
            </div>
          </div>

          {/* Artist & Song Tribute Credit */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-950/60 to-black/70 border border-red-500/40 backdrop-blur-md">
            <Disc className={`w-4 h-4 text-red-400 ${isPlaying ? 'animate-spin' : ''}`} />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                Featured Soundtrack
              </div>
              <div className="text-xs font-bold text-red-300 glow-magenta">
                RAW POWER <span className="text-white/40">•</span> 02:07
              </div>
            </div>
          </div>
        </div>

        {/* 5 Interactive Modules */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/65 border border-white/10 backdrop-blur-md shadow-2xl">
          <button
            onClick={() => handleModuleSelect('lotus-enigma')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeModule === 'lotus-enigma'
                ? 'bg-gradient-to-r from-fuchsia-600/30 to-pink-600/30 text-pink-200 border border-pink-400/60 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Lotus Enigma</span>
          </button>
          <button
            onClick={() => handleModuleSelect('spine-genesis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeModule === 'spine-genesis'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Spine Genesis
          </button>
          <button
            onClick={() => handleModuleSelect('cyber-vortex')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeModule === 'cyber-vortex'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Cyber Vortex
          </button>
          <button
            onClick={() => handleModuleSelect('audio-monolith')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeModule === 'audio-monolith'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-400/50 shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Monolith
          </button>
          <button
            onClick={() => handleModuleSelect('scales-macro')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeModule === 'scales-macro'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Macro
          </button>
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-2">
          {/* 1-Click Cinematic MPEG-4 Render Button */}
          <button
            onClick={handleCinematicExport}
            disabled={isRecording}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border bg-gradient-to-r from-amber-600/30 via-red-600/30 to-purple-600/30 hover:from-amber-600/50 hover:to-purple-600/50 text-amber-200 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50"
            title="1-Click Cinematic Camera MPEG-4 Render with Dragon9 Credit"
          >
            <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Cinematic MP4</span>
          </button>

          {/* Standalone WebGL File Export Button */}
          <button
            onClick={handleExportWebGLHtml}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900/90 border border-zinc-700 hover:border-cyan-400 text-zinc-300 hover:text-cyan-300 transition-all shadow-sm"
            title="Download Standalone WebGL HTML File (Complete Offline 3D Scene)"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Export WebGL</span>
          </button>

          {/* Quick 1080p Screenshot with Dragon9 Credit */}
          <button
            onClick={handleQuickScreenshot}
            disabled={isCapturingScreenshot}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-black/60 border border-zinc-700 hover:border-cyan-400 text-zinc-300 hover:text-cyan-300 transition-all shadow-sm"
            title="Instant 1080p PNG Snapshot with Dragon9 Credit"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Snap</span>
          </button>

          {/* MPEG-4 Pipeline Export Button */}
          <button
            onClick={handleOpenExportModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              isRecording
                ? 'bg-red-600 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse'
                : 'bg-gradient-to-r from-cyan-600/30 via-pink-600/30 to-purple-600/30 hover:from-cyan-600/50 hover:to-purple-600/50 text-cyan-200 border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
            }`}
            title="Open MPEG-4 Render Pipeline with Dragon9 with Raw Power Credit"
          >
            {isRecording ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>REC ({Math.floor(recordingElapsed)}s)</span>
              </>
            ) : (
              <>
                <Film className="w-3.5 h-3.5 text-cyan-300" />
                <span>MPEG-4 Studio</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-mono">
                  MP4
                </span>
              </>
            )}
          </button>

          {/* Rap & Vocals Console Toggle Button */}
          <button
            onClick={() => setShowVocalConsole(!showVocalConsole)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              showVocalConsole
                ? 'bg-fuchsia-600 text-white border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.5)]'
                : 'bg-black/60 text-fuchsia-300 border-fuchsia-500/40 hover:bg-fuchsia-950/40'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Fat Rap & Vocals (TTS)</span>
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-lg bg-black/60 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Floating Story Banner when in Lotus Enigma */}
      {activeModule === 'lotus-enigma' && cameraMode !== 'random-cinematic' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-black/75 border border-pink-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(244,63,94,0.3)] flex items-center gap-2 pointer-events-auto">
          {storyStage === 'lotus-nest-smile' ? (
            <div className="flex items-center gap-2 text-xs font-bold text-pink-300 animate-pulse">
              <Smile className="w-4 h-4 text-amber-300 fill-amber-300/30" />
              <span>Act IV: Dragon Nestled in Lotus Flower — Both Smile in Joy!</span>
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
            </div>
          ) : storyStage === 'perch-nose' ? (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Act III: Cyber Butterfly Perched on Dragon's Nose!</span>
            </div>
          ) : storyStage === 'approach' ? (
            <div className="flex items-center gap-2 text-xs font-medium text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Act II: Butterfly Hovering in Curiosity Ahead of Dragon</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
              <span>Act I: Flying around Lotus Enigma Chasing Butterfly</span>
            </div>
          )}
        </div>
      )}

      {/* Floating Randomized Cinematic Broadcast Bar */}
      {cameraMode === 'random-cinematic' && (
        <div
          className={`absolute top-16 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-xl backdrop-blur-md border transition-all duration-150 pointer-events-auto shadow-2xl flex items-center gap-3 ${
            bassCutFlash
              ? 'bg-amber-500/30 border-amber-300 scale-105 shadow-[0_0_30px_rgba(245,158,11,0.6)] text-amber-100'
              : 'bg-black/80 border-amber-500/40 text-zinc-200 shadow-[0_0_20px_rgba(0,0,0,0.8)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                bassCutFlash ? 'bg-amber-300 animate-ping' : 'bg-cyan-400 animate-pulse'
              }`}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-amber-300 font-bold">
                <span>Randomized Cinematic</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-600/50 text-[9px]">
                  ⚡ 808 Bass-Triggered
                </span>
              </div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span className="text-cyan-400">Viewpoint:</span>
                <span className="text-amber-200">{cinematicViewpoint}</span>
                {cinematicCutCount > 0 && (
                  <span className="text-[10px] text-zinc-400 font-mono">
                    (Cut #{cinematicCutCount})
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleTriggerNextCinematicCut}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-amber-500/20 border border-zinc-700 hover:border-amber-400 text-[11px] font-medium text-zinc-200 hover:text-amber-200 transition-all"
            title="Trigger Immediate Next Cinematic Cut"
          >
            <Shuffle className="w-3 h-3 text-amber-400" />
            <span>Next Angle</span>
          </button>
        </div>
      )}

      {/* 3. Left Floating HUD: Audio Oscilloscope & Live Metrics */}
      <aside className="absolute left-4 top-20 z-10 w-64 p-3 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md text-xs pointer-events-auto space-y-3">
        {/* Visualizer canvas */}
        <div>
          <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wider mb-1">
            <span>Audio Spectrum & Scope</span>
            <span className="text-cyan-400">{fps} FPS</span>
          </div>
          <canvas
            ref={visualizerCanvasRef}
            width={232}
            height={60}
            className="w-full h-15 bg-black/80 rounded-lg border border-cyan-500/30 shadow-inner"
          />
        </div>

        {/* Bass Pulse Meter & Real-time Proportional Reactions */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">808 Bass Intensity</span>
            <span className="font-bold text-cyan-300">{bassLevel}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-400 transition-all duration-75"
              style={{ width: `${bassLevel}%` }}
            />
          </div>
          {/* Live Proportional Reactive Telemetry */}
          <div className="grid grid-cols-2 gap-1 pt-0.5 text-[9px] font-mono">
            <div className="px-1.5 py-0.5 rounded bg-zinc-900/80 border border-cyan-500/20 flex items-center justify-between">
              <span className="text-zinc-400">Spikes:</span>
              <span className="text-cyan-300 font-bold">
                {(1.0 + (bassLevel / 100) * 2.4).toFixed(1)}×
              </span>
            </div>
            <div className="px-1.5 py-0.5 rounded bg-zinc-900/80 border border-pink-500/20 flex items-center justify-between">
              <span className="text-zinc-400">Emission:</span>
              <span className="text-pink-300 font-bold">
                {(0.3 + (bassLevel / 100) * 4.8).toFixed(1)}
              </span>
            </div>
          </div>

          {/* Cyber Spike Explosion Live Status & Trigger */}
          <div className="pt-1 flex items-center justify-between">
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono border transition-all duration-150 ${
                isSpikeExploding
                  ? 'bg-gradient-to-r from-cyan-500/40 via-pink-500/40 to-amber-500/40 border-cyan-300 text-white shadow-[0_0_12px_rgba(0,240,255,0.6)] animate-pulse'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSpikeExploding ? 'bg-cyan-300 animate-ping' : 'bg-zinc-600'
                }`}
              />
              <span className="font-semibold">
                {isSpikeExploding ? '💥 CYBER BURST ACTIVE' : 'Spike Explosions'}
              </span>
            </div>

            <button
              onClick={handleTriggerSpikeBurst}
              className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-cyan-900/50 hover:border-cyan-400 border border-zinc-700 text-[9px] font-mono text-cyan-300 transition-all flex items-center gap-1"
              title="Trigger Instant Manual Spike Particle Explosion"
            >
              <span>Burst</span>
              <span>⚡</span>
            </button>
          </div>

          {/* Dynamic Chromatic Aberration Post-Processing Control */}
          <div className="pt-1 flex items-center justify-between text-[9px] font-mono border-t border-white/5 pt-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  chromaticAberration
                    ? bassLevel > 65
                      ? 'bg-pink-400 animate-ping'
                      : 'bg-cyan-400'
                    : 'bg-zinc-600'
                }`}
              />
              <span className="text-zinc-400">RGB Shift:</span>
              <span
                className={`font-bold transition-colors ${
                  bassLevel > 65 ? 'text-pink-300 font-bold' : 'text-cyan-300'
                }`}
              >
                {chromaticAberration
                  ? `${(0.08 + Math.pow(bassLevel / 100, 2) * 2.2).toFixed(2)}×`
                  : 'OFF'}
              </span>
            </div>

            <button
              onClick={handleToggleChromaticAberration}
              className={`px-2 py-0.5 rounded text-[9px] border transition-all ${
                chromaticAberration
                  ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:border-cyan-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
              title="Toggle Dynamic Audio-Reactive Chromatic Aberration Post-Processing"
            >
              {chromaticAberration ? 'FX ON' : 'FX OFF'}
            </button>
          </div>

          {/* High-Intensity 808 Screen Shake Seismic Telemetry & Controls */}
          <div className="pt-1.5 flex items-center justify-between text-[9px] font-mono border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  screenShakeEnabled
                    ? currentShakeMagnitude > 25
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-emerald-400'
                    : 'bg-zinc-600'
                }`}
              />
              <span className="text-zinc-400">808 Shake:</span>
              <span
                className={`font-bold transition-colors ${
                  currentShakeMagnitude > 25
                    ? 'text-amber-300 font-bold'
                    : screenShakeEnabled
                    ? 'text-emerald-300'
                    : 'text-zinc-500'
                }`}
              >
                {screenShakeEnabled
                  ? isHeavyShaking
                    ? `💥 ${currentShakeMagnitude}% RUMBLE`
                    : `${currentShakeMagnitude}%`
                  : 'OFF'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleCycleShakeIntensity}
                className={`px-1.5 py-0.5 rounded text-[8px] border font-bold uppercase transition-all ${
                  screenShakeEnabled
                    ? screenShakeIntensity === 'extreme'
                      ? 'bg-red-950/70 border-red-500/50 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                      : screenShakeIntensity === 'heavy'
                      ? 'bg-amber-950/70 border-amber-500/50 text-amber-300'
                      : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
                title="Cycle Screen Shake Mode: Normal / Heavy / Extreme / OFF"
              >
                {screenShakeEnabled ? screenShakeIntensity : 'OFF'}
              </button>
              <button
                onClick={handleTriggerManualShake}
                className="px-1.5 py-0.5 rounded text-[8px] bg-zinc-800 hover:bg-amber-950/60 hover:border-amber-400 border border-zinc-700 text-amber-300 transition-all"
                title="Trigger Instant 808 Seismic Test Shake"
              >
                ⚡
              </button>
            </div>
          </div>
        </div>

        {/* Camera Angles */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-cyan-400" />
              <span>Camera Angles</span>
            </span>
            {cameraMode === 'random-cinematic' && (
              <span className="text-[9px] text-amber-300 font-mono font-bold animate-pulse">
                ⚡ AUTO-SYNC
              </span>
            )}
          </div>

          {/* Dedicated Randomized Cinematic Mode Button */}
          <button
            onClick={() => handleCameraSelect('random-cinematic')}
            className={`w-full p-2 rounded-lg text-xs font-bold transition-all text-left border relative overflow-hidden ${
              cameraMode === 'random-cinematic'
                ? 'bg-gradient-to-r from-amber-600/30 via-red-600/30 to-purple-600/30 text-amber-100 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/40'
                : 'bg-zinc-900/70 hover:bg-zinc-800/80 text-zinc-300 hover:text-white border-zinc-700/60 hover:border-amber-400/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                <span className="tracking-wide">Randomized Cinematic</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 font-mono uppercase">
                ⚡ Bass Sync
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-normal leading-tight">
              Switches orbital & tracking viewpoints dynamically on 808 bass peaks.
            </p>
            {cameraMode === 'random-cinematic' && (
              <div className="mt-1.5 pt-1.5 border-t border-amber-500/20 flex items-center justify-between text-[10px]">
                <span className="text-amber-200 truncate max-w-[150px]">
                  {cinematicViewpoint}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTriggerNextCinematicCut();
                  }}
                  className="px-1.5 py-0.5 rounded bg-black/50 hover:bg-black text-[9px] text-amber-300 border border-amber-500/30 cursor-pointer"
                >
                  Cut ⏭️
                </span>
              </div>
            )}
          </button>

          {/* Standard Camera Preset Grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                ['story-director', 'Director Cam'],
                ['butterfly-cam', 'Butterfly View'],
                ['follow-dragon', 'Follow Head'],
                ['orbit', 'Free Orbit'],
                ['cinematic', 'Cinematic'],
                ['macro', 'Macro Detail'],
              ] as const
            ).map(([camKey, label]) => (
              <button
                key={camKey}
                onClick={() => handleCameraSelect(camKey)}
                className={`py-1 px-2 rounded text-[10px] font-medium transition-all ${
                  cameraMode === camKey
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white border border-transparent'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Dragon Color Matrix */}
        <div className="pt-2 border-t border-white/10">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Scale & Glow Palette</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {COLOR_THEMES.map((th) => (
              <button
                key={th.id}
                onClick={() => handleThemeSelect(th.id)}
                className={`py-1 px-2 rounded text-[11px] font-medium transition-all text-left flex items-center gap-1.5 ${
                  activeTheme === th.id
                    ? 'bg-white/15 text-white border border-white/30'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white border border-transparent'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: `#${th.scaleColor.toString(16).padStart(6, '0')}` }}
                />
                <span className="truncate">{th.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Atmospheric Fog Layer: Scrolling Purple & Cyan Hues */}
        <div className="pt-2 border-t border-white/10">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.6)] animate-pulse" />
              <span>Purple & Cyan Fog</span>
            </span>
            <span className="text-[9px] text-cyan-300 font-semibold uppercase">
              {fogIntensity === 0 ? 'Off' : fogIntensity > 1.2 ? 'Deep' : 'Subtle'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[
              { label: 'Subtle', val: 1.0 },
              { label: 'Deep', val: 1.6 },
              { label: 'Off', val: 0.0 },
            ].map((lvl) => (
              <button
                key={lvl.label}
                onClick={() => handleFogIntensityChange(lvl.val)}
                className={`py-1 px-1.5 rounded text-[10px] font-medium transition-all text-center ${
                  fogIntensity === lvl.val
                    ? 'bg-gradient-to-r from-purple-600/40 to-cyan-600/40 text-white border border-cyan-400/50 shadow-[0_0_8px_rgba(0,240,255,0.25)]'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white border border-transparent'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Post-Processing Cyber Bloom Glow Intensity Slider, Auto-Bloom & Timeline Automation */}
        <div className="pt-2 border-t border-white/10 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sun className={`w-3 h-3 ${autoBloom ? 'text-amber-400 animate-pulse' : 'text-amber-400'}`} />
              <span>Cyber Bloom Glow</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCycleBloomProfile}
                className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-wide uppercase transition-all bg-zinc-900/90 border border-zinc-700 hover:border-amber-400 text-zinc-300 hover:text-amber-200 flex items-center gap-1"
                title="Cycle bloom profiles: Low (36%) → Cyber-Night (100%) → Hyper-Glow (200%)"
              >
                <span>Profile:</span>
                <span className="text-amber-300 font-bold">
                  {Math.abs(bloomIntensity - 0.45) < 0.2
                    ? 'Low'
                    : Math.abs(bloomIntensity - 1.25) < 0.2
                    ? 'Cyber-Night'
                    : Math.abs(bloomIntensity - 2.5) < 0.2
                    ? 'Hyper-Glow'
                    : 'Custom'}
                </span>
                <span className="text-amber-400 text-[10px] leading-none">↻</span>
              </button>

              <button
                onClick={handleToggleAutoBloom}
                className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-wide uppercase transition-all flex items-center gap-1 ${
                  autoBloom
                    ? 'bg-amber-500/25 border border-amber-400/80 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.35)]'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
                title="Toggle Auto-Bloom: Dynamically oscillates glow intensity based on overall audio energy levels"
              >
                <span className={`w-1 h-1 rounded-full ${autoBloom ? 'bg-amber-300 animate-ping' : 'bg-zinc-600'}`} />
                <span>Auto</span>
              </button>

              <span className="text-[10px] text-amber-300 font-mono font-bold min-w-[34px] text-right">
                {bloomIntensity === 0
                  ? 'OFF'
                  : autoBloom
                  ? `${Math.round((liveAutoBloomVal / 1.25) * 100)}%`
                  : `${Math.round((bloomIntensity / 1.25) * 100)}%`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="3"
              step="0.05"
              value={bloomIntensity}
              onChange={(e) => handleBloomIntensityChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400 hover:accent-amber-300 transition-all"
            />
          </div>

          {/* Quick-select Bloom Profile Buttons */}
          <div className="grid grid-cols-3 gap-1 pt-0.5">
            {BLOOM_PROFILES.map((prof) => {
              const isActive = Math.abs(bloomIntensity - prof.value) < 0.2;
              return (
                <button
                  key={prof.id}
                  onClick={() => handleBloomIntensityChange(prof.value)}
                  className={`py-0.5 px-1 rounded text-[9px] font-mono transition-all text-center border ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-400/80 text-amber-200 font-bold shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                      : 'bg-zinc-900/70 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                  title={`Switch to ${prof.name} bloom profile (${Math.round((prof.value / 1.25) * 100)}%)`}
                >
                  {prof.name}
                </button>
              );
            })}
          </div>

          {/* Timeline Automation Record & Playback Controls */}
          <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[9px] font-mono">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleRecordBloomAutomation}
                className={`px-2 py-0.5 rounded font-bold uppercase transition-all flex items-center gap-1.5 border ${
                  isRecordingBloomAutomation
                    ? 'bg-red-600/30 border-red-500 text-red-200 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse'
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-red-300 hover:border-red-500/40'
                }`}
                title="Automation Record: Map bloom intensity slider changes to the audio timeline for custom cinematic sequences"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isRecordingBloomAutomation ? 'bg-red-400 animate-ping' : 'bg-red-500'
                  }`}
                />
                <span>{isRecordingBloomAutomation ? 'Stop Rec' : 'Auto Rec'}</span>
              </button>

              {bloomKeyframes.length > 0 && (
                <button
                  onClick={handleToggleAutomationPlayback}
                  className={`px-1.5 py-0.5 rounded border transition-all ${
                    isAutomationActive
                      ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                  title="Toggle Automation Track Playback Sync"
                >
                  {isAutomationActive ? '▶ Sync' : '⏸ Mute'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {bloomKeyframes.length > 0 ? (
                <>
                  <span className="text-[8px] text-zinc-400">
                    {bloomKeyframes.length} pts
                  </span>
                  <button
                    onClick={handleClearBloomAutomation}
                    className="px-1 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 border border-zinc-800 text-[8px]"
                    title="Clear recorded bloom automation keyframes"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <span className="text-[8px] text-zinc-600 italic">Timeline Mapped</span>
              )}
            </div>
          </div>

          {/* Visual Keyframe Timeline Overlay with interactive draggable & removable markers */}
          <div className="pt-1.5 border-t border-white/5 space-y-1">
            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    bloomKeyframes.length > 0 ? 'bg-amber-400 animate-pulse' : 'bg-zinc-600'
                  }`}
                />
                <span className="text-zinc-300 font-semibold">Keyframe Track</span>
              </span>

              <div className="flex items-center gap-1.5">
                {/* Bézier Curve Interpolation Toggle */}
                <button
                  onClick={handleToggleBezierInterpolation}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold transition-all flex items-center gap-1 border ${
                    bezierInterpolation
                      ? 'bg-amber-500/25 border-amber-400/80 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Toggle Bézier Curve Interpolation: Smooth S-curve easing between keyframe markers instead of linear movement"
                >
                  <span className="text-[9px] leading-none">∿</span>
                  <span>Bézier</span>
                  <span
                    className={`w-1 h-1 rounded-full ${
                      bezierInterpolation ? 'bg-amber-300 animate-pulse' : 'bg-zinc-600'
                    }`}
                  />
                </button>

                <span className="text-[8px] text-zinc-500 truncate max-w-[95px]">
                  {selectedKeyframeIndex !== null && bloomKeyframes[selectedKeyframeIndex]
                    ? `KF #${selectedKeyframeIndex + 1}: ${formatTime(bloomKeyframes[selectedKeyframeIndex].time)}`
                    : bezierInterpolation
                    ? 'Smooth ~'
                    : 'Linear —'}
                </span>
              </div>
            </div>

            {/* Timeline Lane */}
            <div
              ref={timelineTrackRef}
              onClick={handleTimelineTrackClick}
              className="relative w-full h-8 bg-zinc-950/90 rounded border border-zinc-800/80 hover:border-zinc-700/80 cursor-crosshair overflow-hidden select-none"
              title="Click track to seek & add keyframe marker • Drag markers to re-time • Double-click or click ✕ to delete"
            >
              {/* SVG background grid & interpolated bloom curve */}
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
              >
                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                {bloomKeyframes.length > 1 &&
                  (bezierInterpolation ? (
                    <path
                      d={(() => {
                        const pts = bloomKeyframes.map((kf) => ({
                          x: (kf.time / Math.max(1, duration)) * 100,
                          y: 100 - (Math.min(3, Math.max(0, kf.value)) / 3) * 70 - 15,
                        }));
                        let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
                        for (let i = 0; i < pts.length - 1; i++) {
                          const p0 = pts[i];
                          const p1 = pts[i + 1];
                          const dx = (p1.x - p0.x) * 0.5;
                          const cp1x = (p0.x + dx).toFixed(2);
                          const cp1y = p0.y.toFixed(2);
                          const cp2x = (p1.x - dx).toFixed(2);
                          const cp2y = p1.y.toFixed(2);
                          d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
                        }
                        return d;
                      })()}
                      fill="none"
                      stroke="rgba(245, 158, 11, 0.85)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  ) : (
                    <polyline
                      fill="none"
                      stroke="rgba(245, 158, 11, 0.75)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={bloomKeyframes
                        .map((kf) => {
                          const xPercent = (kf.time / Math.max(1, duration)) * 100;
                          const yPercent = 100 - (Math.min(3, Math.max(0, kf.value)) / 3) * 70 - 15;
                          return `${xPercent.toFixed(2)},${yPercent.toFixed(2)}`;
                        })
                        .join(' ')}
                    />
                  ))}
              </svg>

              {/* Current playback playhead line */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)] z-10 pointer-events-none transition-all duration-75"
                style={{
                  left: `${Math.min(100, Math.max(0, (currentTime / Math.max(1, duration)) * 100))}%`,
                }}
              />

              {/* Keyframe Markers */}
              {bloomKeyframes.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-mono text-zinc-600 pointer-events-none">
                  Click lane to insert keyframe
                </div>
              ) : (
                bloomKeyframes.map((kf, index) => {
                  const leftPercent = (kf.time / Math.max(1, duration)) * 100;
                  const isSelected = selectedKeyframeIndex === index;
                  const isDragging = draggingKeyframeIndex === index;
                  const topPercent = 100 - (Math.min(3, Math.max(0, kf.value)) / 3) * 70 - 15;

                  return (
                    <div
                      key={`${kf.time}-${index}`}
                      onPointerDown={(e) => handleKeyframePointerDown(index, e)}
                      onPointerMove={(e) => handleKeyframePointerMove(index, e)}
                      onPointerUp={handleKeyframePointerUp}
                      onPointerCancel={handleKeyframePointerUp}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 group z-20 cursor-grab active:cursor-grabbing touch-none ${
                        isDragging ? 'z-30 scale-125' : ''
                      }`}
                      style={{
                        left: `${leftPercent}%`,
                        top: `${topPercent}%`,
                      }}
                      title={`KF #${index + 1}: ${formatTime(kf.time)} (${kf.time.toFixed(1)}s) - ${Math.round((kf.value / 1.25) * 100)}% (Drag to re-time, double-click or click ✕ to delete)`}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleRemoveKeyframe(index);
                      }}
                    >
                      {/* Marker Diamond */}
                      <div
                        className={`w-3.5 h-3.5 rotate-45 rounded-xs transition-all border flex items-center justify-center ${
                          isSelected || isDragging
                            ? 'bg-amber-400 border-white shadow-[0_0_10px_rgba(245,158,11,1)] scale-110'
                            : 'bg-amber-500/90 hover:bg-amber-400 border-amber-300/80 shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                        }`}
                      >
                        <div className="w-1 h-1 rounded-full bg-black/60" />
                      </div>

                      {/* Quick delete badge on hover or select */}
                      <button
                        onClick={(e) => handleRemoveKeyframe(index, e)}
                        className="absolute -top-3.5 -right-3.5 w-3.5 h-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-[7px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-auto z-30"
                        title="Delete keyframe marker"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Timeline footer info */}
            <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 px-0.5">
              <span>0:00</span>
              {selectedKeyframeIndex !== null && bloomKeyframes[selectedKeyframeIndex] ? (
                <div className="flex items-center gap-1.5 text-amber-300">
                  <span>
                    {formatTime(bloomKeyframes[selectedKeyframeIndex].time)} (
                    {Math.round((bloomKeyframes[selectedKeyframeIndex].value / 1.25) * 100)}%)
                  </span>
                  <button
                    onClick={(e) => handleRemoveKeyframe(selectedKeyframeIndex, e)}
                    className="text-red-400 hover:text-red-300 underline font-semibold"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <span className="text-zinc-600">
                  {bloomKeyframes.length > 0
                    ? `${bloomKeyframes.length} keyframes (${bezierInterpolation ? 'Bézier ~' : 'Linear —'})`
                    : 'Click lane to add'}
                </span>
              )}
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 4. Right Drawer: Gemini 3.8 Flash TTS Rap & Fat Vocals Studio */}
      {showVocalConsole && (
        <aside className="absolute right-4 top-20 z-20 w-88 p-4 rounded-xl bg-black/85 border border-fuchsia-500/40 backdrop-blur-xl text-xs pointer-events-auto space-y-4 shadow-[0_0_30px_rgba(217,70,239,0.25)] animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-fuchsia-500/20">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-fuchsia-400" />
              <span className="font-bold text-fuchsia-200 text-sm">Fat Vocals & Rap Studio</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-700/50">
              gemini-3.8-flash-tts
            </span>
          </div>

          <p className="text-[11px] text-zinc-300 leading-relaxed">
            Drop deep, resonant vocals directly onto the track. Synthesized vocals stream live into the WebGL audio engine so the dragon's smile, jaw, and spikes pulse to the lyrics!
          </p>

          {/* Quick Rap Bar Presets */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
              Story & Rap Presets:
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {TTS_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setTtsInput(preset.text);
                    setSelectedVoice(preset.voice);
                    setTtsStyle(preset.style);
                    handleGenerateTts(preset.text);
                  }}
                  disabled={isGeneratingTts}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-fuchsia-950/60 border border-zinc-800 hover:border-fuchsia-500/50 text-left transition-all group"
                >
                  <div className="font-semibold text-fuchsia-300 flex items-center justify-between">
                    <span>{preset.title}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-zinc-400">
                      {preset.voice}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate mt-0.5">"{preset.text}"</div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Personality Selector */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Voice Character:</div>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  ['Fenrir', 'Fenrir (Deep 808)'],
                  ['Charon', 'Charon (Grime MC)'],
                  ['Puck', 'Puck (Hypeman)'],
                  ['Kore', 'Kore (Siren)'],
                  ['Zephyr', 'Zephyr (Smooth)'],
                ] as const
              ).map(([vName, label]) => (
                <button
                  key={vName}
                  onClick={() => setSelectedVoice(vName)}
                  className={`py-1 px-2 rounded text-[10px] font-medium transition-all ${
                    selectedVoice === vName
                      ? 'bg-fuchsia-600 text-white border border-fuchsia-400'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Rap Text Area */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Write Custom Rap Bars:</div>
            <textarea
              value={ttsInput}
              onChange={(e) => setTtsInput(e.target.value)}
              rows={3}
              placeholder="Type your rap bars or lyrics here..."
              className="w-full p-2.5 rounded-lg bg-black/80 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 text-xs"
            />
          </div>

          {/* Drop Vocals Button */}
          <button
            onClick={() => handleGenerateTts()}
            disabled={isGeneratingTts || !ttsInput.trim()}
            className="w-full py-2.5 rounded-lg font-bold text-xs bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white border border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {isGeneratingTts ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Gemini Rap...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>DROP VOCALS ON TRACK</span>
              </>
            )}
          </button>

          {/* Status Message */}
          {ttsStatusMsg && (
            <div className="p-2 rounded bg-fuchsia-950/80 border border-fuchsia-700/50 text-[11px] text-fuchsia-200 animate-pulse">
              {ttsStatusMsg}
            </div>
          )}
        </aside>
      )}

      {/* 5. Bottom Control Center: Story Act Jump Bar + Raw Power Playback */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-t from-[#050510f0] via-[#050510bb] to-transparent pointer-events-auto space-y-2">
        {/* Interactive Story Timeline Chapter Jump Bar (when in Lotus Enigma) */}
        {activeModule === 'lotus-enigma' && (
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-1 p-1 rounded-xl bg-black/80 border border-white/10 backdrop-blur-md text-[11px]">
            {(
              [
                ['chase', 'Act I: Lotus Chase', '0:00'],
                ['approach', 'Act II: Playful Flutter', '1:15'],
                ['perch-nose', 'Act III: Nose Perch', '1:38'],
                ['lotus-nest-smile', 'Act IV: Lotus Nest & Both Smile 😊', '1:52'],
              ] as const
            ).map(([stageKey, label, timeStr]) => (
              <button
                key={stageKey}
                onClick={() => handleStoryStageJump(stageKey)}
                className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  storyStage === stageKey
                    ? 'bg-gradient-to-r from-pink-600/40 to-amber-600/40 text-amber-200 border border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span>{label}</span>
                <span className="text-[10px] text-white/40">({timeStr})</span>
              </button>
            ))}
          </div>
        )}

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 p-2.5 rounded-2xl bg-black/70 border border-white/10 backdrop-blur-xl shadow-2xl">
          {/* Play/Pause & Scrub Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Play/Pause Button */}
            <button
              onClick={handleTogglePlay}
              className={`p-3 rounded-full transition-all border ${
                isPlaying
                  ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black border-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.5)]'
              }`}
              title={isPlaying ? 'Pause Track' : 'Play Raw Power'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            {/* Time progress bar */}
            <div className="flex-1 md:w-80 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-zinc-300">
                  Raw Power <span className="text-zinc-500 font-normal">• Fluid Motion Engine</span>
                </span>
                <span className="text-cyan-400 font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={duration}
                step={0.5}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Sound & Speed Modifiers */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bass Boost Toggle */}
            <button
              onClick={handleToggleBassBoost}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                bassBoost
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>808 Bass Boost</span>
            </button>

            {/* Mute Button */}
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-lg border transition-all ${
                isMuted
                  ? 'bg-red-500/20 text-red-400 border-red-500/50'
                  : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Speed Multiplier */}
            <div className="flex items-center rounded-lg bg-zinc-900/80 border border-zinc-800 p-0.5">
              {[0.5, 1.0, 2.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => handleSpeedSelect(spd)}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                    speedMultiplier === spd
                      ? 'bg-cyan-500 text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Upload Custom Audio File */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700"
              title="Load custom Raw Power track file"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </footer>

      {/* 6. MPEG-4 Render Pipeline Modal (Dragon9 with Raw Power Credit) */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 pointer-events-auto">
          <div className="relative w-full max-w-xl p-5 rounded-2xl bg-[#080816] border border-cyan-500/40 text-white shadow-[0_0_50px_rgba(0,240,255,0.25)] space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold tracking-wider text-cyan-200">
                    MPEG-4 RENDER PIPELINE
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Dragon9 with Raw Power <span className="text-white/40">•</span> Fluid Motion WebGL
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (isRecording) {
                    handleStopExport();
                  }
                  setShowExportModal(false);
                }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Artist Credit Banner */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/40 via-purple-950/40 to-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">
                  Mandatory Artist Credit
                </div>
                <div className="font-bold text-white text-sm">
                  Dragon9 with Raw Power
                </div>
                <div className="text-[10px] text-zinc-400">
                  Permanently composited into video frames & container metadata
                </div>
              </div>
              <span className="px-2 py-1 rounded bg-black/60 border border-white/10 text-[10px] text-cyan-300 font-mono">
                {pipelineCaps?.isMp4Supported ? 'MP4 / H.264' : 'WebM AVC'}
              </span>
            </div>

            {/* STATE 1: Recording in Progress */}
            {isRecording && (
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping inline-block" />
                    <span>RECORDING MPEG-4 STREAM...</span>
                  </div>
                  <span className="font-mono text-cyan-300 text-sm font-bold">
                    {recordingElapsed.toFixed(1)}s {exportDuration > 0 && `/ ${exportDuration}s`}
                  </span>
                </div>

                {/* Progress bar */}
                {exportDuration > 0 && (
                  <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-400 transition-all duration-100"
                      style={{ width: `${Math.min(100, Math.round(recordingProgress * 100))}%` }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Target: {exportResolution.toUpperCase()} @ {exportFps} FPS</span>
                  <span>Audio: {exportIncludeAudio ? 'Raw Power Stereo + Vocals' : 'Muted'}</span>
                </div>

                <button
                  onClick={handleStopExport}
                  className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all"
                >
                  ■ STOP & FINALIZE EXPORT
                </button>
              </div>
            )}

            {/* STATE 2: Video Export Ready */}
            {!isRecording && exportResult && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Render Finished & Ready for Artist</span>
                </div>

                {/* Video Player Preview */}
                <div className="rounded-xl overflow-hidden border border-cyan-500/40 bg-black aspect-video shadow-2xl">
                  <video
                    src={exportResult.url}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Video Metrics */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                    <div className="text-[10px] text-zinc-400 uppercase">Format</div>
                    <div className="font-bold text-cyan-300 mt-0.5">MPEG-4</div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                    <div className="text-[10px] text-zinc-400 uppercase">Resolution</div>
                    <div className="font-bold text-white mt-0.5">
                      {exportResult.width}×{exportResult.height}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                    <div className="text-[10px] text-zinc-400 uppercase">Duration</div>
                    <div className="font-bold text-amber-300 mt-0.5">
                      {exportResult.durationSeconds.toFixed(1)}s
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                    <div className="text-[10px] text-zinc-400 uppercase">File Size</div>
                    <div className="font-bold text-pink-300 mt-0.5">
                      {(exportResult.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>
                </div>

                {/* Primary Export Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleShareVideo}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Intent (termux-share)</span>
                  </button>
                  <button
                    onClick={handleDownloadVideo}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white border border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.4)] flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download MPEG-4 (.mp4)</span>
                  </button>
                </div>

                {/* Termux Script instructions for artist */}
                <div className="p-2.5 rounded-lg bg-black/60 border border-zinc-800 text-[10px] text-zinc-400 space-y-1">
                  <div className="font-semibold text-zinc-300 flex items-center gap-1">
                    <Info className="w-3 h-3 text-cyan-400" />
                    <span>Artist Pipeline Script (Termux / FFmpeg Remux):</span>
                  </div>
                  <code className="block p-1 rounded bg-zinc-900 text-cyan-300 font-mono select-all">
                    bash scripts/export_pipeline_dragon9.sh "{exportResult.filename}"
                  </code>
                </div>

                <button
                  onClick={() => setExportResult(null)}
                  className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs transition-all"
                >
                  Configure New Render
                </button>
              </div>
            )}

            {/* STATE 3: Pipeline Settings Configuration (Idle) */}
            {!isRecording && !exportResult && (
              <div className="space-y-3.5">
                {/* 1-Click Cinematic & WebGL Quick Pipeline Actions Card */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-red-950/40 to-purple-950/40 border border-amber-500/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clapperboard className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-amber-200">
                        Cinematic Director Cut & WebGL Export
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-black/60 text-amber-300 border border-amber-500/40 font-mono">
                      Dragon9 with Raw Power
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    Instantly export high-octane cinematic sweeps with synchronized 124 BPM Raw Power audio, or export the entire standalone offline WebGL scene for 3D artists.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handleCinematicExport}
                      className="py-2 px-3 rounded-lg font-bold text-xs bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-black flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all"
                    >
                      <Clapperboard className="w-3.5 h-3.5 text-black" />
                      <span>Render Cinematic (15s)</span>
                    </button>

                    <button
                      onClick={handleExportWebGLHtml}
                      className="py-2 px-3 rounded-lg font-bold text-xs bg-zinc-900 hover:bg-zinc-800 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Export WebGL (.html)</span>
                    </button>

                    <button
                      onClick={handleDownloadPreRenderedCinematic}
                      className="py-2 px-3 rounded-lg font-semibold text-xs bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-300 flex items-center justify-center gap-1.5 transition-all"
                      title="Direct download of pre-rendered 1080p 60fps Master MPEG-4 file"
                    >
                      <Download className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Master MP4 (1080p)</span>
                    </button>

                    <button
                      onClick={handleExportSceneJSON}
                      className="py-2 px-3 rounded-lg font-semibold text-xs bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-300 flex items-center justify-center gap-1.5 transition-all"
                      title="Export 3D Scene Graph JSON for Blender/Three.js"
                    >
                      <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Scene Graph (.json)</span>
                    </button>
                  </div>
                </div>

                {/* Duration Presets */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                    Render Duration:
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { label: '5s Loop', val: 5 },
                      { label: '10s Reel', val: 10 },
                      { label: '15s Clip', val: 15 },
                      { label: '30s Full', val: 30 },
                      { label: 'Manual', val: 0 },
                    ].map((dur) => (
                      <button
                        key={dur.label}
                        onClick={() => setExportDuration(dur.val)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                          exportDuration === dur.val
                            ? 'bg-cyan-500 text-black border border-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                            : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
                        }`}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution & FPS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                      Resolution:
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { label: '1080p', val: '1080p' as ExportResolution },
                        { label: '720p', val: '720p' as ExportResolution },
                        { label: 'Native', val: 'native' as ExportResolution },
                      ].map((res) => (
                        <button
                          key={res.label}
                          onClick={() => setExportResolution(res.val)}
                          className={`py-1 px-1.5 rounded text-[10px] font-semibold transition-all ${
                            exportResolution === res.val
                              ? 'bg-fuchsia-600 text-white border border-fuchsia-400'
                              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                          }`}
                        >
                          {res.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                      Framerate:
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      {[60, 30].map((fpsVal) => (
                        <button
                          key={fpsVal}
                          onClick={() => setExportFps(fpsVal)}
                          className={`py-1 px-1.5 rounded text-[10px] font-semibold transition-all ${
                            exportFps === fpsVal
                              ? 'bg-cyan-500 text-black border border-cyan-300'
                              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                          }`}
                        >
                          {fpsVal} FPS
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Audio Sync & Watermark Toggles */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* Audio Sync Toggle */}
                  <button
                    onClick={() => setExportIncludeAudio(!exportIncludeAudio)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      exportIncludeAudio
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="text-[11px] font-bold">Synchronized Audio</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {exportIncludeAudio ? 'Raw Power 808 sub + Rap Vocals' : 'Silent Video Only'}
                    </div>
                  </button>

                  {/* Watermark Position */}
                  <div className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300">
                      <span>Watermark Badge</span>
                      <button
                        onClick={() => setExportWatermark(!exportWatermark)}
                        className={`text-[9px] px-1.5 py-0.5 rounded ${
                          exportWatermark ? 'bg-cyan-500 text-black font-bold' : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {exportWatermark ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    {exportWatermark && (
                      <div className="grid grid-cols-2 gap-1 pt-1">
                        {(
                          [
                            ['bottom-right', 'Btm-Right'],
                            ['bottom-left', 'Btm-Left'],
                            ['top-right', 'Top-Right'],
                            ['center-lower', 'Center'],
                          ] as const
                        ).map(([posKey, label]) => (
                          <button
                            key={posKey}
                            onClick={() => setExportWatermarkPos(posKey)}
                            className={`py-0.5 px-1 rounded text-[9px] font-medium ${
                              exportWatermarkPos === posKey
                                ? 'bg-white/20 text-white border border-white/40'
                                : 'bg-black/40 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Message */}
                {exportStatusMsg && (
                  <div className="p-2 rounded-lg bg-zinc-900 text-[11px] text-cyan-300 border border-cyan-800">
                    {exportStatusMsg}
                  </div>
                )}

                {/* Start Render Button */}
                <button
                  onClick={handleStartExport}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 transition-all"
                >
                  <Video className="w-4 h-4 text-black" />
                  <span>START MPEG-4 RENDER ({exportDuration > 0 ? `${exportDuration}s` : 'Manual'})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
