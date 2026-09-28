import fs from 'fs';

// Generates 15 seconds of 124 BPM Raw Power soundtrack with 808 sub-bass, kick, hats & synth
const sampleRate = 44100;
const durationSec = 15;
const totalSamples = sampleRate * durationSec;
const numChannels = 2;
const bytesPerSample = 2;
const blockAlign = numChannels * bytesPerSample;
const byteRate = sampleRate * blockAlign;
const dataSize = totalSamples * blockAlign;
const buffer = Buffer.alloc(44 + dataSize);

// RIFF header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // subchunk1 size
buffer.writeUInt16LE(1, 20);  // PCM format
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(16, 34); // bits per sample
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

const bpm = 124;
const beatSec = 60 / bpm; // ~0.4838s

for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;
  const beatTime = t % beatSec;
  const barTime = t % (beatSec * 4);

  // 1. Kick & 808 Sub-bass drop
  let kick = 0;
  if (beatTime < 0.28) {
    const kickFreq = 120 * Math.exp(-beatTime * 18) + 48; // drops from 168 to 48 Hz
    kick = Math.sin(2 * Math.PI * kickFreq * beatTime) * Math.exp(-beatTime * 7) * 0.7;
  }

  // Sub bass glide
  const subFreq = barTime < beatSec * 2 ? 43.65 : 48.99; // F1 to G1
  const sub = Math.sin(2 * Math.PI * subFreq * t) * 0.45;

  // 2. Cyber Hi-Hats (16th notes)
  const hatStep = (t % (beatSec / 4));
  let hat = 0;
  if (hatStep < 0.04) {
    hat = (Math.random() * 2 - 1) * Math.exp(-hatStep * 90) * 0.18;
  }

  // 3. Cyber Synth Arp / Chord pad (Raw Power motif)
  const chordNotes = [220, 261.63, 329.63, 392.00]; // Am7
  const noteIndex = Math.floor(t * 8) % chordNotes.length;
  const synthFreq = chordNotes[noteIndex];
  const synth = (Math.sin(2 * Math.PI * synthFreq * t) + 0.3 * Math.sin(2 * Math.PI * synthFreq * 2 * t)) * 0.16;

  let left = kick + sub + hat + synth;
  let right = kick + sub - hat * 0.8 + synth * 1.1;

  // Master soft clip
  left = Math.max(-1, Math.min(1, left * 0.85));
  right = Math.max(-1, Math.min(1, right * 0.85));

  const intL = Math.floor(left * 32767);
  const intR = Math.floor(right * 32767);

  const offset = 44 + i * blockAlign;
  buffer.writeInt16LE(intL, offset);
  buffer.writeInt16LE(intR, offset + 2);
}

fs.writeFileSync('scripts/cinematic_audio.wav', buffer);
console.log('Generated scripts/cinematic_audio.wav (15s, 124 BPM)');
