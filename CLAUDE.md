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
- **Layout**: Max-width 700px, sticky nav, responsive hamburger menu at 640px
- **Content**: Ported verbatim from the original Google Sites page

## File Structure
```
/
├── index.html              # Home — hero intro + social links (GitHub, Email, LinkedIn)
├── about.html              # Bio, background, CV download, social links
├── collaboration.html      # 3 projects: Open Working Hours, Tinge, Level Ethics
├── publications.html       # 5 publications + Google Scholar link
├── dphil-proposal.html     # Embedded PDF of DPhil proposal
├── contact.html            # Email + social icons (centered, icon-only)
├── css/style.css           # All styles
├── assets/
│   ├── Lukas_Hondrich_CV-57-1.pdf
│   ├── DPhil_Proposal.pdf
│   ├── owh/                # Open Working Hours screenshots (3 PNGs)
│   └── tinge/              # Tinge screenshots (2 PNGs)
├── experiments/            # Phase 2 particle system prototypes
│   ├── eigen-worker.js     # Web Worker for live eigenvalue computation
│   ├── still-9-bohemian-live.html  # CHOSEN prototype — live Bohemian eigenvalues
│   ├── still-1-perlin.html         # Experiment: Perlin noise blobs
│   ├── still-2-fractal.html        # Experiment: Layered fractal noise
│   ├── still-3-tendrils.html       # Experiment: Flowing tendrils
│   ├── still-4-splatter.html       # Experiment: Clustered splatter
│   ├── still-5-voronoi.html        # Experiment: Voronoi cells
│   ├── still-6-cloud.html          # Experiment: Gradient cloud
│   ├── still-7-bohemian.html       # Experiment: Static Bohemian eigenvalues
│   └── still-8-bohemian-animated.html  # Experiment: Pre-computed animation
└── CLAUDE.md
```

## Phase 1: Static Site — COMPLETE
All 6 pages built with content matching the original Google Sites.
Nav, responsive layout, social links, PDF embeds all working.

## Phase 2: Particle Background — IN PROGRESS
### Chosen approach: Bohemian matrix eigenvalues (still-9-bohemian-live.html)
Based on Lukas's research repo: github.com/lukashondrich/sampling_bohemian_matrices

**How it works:**
- Web Worker (`eigen-worker.js`) computes 5×5 complex matrix eigenvalues live
- 3 matrices interpolated in a cycle (matrix_0 → matrix_1 → matrix_2 → repeat)
- Two diagonal entries perturbed with random unit-circle samples
- Eigenvalue positions become dot coordinates on screen
- Each dot has individual lifecycle: fade in → hold → fade out → die
- New dots spawn at current interpolation alpha — shape slowly morphs
- Zero data download, all computed in browser

**Current tuned parameters (user-adjusted):**
```
dotSize: 0.3, dotSizeVariance: 0.9
dotColor: [150, 125, 115], dotOpacityMax: 0.99
maxParticles: 80000, lifetimeMin: 12, lifetimeMax: 27
fadeInRatio: 0.12, fadeOutRatio: 0.2
initialBatch: 15000, tickleBatch: 1000, tickleInterval: 100ms
zoom: 4, cycleDuration: 180s
```

**Practical limits (don't exceed):**
- maxParticles: ~100,000 (canvas rendering limit)
- initialBatch: ~20,000 (Worker compute time ~5s)
- tickleBatch: ~1000 per 100ms tick

### Next steps
1. Integrate particle canvas into the main site pages as a background layer
2. Add solid background behind text content so readability is preserved
3. Test on mobile devices
4. Clean up experiments/ folder (remove unused stills)
5. Content improvements (user to decide later)

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
