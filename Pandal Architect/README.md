# Pandal Architect 🪔

**Pandal Architect** is a single-player tactical festival construction strategy game. Step into the shoes of a Master Pandal Architect during the Ganesha festival to design and build majestic temporary sanctuaries under strict budget, time, structural stability, and ecological guidelines.

---

## 🎨 Visual Theme
**"Midnight Marigold & Royal Terracotta Blueprint"**
- Deep Royal Indigo night skies and architectural blueprint drafting grids
- Glowing Marigold gold accents, festive fairy lanterns, and lotus petal ornaments
- Handcrafted procedural vector items (Wood columns, bamboo scaffolding, fabric torans, stone platforms)
- 100% original generative WebAudio soundscape with procedural synthesis (zero external copyright assets)

---

## 🚀 How to Run
This project is built purely with vanilla HTML5, CSS3, and JavaScript (ES Modules). No build step or package installations required.

1. Start a local HTTP server in the project root:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```
2. Open your browser and navigate to `http://localhost:8000` (or the port indicated).

---

## 🎮 Controls & Shortcuts

| Action | Control |
| :--- | :--- |
| **Select Item Slot** | `1` – `9` Keys or Click in Bottom Toolbar |
| **Place Item** | Left-Click on Grid Cell / `Space` on Hovered Cell |
| **Remove Item** | Right-Click or `Shift + Left-Click` (50% Cost Refund) |
| **Finish Build** | `F` Key or "Finish Build" HUD Button |
| **Pause / Resume** | `Esc` Key or Pause Icon in HUD |

---

## 🏗️ Sanctuary Construction Items

| Item | Cost | Stability | Decoration | Eco | Crowd Safety | Time to Place |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Pillar (Wood)** | ₹60 | +20 | 0 | +2 | 0 | 0.4s |
| **Pillar (Bamboo)** | ₹40 | +15 | 0 | +3 | 0 | 0.5s |
| **Base Platform** | ₹120 | +35 | 0 | +1 | 0 | 0.6s |
| **String Lights** | ₹30 | 0* | +15 | 0 | 0 | 0.3s |
| **Flowers / Garlands** | ₹20 | 0 | +12 | +1 | 0 | 0.25s |
| **Rangoli Tiles** | ₹25 | 0 | +18 | +2 | 0 | 0.35s |
| **Cloth Banner** | ₹35 | 0 | +20 | +3 | 0 | 0.3s |
| **Plastic Banner** | ₹25 | 0 | +18 | −2 | 0 | 0.3s |
| **Canopy** | ₹80 | +10 | 0 | +1 | 0 | 0.5s |
| **Exit Sign** | ₹15 | 0 | 0 | 0 | +10 | 0.2s |

*\*Note: String lights apply a -2 stability penalty for each light beyond 3.*

---

## 🌧️ Environmental Hazards

- **Monsoon Rain (Level 2 & 5):** Rain degrades stability every second unless sheltered by overhead **Canopies**.
- **Crowd Surges (Level 3 & 5):** High pedestrian congestion slowly erodes decoration unless at least 2 illuminated **Exit Signs** are installed.
- **Wind Gusts (Level 4 & 5):** Sudden wind squalls batter the structure every 10s unless secured with at least 4 sturdy **Pillars**.

---

## 📁 Project Architecture
```
/
  index.html          # Application structure and all modal/HUD views
  css/
    styles.css        # Theme design tokens, responsive layout, glassmorphism
  js/
    config.js         # Exact balance values, items, levels, difficulties
    game.js           # Core state machine and game loop orchestrator
    level.js          # Level configuration, scoring formula, hazard timers
    item.js           # Item instance representation
    itemManager.js    # 8x6 Grid placement, removal, and queries
    budget.js         # Financial transactions and 50% refund handling
    stability.js      # Structural stability tracker and collapse detector
    decoration.js     # Aesthetic rating calculation
    eco.js            # Eco-friendliness tracker and bonus evaluator
    renderer.js       # High-DPI Canvas graphics, procedural backdrops, FX
    input.js          # Mouse, touch, and keyboard shortcut handler
    ui.js             # HUD, screen routing, and dialog manager
    storage.js        # LocalStorage persistence, validation, migrations
    audio.js          # Generative procedural WebAudio synthesizer
  plan.md             # Visual theme definition and phase acceptance tracking
  README.md           # Game documentation and manual
```
