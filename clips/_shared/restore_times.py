#!/usr/bin/env python3
"""Give each voice file back the time stamp its word timings were taken from.

git does not keep file times, so after a clone or checkout build.py would think every voice/s<N>.flac changed
after voice/words.json, ignore the word timings and place the w: cues by guess. Run once after checkout:
    python3 clips/_shared/restore_times.py clips/5-whys/case
"""
import json, os, sys

voice = os.path.join(sys.argv[1], "voice")
words = json.load(open(os.path.join(voice, "words.json")))
for n, w in sorted(words.items(), key=lambda kv: int(kv[0])):
    f = os.path.join(voice, f"s{n}.flac")
    if os.path.exists(f) and "file_mtime" in w:
        os.utime(f, (w["file_mtime"], w["file_mtime"]))
        print(f"s{n}.flac ok")
