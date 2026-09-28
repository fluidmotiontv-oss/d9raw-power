#!/usr/bin/env bash
# ==============================================================================
# DRAGON9 × RAW POWER - CINEMATIC MPEG-4 PIPELINE MASTER EXPORTER
# ==============================================================================

set -euo pipefail

mkdir -p public/exports

OUTPUT_NAME="Dragon9_RawPower_Cinematic.mp4"
TARGET_FILE="public/exports/${OUTPUT_NAME}"
ROOT_TARGET="./${OUTPUT_NAME}"
AUDIO_FILE="scripts/cinematic_audio.wav"

if [[ ! -f "$AUDIO_FILE" ]]; then
  echo "[AUDIO] Generating 124 BPM Raw Power soundtrack stem..."
  node scripts/generate_cinematic_audio.js
fi

echo "[PIPELINE] Encoding Cinematic MPEG-4 (1920x1080 @ 60 FPS, 15 seconds)..."

ffmpeg -hide_banner -loglevel warning -y \
  -f lavfi -i "nullsrc=s=1920x1080:d=15:r=60" \
  -i "$AUDIO_FILE" \
  -filter_complex "
    [0:v]
    geq=
      r='(16 + 28*sin((X*0.004 + Y*0.003 + T*1.4)) + 35*sin(X*0.006 - T*0.9))*0.85':
      g='(10 + 18*sin((X*0.003 - Y*0.004 + T*1.1)) + 22*cos(Y*0.005 + T*0.8))*0.85':
      b='(38 + 55*cos((X*0.005 + Y*0.004 - T*1.3)) + 70*sin((X+Y)*0.003 + T*1.5))*0.85'
    [nebula];

    [nebula]
    drawbox=x=0:y=0:w=1920:h=70:color=black@0.95:t=fill,
    drawbox=x=0:y=1010:w=1920:h=70:color=black@0.95:t=fill,
    drawbox=x=1420:y=935:w=460:h=95:color=black@0.85:t=fill,
    drawbox=x=1420:y=935:w=460:h=95:color=0x00f0ff@0.65:t=2,
    drawbox=x=1426:y=940:w=4:h=85:color=0xff007f:t=fill,
    drawtext=text='DRAGON9 WITH RAW POWER':x=1446:y=952:fontsize=19:fontcolor=white,
    drawtext=text='FLUID MOTION WEBGL • RAW POWER SOUNDTRACK':x=1446:y=979:fontsize=12:fontcolor=0x67e8f9,
    drawtext=text='REC 00\\:15.0 • 60 FPS • 124 BPM • CINEMATIC CUT':x=1446:y=1002:fontsize=11:fontcolor=0xffd700,
    drawtext=text='DRAGON LINE // FLUID KINETIC MECHA (RAW POWER)':x=60:y=26:fontsize=15:fontcolor=0x00f0ff,
    drawtext=text='ACT IV\\: LOTUS ENIGMA & SMILE':x=1520:y=26:fontsize=14:fontcolor=0xff77aa
    [v]
  " \
  -map "[v]" \
  -map 1:a \
  -c:v libx264 \
  -preset fast \
  -crf 18 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  -c:a aac \
  -b:a 256k \
  -metadata title="Dragon9 with Raw Power" \
  -metadata artist="Dragon9 with Raw Power" \
  -metadata album="Dragon Line - Fluid Motion Experience" \
  -metadata comment="Exported via Dragon9 WebGL Cinematic Pipeline" \
  "$TARGET_FILE"

cp "$TARGET_FILE" "$ROOT_TARGET"

echo "[OK] Successfully exported Cinematic MPEG-4 master:"
echo "     $TARGET_FILE ($(du -h "$TARGET_FILE" | cut -f1))"
echo "     $ROOT_TARGET"
