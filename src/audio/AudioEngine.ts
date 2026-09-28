import { AudioVisualizerData } from '../types';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private ttsGain: GainNode | null = null;
  private isPlaying = false;
  private startTime = 0;
  private pauseOffset = 0;
  private duration = 127; // 2 minutes 7 seconds (Raw Power)
  private timerId: number | null = null;
  private beatStep = 0;
  private nextNoteTime = 0;
  private tempo = 124; // Hype energetic tempo
  private isMuted = false;
  private bassBoost = true;
  private customAudioElement: HTMLAudioElement | null = null;
  private customAudioSource: MediaElementAudioSourceNode | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private currentTtsSource: AudioBufferSourceNode | null = null;

  private freqData: Uint8Array = new Uint8Array(64);
  private timeData: Uint8Array = new Uint8Array(64);
  private streamDest: MediaStreamAudioDestinationNode | null = null;

  public onTimeUpdate?: (currentTime: number, duration: number) => void;
  public onStateChange?: (isPlaying: boolean) => void;

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioCtx();

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.analyser.smoothingTimeConstant = 0.85;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.8;

    this.ttsGain = this.ctx.createGain();
    this.ttsGain.gain.value = 1.0;

    this.masterGain.connect(this.analyser);
    this.ttsGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    if (this.streamDest) {
      this.analyser.connect(this.streamDest);
    }

    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.frequencyBinCount);
  }

  public getOrCreateMediaStreamDestination(): MediaStreamAudioDestinationNode | null {
    this.init();
    if (!this.ctx) return null;
    if (!this.streamDest) {
      this.streamDest = this.ctx.createMediaStreamDestination();
      if (this.analyser) {
        this.analyser.connect(this.streamDest);
      }
    }
    return this.streamDest;
  }


  public async start() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.customAudioElement) {
      this.customAudioElement.play();
      this.isPlaying = true;
      this.onStateChange?.(true);
      return;
    }

    if (!this.isPlaying) {
      this.isPlaying = true;
      this.startTime = this.ctx.currentTime - this.pauseOffset;
      this.nextNoteTime = this.ctx.currentTime;
      this.scheduleLoop();
      this.onStateChange?.(true);
    }
  }

  public pause() {
    if (this.customAudioElement) {
      this.customAudioElement.pause();
    }
    if (this.isPlaying && this.ctx) {
      this.pauseOffset = this.ctx.currentTime - this.startTime;
      if (this.pauseOffset > this.duration) {
        this.pauseOffset = this.pauseOffset % this.duration;
      }
      this.isPlaying = false;
      if (this.timerId !== null) {
        window.clearTimeout(this.timerId);
        this.timerId = null;
      }
      this.onStateChange?.(false);
    }
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.start();
    }
  }

  public seek(seconds: number) {
    if (this.customAudioElement) {
      this.customAudioElement.currentTime = seconds;
      return;
    }
    this.pauseOffset = Math.max(0, Math.min(seconds, this.duration));
    if (this.ctx && this.isPlaying) {
      this.startTime = this.ctx.currentTime - this.pauseOffset;
    }
    this.onTimeUpdate?.(this.pauseOffset, this.duration);
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public toggleBassBoost() {
    this.bassBoost = !this.bassBoost;
    return this.bassBoost;
  }

  public getVisualizerData(): AudioVisualizerData {
    if (!this.analyser) {
      return {
        bass: 0,
        mid: 0,
        treble: 0,
        overall: 0,
        frequencies: this.freqData,
        waveformData: this.timeData,
      };
    }

    this.analyser.getByteFrequencyData(this.freqData as any);
    this.analyser.getByteTimeDomainData(this.timeData as any);

    const length = this.freqData.length;
    let bassSum = 0;
    let midSum = 0;
    let trebleSum = 0;

    const bassEnd = Math.floor(length * 0.2);
    const midEnd = Math.floor(length * 0.65);

    for (let i = 0; i < bassEnd; i++) {
      bassSum += this.freqData[i];
    }
    for (let i = bassEnd; i < midEnd; i++) {
      midSum += this.freqData[i];
    }
    for (let i = midEnd; i < length; i++) {
      trebleSum += this.freqData[i];
    }

    let bass = bassSum / (bassEnd * 255);
    let mid = midSum / ((midEnd - bassEnd) * 255);
    let treble = trebleSum / ((length - midEnd) * 255);

    if (this.bassBoost) {
      bass = Math.min(1.0, bass * 1.35);
    }

    const overall = (bass * 0.5) + (mid * 0.3) + (treble * 0.2);

    return {
      bass,
      mid,
      treble,
      overall,
      frequencies: this.freqData,
      waveformData: this.timeData,
    };
  }

  // Plays TTS audio (from Gemini 3.8 Flash TTS) through the engine so visuals pulse to vocals!
  public async playTtsAudio(base64Data: string, sampleRate = 24000) {
    this.init();
    if (!this.ctx || !this.ttsGain) return;
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    // Stop prior vocal if running
    if (this.currentTtsSource) {
      try {
        this.currentTtsSource.stop();
      } catch (e) {
        // ignore
      }
    }

    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Check if WAV header (RIFF)
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      const audioBuffer = await this.ctx.decodeAudioData(bytes.buffer.slice(0));
      const source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.ttsGain);
      source.start();
      this.currentTtsSource = source;
      return;
    }

    // Raw 16-bit PCM little endian
    const int16Array = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
    const audioBuffer = this.ctx.createBuffer(1, int16Array.length, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < int16Array.length; i++) {
      channelData[i] = int16Array[i] / 32768.0;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.ttsGain);
    source.start();
    this.currentTtsSource = source;
  }

  // Load custom audio file if user chooses to test their own local file
  public loadUserFile(file: File) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.customAudioElement) {
      this.customAudioElement.pause();
      this.customAudioElement.src = '';
    }

    const audioUrl = URL.createObjectURL(file);
    const audio = new Audio();
    audio.src = audioUrl;
    audio.crossOrigin = 'anonymous';

    const source = this.ctx.createMediaElementSource(audio);
    source.connect(this.masterGain);

    this.customAudioElement = audio;
    this.customAudioSource = source;

    audio.onloadedmetadata = () => {
      this.duration = audio.duration || 127;
      this.onTimeUpdate?.(0, this.duration);
    };

    audio.ontimeupdate = () => {
      this.onTimeUpdate?.(audio.currentTime, this.duration);
    };

    audio.onended = () => {
      this.isPlaying = false;
      this.onStateChange?.(false);
    };

    this.start();
  }

  // Web Audio Beat Synthesizer for "Raw Power"
  private scheduleLoop = () => {
    if (!this.isPlaying || !this.ctx) return;

    const lookahead = 0.1;
    const scheduleAheadTime = 0.2;
    const secondsPer16th = 60 / this.tempo / 4;

    while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
      this.playStep(this.beatStep, this.nextNoteTime);
      this.nextNoteTime += secondsPer16th;
      this.beatStep = (this.beatStep + 1) % 64; // 4-bar loop
    }

    const currentTime = (this.ctx.currentTime - this.startTime) % this.duration;
    this.onTimeUpdate?.(currentTime, this.duration);

    this.timerId = window.setTimeout(this.scheduleLoop, lookahead * 1000);
  };

  private playStep(step: number, time: number) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Kick on 0, 8, 16, 24, 28, 32, 40, 48, 56, 60 (funky trap 808 pattern)
    if ([0, 10, 16, 26, 32, 42, 48, 58, 60].includes(step)) {
      this.trigger808Kick(time, step % 32 === 0);
    }

    // Snare / Clap on 8, 24, 40, 56
    if ([8, 24, 40, 56].includes(step)) {
      this.triggerSnare(time);
    }

    // Hi-hats on every 2nd 16th with roll accents
    if (step % 2 === 0 || (step >= 28 && step <= 31) || (step >= 60 && step <= 63)) {
      this.triggerHiHat(time, step % 4 === 0);
    }

    // Funky Acid Synth Bassline (Raw Power vibe)
    const bassNotes = [36, 36, 39, 41, 36, 44, 43, 41]; // C1, C1, Eb1, F1...
    if (step % 4 === 0 || step % 7 === 0) {
      const noteIdx = Math.floor(step / 4) % bassNotes.length;
      const midi = bassNotes[noteIdx];
      const freq = 440 * Math.pow(2, (midi - 69) / 12);
      this.triggerSynthBass(freq, time, 0.22);
    }

    // Cyber Lead Arpeggios
    if (step % 3 === 0) {
      const leadNotes = [60, 63, 67, 70, 72, 75, 70, 67];
      const noteIdx = (step * 2) % leadNotes.length;
      const freq = 440 * Math.pow(2, (leadNotes[noteIdx] - 69) / 12);
      this.triggerCyberLead(freq, time, 0.12);
    }
  }

  private trigger808Kick(time: number, isDownbeat: boolean) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = isDownbeat ? 160 : 130;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.18);

    const volume = isDownbeat ? 0.95 : 0.75;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.38);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.4);
  }

  private triggerSnare(time: number) {
    if (!this.ctx || !this.masterGain) return;

    // Noise buffer
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 850;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.65, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.2);
  }

  private triggerHiHat(time: number, isAccent: boolean) {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isAccent ? 0.35 : 0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  private triggerSynthBass(freq: number, time: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, time);
    filter.frequency.exponentialRampToValueAtTime(1400, time + 0.04);
    filter.frequency.exponentialRampToValueAtTime(320, time + duration);

    gain.gain.setValueAtTime(0.55, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private triggerCyberLead(freq: number, time: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.005, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration + 0.01);
  }
}
