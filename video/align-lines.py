#!/usr/bin/env python3
"""
Video hikoyasi uchun gap chegaralari: voice/raw.wav + voice/lines.json -> voice/lines.json ga har gapning
audio'dagi boshlanishi va tugashi (`a0`, `a1`, soniya) qo'shiladi.

So'z vaqtlarini saytdagi tinglash bilan bir xil yo'l — scripts/align.py (Meta MMS forced aligner) hisoblaydi.
Gaplar orasiga `*` qo'yiladi: model pauzasi va ortiqcha tovushlarni o'sha yutadi.

    ../../.venv-align/bin/python video/align-lines.py video/git-umumiy
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import align as A  # noqa: E402

folder = Path(sys.argv[1])
lines = json.loads((folder / "voice" / "lines.json").read_text())

words = []
for index, line in enumerate(lines):
    if index:
        words.append({"line": None, "w": 0, "word": "*"})
    for position, word in enumerate(line["say"].split()):
        words.append({"line": index, "w": position, "word": word})

model = A.MMS_FA.get_model(with_star=True)
model.eval()
result, _ = A.align(model, A.MMS_FA.get_tokenizer(), A.MMS_FA.get_aligner(), folder / "voice" / "raw.wav", words)

for index, line in enumerate(lines):
    spoken = [w for w in result if w["line"] == index]
    line["a0"], line["a1"] = min(w["s"] for w in spoken), max(w["e"] for w in spoken)
    # So'zma-so'z vaqt (raw.wav da): animatsiyani so'zga bog'lash uchun (sql-umumiy)
    line["words"] = [{"w": w["word"], "s": w["s"], "e": w["e"]} for w in spoken]

(folder / "voice" / "lines.json").write_text(json.dumps(lines, ensure_ascii=False, indent=2))
for index, line in enumerate(lines):
    window = f' / oyna {line["e"] - line["s"]:4.1f}s' if "e" in line else ''
    print(f'{index + 1:2} {line["a0"]:6.2f}–{line["a1"]:6.2f}  ({line["a1"] - line["a0"]:4.1f}s{window})  {line["show"][:60]}')
