#!/usr/bin/env bash
# ==============================================================================
# DRAGON9 × RAW POWER - MPEG-4 EXPORT PIPELINE FOR TERMUX & ANDROID
# ==============================================================================
# Host OS / Runtime: Android running Termux (dragon9 node configuration)
# Integrates with native intents (termux-share) for media sharing.
#
# Usage:
#   bash scripts/export_pipeline_dragon9.sh [input_video_path] [output_video_path]
#
# Examples:
#   bash scripts/export_pipeline_dragon9.sh
#   bash scripts/export_pipeline_dragon9.sh Dragon9_RawPower_capture.webm master.mp4
# ==============================================================================

set -euo pipefail

# ANSI Colors
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}=================================================================${NC}"
echo -e "${MAGENTA}  DRAGON9 × RAW POWER : MPEG-4 PIPELINE EXPORTER${NC}"
echo -e "${CYAN}  Fluid Motion WebGL Post-Processing & Android Native Intent Pipeline${NC}"
echo -e "${CYAN}=================================================================${NC}"

# 1. Locate or validate input file
INPUT_FILE="${1:-}"

if [[ -z "$INPUT_FILE" ]]; then
  # Look for newest exported video file in current directory
  NEWEST_FILE=$(find . -maxdepth 2 -type f \( -name "Dragon9_RawPower_*.mp4" -o -name "Dragon9_RawPower_*.webm" -o -name "*.mp4" -o -name "*.webm" \) ! -name "*_master.mp4" -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -f2- -d" " || true)
  if [[ -n "$NEWEST_FILE" && -f "$NEWEST_FILE" ]]; then
    INPUT_FILE="$NEWEST_FILE"
    echo -e "${GREEN}[OK] Auto-detected latest WebGL capture:${NC} $INPUT_FILE"
  fi
fi

if [[ -z "$INPUT_FILE" || ! -f "$INPUT_FILE" ]]; then
  echo -e "${RED}[ERROR] Input video file not found or not specified.${NC}"
  echo -e "Usage: bash scripts/export_pipeline_dragon9.sh <input_file> [output_file]"
  exit 1
fi

if [[ ! -s "$INPUT_FILE" ]]; then
  echo -e "${RED}[ERROR] Input file is empty (0 bytes):${NC} $INPUT_FILE"
  exit 1
fi

FILE_SIZE=$(du -h "$INPUT_FILE" | cut -f1)
echo -e "${GREEN}[OK] Validated input:${NC} $INPUT_FILE (${FILE_SIZE})"

# 2. Determine Output File
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="${2:-Dragon9_RawPower_Master_${TIMESTAMP}.mp4}"

# 3. Check for ffmpeg
if command -v ffmpeg &>/dev/null; then
  echo -e "${CYAN}[PIPELINE] Encoding MPEG-4 (H.264 High Profile / AAC Audio)...${NC}"
  echo -e "${MAGENTA}[CREDIT] Burning metadata: 'Dragon9 with Raw Power'${NC}"

  ffmpeg -hide_banner -loglevel warning -stats -y \
    -i "$INPUT_FILE" \
    -c:v libx264 \
    -preset fast \
    -crf 18 \
    -pix_fmt yuv420p \
    -movflags +faststart \
    -c:a aac \
    -b:a 256k \
    -metadata title="Dragon9 with Raw Power" \
    -metadata artist="Dragon9" \
    -metadata album="Dragon Line - Fluid Motion Experience" \
    -metadata comment="Dragon9 WebGL Export Pipeline // Raw Power (02:07)" \
    "$OUTPUT_FILE"

  echo -e "${GREEN}[OK] Export complete:${NC} $OUTPUT_FILE ($(du -h "$OUTPUT_FILE" | cut -f1))"
else
  echo -e "${YELLOW}[WARN] ffmpeg not found in PATH.${NC}"
  echo -e "To install in Termux: ${CYAN}pkg install ffmpeg${NC}"
  # If already an mp4 file, use as-is
  if [[ "$INPUT_FILE" == *.mp4 ]]; then
    OUTPUT_FILE="$INPUT_FILE"
  else
    cp "$INPUT_FILE" "$OUTPUT_FILE"
    echo -e "${YELLOW}[INFO] Copied to target container:${NC} $OUTPUT_FILE"
  fi
fi

# 4. Android Scoped Storage / Native Intent Integration (termux-share)
if command -v termux-share &>/dev/null; then
  echo -e "${CYAN}[INTENT] Invoking Termux native share intent (termux-share)...${NC}"
  termux-share -a send "$OUTPUT_FILE" || {
    echo -e "${YELLOW}[WARN] termux-share returned non-zero. Check termux-api package.${NC}"
  }
  echo -e "${GREEN}[OK] Native Android Share Intent triggered for artist.${NC}"
else
  echo -e "${YELLOW}[INFO] termux-share not installed or not in Termux environment.${NC}"
  echo -e "To enable native Android intents in Termux: ${CYAN}pkg install termux-api${NC}"
fi

echo -e "${GREEN}=================================================================${NC}"
echo -e "${GREEN}  MPEG-4 PIPELINE FINISHED: ${OUTPUT_FILE}${NC}"
echo -e "${MAGENTA}  CREDIT: Dragon9 with Raw Power${NC}"
echo -e "${GREEN}=================================================================${NC}"
