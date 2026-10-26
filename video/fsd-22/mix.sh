#!/usr/bin/env bash
# music.wav + voice/voice.wav -> mix.wav: gap paytida musiqa cho'kadi (sidechain), ikki bosqichli loudnorm (-16 LUFS)
set -euo pipefail
cd "$(dirname "$0")"
F="[1:a]aresample=44100,pan=stereo|c0=c0|c1=c0,asplit=2[v][sc];[0:a]volume=0.5[m0];[m0][sc]sidechaincompress=threshold=0.015:ratio=3:attack=30:release=500[m];[m][v]amix=inputs=2:normalize=0:duration=longest,volume=-3dB,alimiter=limit=0.7:attack=5:release=50:level=false"
ffmpeg -loglevel error -y -i music.wav -i voice/voice.wav -filter_complex "$F" -c:a pcm_f32le premix.wav
J=$(ffmpeg -hide_banner -i premix.wav -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get(){ echo "$J" | grep "\"$1\"" | sed -E 's/.*: "([^"]+)".*/\1/'; }
ffmpeg -loglevel error -y -i premix.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" -ar 48000 mix.wav
rm premix.wav
