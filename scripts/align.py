#!/usr/bin/env python3
"""
So'zma-so'z highlight uchun so'z vaqtlari: tayyor audio + ma'lum matn → har so'z qachon aytilgani.

Meta MMS forced aligner (torchaudio `MMS_FA`) — 1100+ til, o'zbek lotin yozuvi ham; bepul,
lokal ishlaydi, API limitiga ta'sir qilmaydi. Batafsil: docs/tts.md

    npm run tts:align                      # hamma ovozlangan, hali hisoblanmagan boblar
    npm run tts:align -- --books react     # faqat React
    npm run tts:align -- --force           # qaytadan hisoblash

Har `<bob>.ogg` yonida `<bob>.words.json`: [{ "line": 6, "w": 0, "word": "Tushuncha:", "s": 3.41, "e": 4.02 }]
`line` — segmentning manbadagi qatori (sahifadagi `data-line`), `w` — segment ichidagi so'z tartibi.
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import torch
import torchaudio
from torchaudio.pipelines import MMS_FA

ROOT = Path(__file__).resolve().parent.parent
SEGMENTS = ROOT / "segments"
AUDIO = ROOT / "audio"
SAMPLE_RATE = MMS_FA.sample_rate  # 16 kHz
CHUNK_SECONDS = 30
# Shundan uzun "matnda yo'q" nutq — model o'zidan qo'shgan deb hisoblanadi va qirqiladi
EXTRA_SEPARATOR = 2.5
EXTRA_CODE = 6.0
# O'lchangan o'rtacha ~10,8 harf/s; bundan 1,35 baravar tez bob — audio'dan haqiqiy matn ketgan
MAX_LETTERS_PER_SECOND = 14.5
APOSTROPHES = re.compile(r"[ʻʼ’‘`´]")
# Kodga o'xshash so'z: qavslar, teng belgisi, qo'shtirnoq, yo'l, @, $ yoki nuqtali nom (file.ts, console.log)
CODE_LIKE = re.compile(r"[(){}\[\]<>=;\"/@$|\\]|\w\.\w")


PRONUNCIATION = [
    (re.compile(rf"(?<![\w]){re.escape(word)}(?![\w])"), spoken)
    for word, spoken in json.loads((ROOT / "scripts" / "talaffuz.json").read_text()).items()
    if not word.startswith("_")
]


def pronounce(word: str) -> str:
    """tts.mjs dagi bilan bir xil lug'at: audio'da aytilgan shakl"""
    for pattern, spoken in PRONUNCIATION:
        word = pattern.sub(spoken, word)

    return word


def normalize(word: str) -> str:
    """MMS lug'ati: a–z va apostrof. Raqam va belgilar tashlanadi (bunday so'z vaqti qo'shnilardan olinadi)."""
    word = APOSTROPHES.sub("'", word.lower())
    word = re.sub(r"[^a-z']", "", word)

    return word.strip("'")


def load_audio(path: Path) -> torch.Tensor:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-f", "s16le", "-ac", "1", "-ar", str(SAMPLE_RATE), "-"],
        check=True,
        capture_output=True,
    ).stdout

    return torch.from_numpy(np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0).unsqueeze(0)


def emissions(model, waveform: torch.Tensor):
    """Uzun audio xotiraga sig'ishi uchun bo'laklab. Har kadrning boshlanish vaqti alohida qaytariladi:
    bo'lak chegarasida kadrlar soni yaxlitlanadi — umumiy nisbat bilan hisoblansa, vaqt siljiydi."""
    step = CHUNK_SECONDS * SAMPLE_RATE
    parts = []
    frame_times = []

    with torch.inference_mode():
        for start in range(0, waveform.shape[1], step):
            chunk = waveform[:, start:start + step]

            if chunk.shape[1] < SAMPLE_RATE // 10:
                continue

            emission, _ = model(chunk)
            frames = emission.shape[1]
            seconds_per_frame = chunk.shape[1] / frames / SAMPLE_RATE

            parts.append(emission)
            frame_times.extend(start / SAMPLE_RATE + index * seconds_per_frame for index in range(frames + 1))

            frame_times.pop()  # oxirgi "+1" faqat bo'lak tugashi uchun edi

    frame_times.append(waveform.shape[1] / SAMPLE_RATE)

    return torch.cat(parts, dim=1), frame_times


def transcript(page_file: str, legacy: bool, audio_path: Path):
    """Audio'dagi so'zlar ketma-ketligi. Legacy (teglar o'qilgan) audio'da tag so'zlari ham bor — ular ko'rsatilmaydi."""
    # Audio aynan qaysi matndan yaratilgan bo'lsa — o'sha nusxa (`<bob>.segments.json`); bo'lmasa joriy segmentlar
    snapshot = audio_path.with_name(audio_path.name.replace(".ogg", ".segments.json"))
    source = snapshot if snapshot.exists() else SEGMENTS / page_file.replace(".md", ".json")
    segments = json.loads(source.read_text())
    timings_path = audio_path.with_name(audio_path.name.replace(".ogg", ".timings.json"))
    covered = None

    # Qisqa namunalarda audio bobning faqat boshini o'z ichiga oladi — shuni timings.json aytadi
    if timings_path.exists():
        lines = [item["line"] for item in json.loads(timings_path.read_text())]
        spoken = [segment for segment in segments if segment["type"] != "pause" and segment["text"]]

        if len(lines) < len(spoken):
            covered = len(lines)

    words = []
    spoken_index = 0

    for segment in segments:
        if segment["type"] == "pause":
            if legacy:
                words.append({"line": None, "w": None, "word": "long pause"})
            continue

        if not segment["text"]:
            continue

        if covered is not None and spoken_index >= covered:
            break

        # Segment (va jadvalning har qatori) oldidan `*`: kutilmagan pauza yoki qo'shimcha so'z
        # qo'shni so'zlarni cho'zib yubormasin
        words.append({"line": None, "w": None, "word": "*"})
        index = 0
        for row in segment["text"].split("\n"):
            if index:
                words.append({"line": None, "w": None, "word": "*"})
            for word in row.split():
                words.append({"line": segment["line"], "w": index, "word": word})
                index += 1

        if legacy and segment["type"] == "heading":
            words.append({"line": None, "w": None, "word": "short pause"})

        spoken_index += 1

    return words


def align(model, tokenizer, aligner, audio_path: Path, words):
    waveform = load_audio(audio_path)
    emission, frame_times = emissions(model, waveform)
    at = lambda frame: frame_times[min(frame, len(frame_times) - 1)]

    # Har ko'rinadigan so'z bir yoki bir nechta MMS "so'z"iga bo'linishi mumkin ("long pause" → 2)
    units = []
    for position, item in enumerate(words):
        # Kod parchasi (`count={5}`, `console.log('x')`) — model uni o'zicha o'qiydi; aniq yozuv o'rniga
        # `*` (istalgan nutqni yutadi), so'z vaqti o'sha `*` oralig'i bo'ladi
        if item["word"] == "*" or CODE_LIKE.search(item["word"]):
            if not units or units[-1][1] != "*":
                units.append((position, "*"))
            elif item["line"] is not None:
                units.append((position, "*"))
            continue

        for piece in pronounce(item["word"]).split():
            token = normalize(piece)
            if token:
                units.append((position, token))

    # Boshi va oxirida ham `*` (bob boshidagi/oxiridagi pauza)
    units = [(None, "*")] + units + [(None, "*")]

    if not units:
        return [], []

    spans = aligner(emission[0], tokenizer([token for _, token in units]))
    times = {}

    # Qo'llanmada yo'q nutq: segmentlar orasidagi `*` uzun bo'lsa (model o'zidan qo'shgan) yoki
    # kod parchasi o'rnidagi `*` haddan tashqari uzun bo'lsa
    extras = []
    for index, ((position, token), span) in enumerate(zip(units, spans)):
        if token != "*" or index in (0, len(units) - 1):
            continue
        start, end = at(span[0].start), at(span[-1].end)
        limit = EXTRA_SEPARATOR if position is None else EXTRA_CODE
        if end - start > limit:
            extras.append((round(start, 2), round(end, 2)))

    for (position, _), span in zip(units, spans):
        if position is None:
            continue
        start, end = at(span[0].start), at(span[-1].end)
        previous = times.get(position)
        times[position] = (min(start, previous[0]), max(end, previous[1])) if previous else (start, end)

    result = []
    last_end = 0.0

    for position, item in enumerate(words):
        if item["line"] is None:
            continue

        # Raqam/belgidan iborat so'z — oldingi so'z oxiridan keyingi so'z boshigacha
        start, end = times.get(position, (last_end, last_end))
        result.append({"line": item["line"], "w": item["w"], "word": item["word"], "s": round(start, 2), "e": round(end, 2)})
        last_end = end

    return result, extras


def remove_spans(audio_path: Path, spans) -> float:
    """Audio'dan berilgan oraliqlarni olib tashlaydi (chetlaridan 0,15 s pauza qoldirib). Qaytaradi: olib tashlangan soniya."""
    keep = [(max(0.0, start + 0.15), max(0.0, end - 0.15)) for start, end in spans if end - start > 0.4]
    if not keep:
        return 0.0

    condition = "+".join(f"between(t,{start:.3f},{end:.3f})" for start, end in keep)
    temporary = audio_path.with_name(f".{audio_path.stem}.kesish.ogg")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(audio_path),
                    "-af", f"aselect='not({condition})',asetpts=N/SR/TB",
                    "-c:a", "libopus", "-b:a", "24k", "-ac", "1", str(temporary)], check=True)
    temporary.replace(audio_path)

    return sum(end - start for start, end in keep)


def write_timings(audio_path: Path, words):
    """Paragraf vaqtlari so'zlardan (har segmentning birinchi so'zi) — words.json bilan bir xil manba"""
    firsts = {}
    for item in words:
        firsts.setdefault(item["line"], item["s"])
    timings = [{"line": line, "type": "paragraph", "at": max(0.0, at)} for line, at in firsts.items()]
    audio_path.with_name(audio_path.name.replace(".ogg", ".timings.json")).write_text(json.dumps(timings))


def letters_of(page_file: str) -> int:
    snapshot = AUDIO / "Charon" / page_file.replace(".md", ".segments.json")
    segments = json.loads((snapshot if snapshot.exists() else SEGMENTS / page_file.replace(".md", ".json")).read_text())

    return sum(len(re.findall(r"\w", segment["text"])) for segment in segments if segment["type"] != "pause" and segment["text"])


def duration_of(path: Path) -> float:
    output = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True,
    ).stdout

    return float(output.strip() or 0)


def pcm(path: Path, rate: int, start: float = 0.0, duration: float = None) -> np.ndarray:
    """Audio bo'lagi (mono int16) — ffmpeg orqali"""
    span = ["-ss", str(max(0.0, start))] + (["-t", str(duration)] if duration is not None else [])
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", *span, "-i", str(path), "-f", "s16le", "-ac", "1", "-ar", str(rate), "-"],
        check=True, capture_output=True,
    ).stdout

    return np.frombuffer(raw, dtype=np.int16)


WINDOW = 75  # chegara atrofida har tomondan shuncha soniya
EDGE_WORDS = 25  # chegaraning har tomonidan moslanadigan so'zlar


def boundary_shift(model, tokenizer, aligner, left, right):
    """
    Ikki qo'shni bob ulangan joy (`left` oxiri + `right` boshi) atrofida chegarani aniqlaydi.
    Transkript: `*` + chap bobning oxirgi so'zlari + o'ng bobning dastlabki so'zlari + `*` —
    `*` atrofdagi qolgan nutqni yutadi. Qaytaradi: haqiqiy chegara − hozirgi ulanish (soniya).
    Manfiy — chap bob oxirida o'ng bobning so'zlari bor; musbat — aksincha.
    """
    left_file, left_path = left
    right_file, right_path = right
    left_seconds = duration_of(left_path)
    take_left = min(WINDOW, left_seconds)

    window = np.concatenate([
        pcm(left_path, SAMPLE_RATE, left_seconds - take_left),
        pcm(right_path, SAMPLE_RATE, 0, WINDOW),
    ]).astype(np.float32) / 32768.0
    waveform = torch.from_numpy(window).unsqueeze(0)
    junction = take_left

    def tokens_of(page_file):
        result = []
        for item in transcript(page_file, False, Path("/__yoq__.ogg")):
            for piece in pronounce(item["word"]).split():
                token = normalize(piece)
                if token:
                    result.append(token)
        return result

    tail = tokens_of(left_file)[-EDGE_WORDS:]
    head = tokens_of(right_file)[:EDGE_WORDS]

    if not tail or not head:
        return 0.0

    emission, frame_times = emissions(model, waveform)
    spans = aligner(emission[0], tokenizer(["*", *tail, *head, "*"]))
    at = lambda frame: frame_times[min(frame, len(frame_times) - 1)]
    last_left_end = at(spans[len(tail)][-1].end)        # spans[0] — boshidagi `*`
    first_right_start = at(spans[len(tail) + 1][0].start)

    return round((last_left_end + first_right_start) / 2 - junction, 3)


def signature(path: Path) -> str:
    """Fayl o'zgarganini bilish uchun: hajm + o'zgartirilgan vaqt"""
    stat = path.stat()
    return f"{stat.st_size}-{int(stat.st_mtime)}"


def checked_path(pages) -> Path:
    return pages[0][1].parent.parent / "chegaralar.json"


def load_checked(pages):
    path = checked_path(pages)
    return json.loads(path.read_text()) if path.exists() else {}


def save_checked(pages, checked):
    checked_path(pages).write_text(json.dumps(checked, indent=2))


def pair_key(left, right) -> str:
    return f"{left[0]}|{right[0]}"


def pair_signature(left, right) -> str:
    return f"{signature(left[1])}/{signature(right[1])}"


def refine_boundaries(model, tokenizer, aligner, pages):
    """
    Kitob boblari orasidagi har chegarani so'z darajasida tuzatadi: chap bob oxiridagi o'ng bob
    so'zlari o'ng bob boshiga ko'chiriladi (yoki aksincha). Hech narsa o'chirilmaydi — audio
    faqat qo'shnilar orasida qayta taqsimlanadi. 0,25 s dan kichik siljish e'tiborsiz.
    Qaytaradi: o'zgargan boblar ro'yxati.
    """
    changed = set()
    # Ikki tomonidagi fayl ham o'zgarmagan chegara qayta tekshirilmaydi (audio/<ovoz>/chegaralar.json)
    checked = load_checked(pages)

    with __import__("tempfile").TemporaryDirectory() as temp:
        temp = Path(temp)

        for index in range(len(pages) - 1):
            left, right = pages[index], pages[index + 1]

            if checked.get(pair_key(left, right)) == pair_signature(left, right):
                continue

            shift = boundary_shift(model, tokenizer, aligner, left, right)

            if abs(shift) < 0.25:
                checked[pair_key(left, right)] = pair_signature(left, right)
                save_checked(pages, checked)
                continue

            left_path, right_path = left[1], right[1]
            left_seconds = duration_of(left_path)
            new_left, new_right = temp / "l.wav", temp / "r.wav"

            if shift < 0:  # chap bob oxiri → o'ng bob boshiga
                cut = left_seconds + shift
                subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(left_path), "-t", str(cut), str(new_left)], check=True)
                subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(cut), "-i", str(left_path), "-i", str(right_path),
                                "-filter_complex", "[0:a][1:a]concat=n=2:v=0:a=1", str(new_right)], check=True)
            else:  # o'ng bob boshi → chap bob oxiriga
                head = temp / "head.wav"
                subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(right_path), "-t", str(shift), str(head)], check=True)
                subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(left_path), "-i", str(head),
                                "-filter_complex", "[0:a][1:a]concat=n=2:v=0:a=1", str(new_left)], check=True)
                subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(shift), "-i", str(right_path), str(new_right)], check=True)

            for source, target in ((new_left, left_path), (new_right, right_path)):
                encoded = temp / "out.ogg"
                subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(source), "-c:a", "libopus", "-b:a", "24k", "-ac", "1", str(encoded)], check=True)
                encoded.replace(target)
                # eski so'z vaqtlari endi yaroqsiz
                target.with_name(target.name.replace(".ogg", ".words.json")).unlink(missing_ok=True)

            changed.update({left[0], right[0]})
            print(f"  ✂ {left[0]} | {right[0]}: chegara {shift:+.2f} s")

    return changed


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice", default="Charon")
    parser.add_argument("--books", default=None)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    books = args.books.split(",") if args.books else None
    index = json.loads((SEGMENTS / "index.json").read_text())
    roots = [(AUDIO / args.voice, False), (AUDIO / "_eski" / f"{args.voice}-teglar", True)]
    jobs = []

    for page in index:
        if books and page["file"].split("/")[0] not in books:
            continue

        for root, legacy in roots:
            audio_path = root / page["file"].replace(".md", ".ogg")

            # Yangi audio bor bobning eski (teglar o'qilgan) nusxasi kerak emas
            if legacy and (roots[0][0] / page["file"].replace(".md", ".ogg")).exists():
                continue
            output = audio_path.with_name(audio_path.name.replace(".ogg", ".words.json"))

            if not audio_path.exists():
                continue
            if output.exists() and not args.force and output.stat().st_mtime >= audio_path.stat().st_mtime:
                continue

            jobs.append((page["file"], audio_path, output, legacy))

    model = tokenizer = aligner = None

    def load_model():
        nonlocal model, tokenizer, aligner
        if model is None:
            model = MMS_FA.get_model(with_star=True)
            model.eval()
            tokenizer = MMS_FA.get_tokenizer()
            aligner = MMS_FA.get_aligner()

    # Boblar orasidagi chegaralar (bir nechta bob bitta so'rovda yaratilib, jimlikdan kesilgan)
    voice_root = AUDIO / args.voice
    by_book = {}
    for page in index:
        book = page["file"].split("/")[0]
        audio_path = voice_root / page["file"].replace(".md", ".ogg")
        if (not books or book in books) and audio_path.exists():
            by_book.setdefault(book, []).append((page["file"], audio_path))

    for book, pages in by_book.items():
        load_model()
        changed = set()

        # Katta xatoda bir o'tish yetmaydi (bob siljisa qo'shnisi ham o'zgaradi) — barqarorlashguncha
        for attempt in range(4):
            moved = refine_boundaries(model, tokenizer, aligner, pages)
            changed |= moved
            if not moved:
                break
        else:
            print(f"  ⚠ {book}: chegaralar 4 o'tishda barqarorlashmadi — atrofidagi boblarni --redo --single bilan qayta yarating: {sorted(moved)}")

        for page_file, audio_path in pages:
            output = audio_path.with_name(audio_path.name.replace(".ogg", ".words.json"))
            if page_file in changed and not any(job[1] == audio_path for job in jobs):
                jobs.append((page_file, audio_path, output, False))

    print(f"Hisoblanadigan: {len(jobs)} bob")
    if not jobs:
        return

    load_model()

    for page_file, audio_path, output, legacy in jobs:
        try:
            words = transcript(page_file, legacy, audio_path)
            result, extras = align(model, tokenizer, aligner, audio_path, words)
            note = " (eski, teglar bilan)" if legacy else ""

            # Model qo'llanmada yo'q narsani o'qigan bo'lsa — o'sha joylarni audio'dan qirqib, qaytadan moslaymiz
            if extras and not legacy:
                # Qirqilgandan keyin bob haddan tashqari tez bo'lib qolsa — haqiqiy matn ham ketadi; qirqilmaydi
                planned = sum(max(0.0, end - start - 0.3) for start, end in extras)
                remaining = duration_of(audio_path) - planned
                if remaining <= 0 or letters_of(page_file) / remaining > MAX_LETTERS_PER_SECOND:
                    note += f" · ⚠ {planned:.0f} s 'qo'shimcha nutq' qirqilmadi (haqiqiy matn ketardi) — bobni qayta yarating (--redo)"
                else:
                    removed = remove_spans(audio_path, extras)
                    result, extras = align(model, tokenizer, aligner, audio_path, words)
                    note += f" · qo'shimcha nutq qirqildi: {removed:.0f} s"

            output.write_text(json.dumps(result, ensure_ascii=False))
            write_timings(audio_path, result)
            print(f"  ✓ {page_file}{note} · {len(result)} so'z")
        except Exception as error:  # bitta bob xatosi boshqalarini to'xtatmasin
            print(f"  ✗ {page_file}: {error}", file=sys.stderr)


if __name__ == "__main__":
    main()
