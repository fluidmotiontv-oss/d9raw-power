import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/exports', express.static(path.resolve('public/exports')));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Text-to-Speech route using gemini-3.8-flash-tts
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'Fenrir', style = 'Deep, punchy, rhythmic fat vocals with heavy hype resonance' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text prompt is required.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 500),
              speechMetadata: {
                style: style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // Options: 'Fenrir' (deep, resonant), 'Charon' (authoritative), 'Puck', 'Kore', 'Zephyr'
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const candidatePart = response.candidates?.[0]?.content?.parts?.[0];
    const inlineData = candidatePart?.inlineData;

    if (!inlineData || !inlineData.data) {
      return res.status(500).json({ error: 'No audio returned from Gemini TTS.' });
    }

    return res.json({
      audioBase64: inlineData.data,
      mimeType: inlineData.mimeType || 'audio/pcm;rate=24000',
    });
  } catch (err: any) {
    console.error('Error generating speech:', err);
    return res.status(500).json({ error: err.message || 'TTS generation error' });
  }
});

// Health / status endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', track: 'Raw Power', theme: 'fluid-motion-dragon' });
});

// Download endpoints for exported Cinematic MPEG-4 and WebGL files
app.get('/api/exports/cinematic-mp4', (_req, res) => {
  const filePath = path.resolve('public/exports/Dragon9_RawPower_Cinematic.mp4');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'Dragon9_with_Raw_Power_Cinematic.mp4');
  } else {
    res.status(404).json({ error: 'Cinematic render in progress. Try again shortly.' });
  }
});

app.get('/api/exports/webgl-html', (_req, res) => {
  const filePath = path.resolve('public/exports/Dragon9_Cinematic_WebGL.html');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'Dragon9_Cinematic_WebGL.html');
  } else {
    res.status(404).json({ error: 'WebGL file not found.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
