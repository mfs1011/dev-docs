#!/usr/bin/env python3
"""Bob audiolarini Gapiring (lokal o'zbekcha TTS) bilan yaratadi — Oracle serverda doim ishlaydi.

Gapiring by Gapi (https://gapi.uz), an adaptation of Kyutai Pocket TTS, CC BY 4.0.

Kirish:  segments/index.json va segments/<kitob>/<bob>.json (`npm run sync` yaratadi).
Chiqish: <OUT>/<kitob>/<bob>.ogg + .timings.json + .state.json — pleyer formatida (docs/tts.md).

Gemini'dan farqi: har segment alohida ovozlanadi, keyin ulanadi. Shuning uchun paragraf vaqtlari
(`timings.json`) aniq va aligner kerak emas. So'z darajasidagi `words.json` yaratilmaydi — pleyer
paragrafni belgilaydi.

Ishlatish:
  tts-gapiring.py --repo /srv/dev-docs-tts/repo --out /srv/dev-docs-tts/out/Gapiring
  tts-gapiring.py ... --once           # bitta bob va chiqish (sinov)
  tts-gapiring.py ... --plan           # qancha qolganini ko'rsatadi
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import wave
from pathlib import Path

import numpy as np

# Navbat: docs/tts.md dagi kelishilgan tartib. Charon (Gemini) bilan ovozlangan kitoblar o'tkazib yuboriladi —
# pleyer avval Charon'ni, keyin Gapiring'ni qidiradi.
NAVBAT = ['vue', 'angular', 'git', 'arxitektura', 'symfony', 'laravel']
# Kitob → ovoz (`f1` ayol, `m1` erkak). Ro'yxatda yo'q kitob — DEFAULT_VOICE.
# Ovoz o'zgartirilsa, o'sha kitob boblari keyingi aylanishda qayta ovozlanadi (state.json dagi `voice`).
DEFAULT_VOICE = 'm1'
BOOK_VOICES = {
    'fsd': 'f1',
}
MANNER = 'neutral'
GAP = 0.35          # segmentlar orasidagi jimlik (s)
PAUSE = 0.8         # [pause] segmenti
MAX_CHARS = 400     # bundan uzun matn gaplarga bo'linadi (model uzun matnda adashmasin)


def pronouncer(repo: Path):
    """scripts/talaffuz.json — tts.mjs dagi `pronounce` bilan bir xil: faqat modelga ketadigan matnda."""
    table = json.loads((repo / 'scripts/talaffuz.json').read_text())
    rules = [(re.compile(r'(?<![^\W_])' + re.escape(w) + r'(?![^\W_])'), s) for w, s in table.items() if not w.startswith('_')]

    def pronounce(text: str) -> str:
        for pattern, spoken in rules:
            text = pattern.sub(spoken, text)
        return text
    return pronounce


def log(*args):
    print(time.strftime('%H:%M:%S'), *args, flush=True)


def chunks(text: str) -> list[str]:
    if len(text) <= MAX_CHARS:
        return [text]
    parts, cur = [], ''
    for sentence in re.split(r'(?<=[.!?…])\s+', text):
        if cur and len(cur) + len(sentence) > MAX_CHARS:
            parts.append(cur)
            cur = sentence
        else:
            cur = f'{cur} {sentence}'.strip()
    if cur:
        parts.append(cur)
    return parts


def pages(repo: Path, skip: set[str]) -> list[dict]:
    index = json.loads((repo / 'segments/index.json').read_text())
    by_book: dict[str, list[dict]] = {}
    for page in index:
        book = page['file'].split('/')[0]
        if book not in skip:
            by_book.setdefault(book, []).append(page)
    order = [b for b in NAVBAT if b in by_book] + sorted(b for b in by_book if b not in NAVBAT)
    return [p for b in order for p in by_book[b]]


def voice_for(page: dict) -> str:
    return BOOK_VOICES.get(page['file'].split('/')[0], DEFAULT_VOICE)


def done(out: Path, page: dict) -> bool:
    state = out / (page['file'][:-3] + '.state.json')
    if not state.exists():
        return False
    saved = json.loads(state.read_text())
    return saved.get('hash') == page['hash'] and saved.get('voice') == f'gapiring-edge-{voice_for(page)}'


def render(tts, sample_rate: int, segments: list[dict], pronounce, voice: str) -> tuple[np.ndarray, list[dict]]:
    pieces, timings, t = [], [], 0.0
    gap = np.zeros(int(GAP * sample_rate), dtype=np.float32)
    for seg in segments:
        if seg['type'] == 'pause':
            pieces.append(np.zeros(int(PAUSE * sample_rate), dtype=np.float32))
            t += PAUSE
            continue
        text = seg['text'].strip()
        if not text:
            continue
        timings.append({'line': seg['line'], 'type': seg['type'], 'at': round(t, 2)})
        for part in chunks(pronounce(text)):
            audio = np.clip(tts.speak(part, voice=voice, role='assistant', manner=MANNER), -1, 1).astype(np.float32)
            pieces += [audio, gap]
            t += len(audio) / sample_rate + GAP
    return (np.concatenate(pieces) if pieces else np.zeros(1, dtype=np.float32)), timings


def encode(audio: np.ndarray, sample_rate: int, target: Path):
    target.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix='.wav', dir=target.parent, delete=False) as tmp:
        with wave.open(tmp.name, 'wb') as f:
            f.setnchannels(1)
            f.setsampwidth(2)
            f.setframerate(sample_rate)
            f.writeframes((audio * 32767).astype('<i2').tobytes())
    partial = target.with_suffix('.part.ogg')
    try:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp.name, '-c:a', 'libopus', '-b:a', '32k',
                        '-application', 'voip', str(partial)], check=True)
        partial.replace(target)
    finally:
        os.unlink(tmp.name)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--repo', type=Path, required=True)
    ap.add_argument('--out', type=Path, required=True)
    ap.add_argument('--skip', default='react,nextjs,linux', help="Charon bilan tayyor kitoblar")
    ap.add_argument('--once', action='store_true')
    ap.add_argument('--plan', action='store_true')
    args = ap.parse_args()

    skip = set(filter(None, args.skip.split(',')))
    todo = [p for p in pages(args.repo, skip) if not done(args.out, p)]

    if args.plan:
        words = sum(p['words'] for p in todo)
        print(f'qoldi: {len(todo)} bob, {words} so\'z')
        return

    if not todo:
        log('hammasi tayyor')
        return

    os.environ['HF_HUB_OFFLINE'] = os.environ.get('HF_HUB_OFFLINE', '1')
    from gapiring import SAMPLE_RATE, Gapiring
    tts = Gapiring('edge', normalize='literary')
    pronounce = pronouncer(args.repo)

    for page in todo:
        segments = json.loads((args.repo / 'segments' / (page['file'][:-3] + '.json')).read_text())
        started = time.time()
        voice = voice_for(page)
        audio, timings = render(tts, SAMPLE_RATE, segments, pronounce, voice)
        base = args.out / page['file'][:-3]
        encode(audio, SAMPLE_RATE, base.with_suffix('.ogg'))
        base.with_suffix('.timings.json').write_text(json.dumps(timings, ensure_ascii=False))
        took, length = time.time() - started, len(audio) / SAMPLE_RATE
        base.with_suffix('.state.json').write_text(json.dumps({
            'hash': page['hash'], 'words': page['words'], 'seconds': round(length, 1),
            'took': round(took), 'voice': f'gapiring-edge-{voice}', 'at': time.strftime('%Y-%m-%dT%H:%M:%S'),
        }))
        log(f"{page['file']} [{voice}]: {page['words']} so'z, audio {length/60:.1f} min, {took/60:.1f} min ketdi")
        if args.once:
            return


if __name__ == '__main__':
    sys.exit(main())
