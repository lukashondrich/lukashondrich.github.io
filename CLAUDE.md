# CLAUDE.md — Project Instructions

## Communication Preferences
- Never use the AskUserQuestion tool. Use numbered lists in plain text instead.
- Never use the auto memory tool/directory. We maintain our own documentation system.

## Project Overview
Personal website for Lukas Hondrich, hosted on GitHub Pages at lukashondrich.github.io.
Rebuilt from Google Sites with a custom static site.

## Design
- **Theme**: Light cream/off-white (`#FAF9F6`), minimal & clean
- **Font**: Inter (sans-serif), 15px base, line-height 1.7
- **Colors**: `--text: #1a1a1a`, `--text-secondary: #555`, `--accent: #3a6b8a`
- **Layout**: Max-width 700px content card, sticky semi-transparent nav, responsive hamburger menu at 640px
- **Background**: Live Bohemian eigenvalue particle animation on all pages
- **Content card**: Solid cream (`#FAF9F6`) with `border-radius: 6px`, flat (no shadow/border)
- **Nav**: Semi-transparent (`rgba(250, 249, 246, 0.85)`) — particles visible behind
- **Footer**: Solid cream, full-width

## File Structure
```
/
├── index.html              # Home — photo, bio, CV download, social links (merged Home + About)
├── collaboration.html      # 3 projects: Open Working Hours, Tinge, Level Ethics
├── publications.html       # 5 publications + Google Scholar link
├── contact.html            # Email + social icons (centered, icon-only)
├── about.html              # Redirect → / (kept for old bookmarks)
├── dphil-proposal.html     # Embedded PDF (unlisted — not in nav, linked from home)
├── css/style.css           # All styles
├── js/
│   ├── particles.js        # Particle background system (self-contained IIFE)
│   └── eigen-worker.js     # Web Worker for live eigenvalue computation
├── assets/
│   ├── lukashondrich.png   # Talk photo (hero image)
│   ├── Lukas_Hondrich_CV-57-1.pdf
│   ├── DPhil_Proposal.pdf
│   ├── owh/                # Open Working Hours screenshots (3 PNGs)
│   └── tinge/              # Tinge screenshots (2 PNGs)
├── .gitignore
└── CLAUDE.md
```

## Navigation
Home | Collaboration | Publications | Contact

## Particle Background — INTEGRATED
### Approach: Bohemian matrix eigenvalues
Based on Lukas's research repo: github.com/lukashondrich/sampling_bohemian_matrices

**How it works:**
- Web Worker (`js/eigen-worker.js`) computes 5×5 complex matrix eigenvalues live
- 3 matrices interpolated in a cycle (matrix_0 → matrix_1 → matrix_2 → repeat)
- Two diagonal entries perturbed with random unit-circle samples
- Eigenvalue positions become dot coordinates on screen
- Each dot has individual lifecycle: fade in → hold → fade out → die
- New dots spawn at current interpolation alpha — shape slowly morphs
- Zero data download, all computed in browser
- `js/particles.js` creates a fixed fullscreen canvas (`z-index: 0`) behind all content

**Integration:**
- Canvas is inserted as first child of `<body>` by `particles.js`
- All pages load `<script src="js/particles.js"></script>` before `</body>`
- Content card (`<main>`) has solid background, sits above canvas (`z-index: 1`)
- Nav is semi-transparent so particles bleed through

**Current tuned parameters:**
```
dotSize: 0.3, dotSizeVariance: 0.9
dotColor: [150, 125, 115], dotOpacityMax: 0.99
maxParticles: 80000 (mobile: 20000)
lifetimeMin: 12, lifetimeMax: 27
fadeInRatio: 0.12, fadeOutRatio: 0.2
initialBatch: 15000 (mobile: 4000), tickleBatch: 1000 (mobile: 300), tickleInterval: 100ms
zoom: 4, cycleDuration: 180s
```

**Practical limits (don't exceed):**
- maxParticles: ~100,000 (canvas rendering limit)
- initialBatch: ~20,000 (Worker compute time ~5s)
- tickleBatch: ~1000 per 100ms tick

## External Links
- GitHub: https://github.com/lukashondrich
- LinkedIn: https://www.linkedin.com/in/lukas-hondrich-12653314b/
- Google Scholar: https://scholar.google.com/citations?user=15kprDEAAAAJ&hl=de
- Email: lukashondrich@gmail.com / lukashondrich@googlemail.com
- Open Working Hours: https://www.openworkinghours.org/
- Tinge: https://tingefrontend-production.up.railway.app/
- Level Ethics: https://levelethics.streamlit.app/

## Local Development
Start a no-cache local server:
```bash
cd /Users/user01/personal_website/lukashondrich.github.io
python3 -c "
from http.server import HTTPServer, SimpleHTTPRequestHandler
class H(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
HTTPServer(('', 8000), H).serve_forever()
"
```
Then visit http://localhost:8000
