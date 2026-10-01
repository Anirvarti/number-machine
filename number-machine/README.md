# The Number Machine — Class 7 AI Project

Version 1 contains:
1. Machine Room — chain +, −, ×, ÷ machines with animation and sound.
2. Guess the Machine — search-based AI that tests many one/two-operation rules.
3. Pattern Player — turns number sequences into notes using the browser Web Audio API.

## Run on Mac

Double-click `index.html`, or recommended:

```bash
cd /path/to/number-machine
python3 -m http.server 8000
```

Then open http://localhost:8000

No API key, backend, installation, or internet connection is required.

## AI explanation

The Guess the Machine module performs a bounded search over candidate arithmetic machines. It keeps rules that reproduce every supplied example. If multiple rules fit, it reports the ambiguity instead of claiming certainty.

## Parent presentation line

"The computer is not told the answer. It tries many possible machines and keeps the ones that fit every example. If several machines fit, it tells us that more evidence is needed."

## Files

- index.html — interface
- style.css — design, colours and animations
- app.js — arithmetic engine, search-based AI and Web Audio
- README.md — instructions
