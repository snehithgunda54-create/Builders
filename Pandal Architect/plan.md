# Pandal Architect — Project Plan & Visual Theme

## 1. Visual Theme Specification: "Midnight Marigold & Royal Terracotta Blueprint"

- **Art Direction**:
  A neo-traditional festival blueprint aesthetic combining royal Indian architectural drafting with warm festive celebration vibes. The visual style features crisp glowing geometric alignment grids, polished brass-trimmed frosted glass panels, warm ambient lamp blooms, intricately patterned rangoli borders, and layered procedural canvas backgrounds (monsoon evening skylines, festive torans, floating fairy lanterns, and silhouetted temple architectures). Every placed structural item (wood pillars, bamboo scaffolding, fabric/flower canopies, brass lights) is rendered procedurally via Canvas vector geometry with rich tactile details, ambient shadows, and festive illumination without external bitmap dependencies.

- **Color Palette**:
  - **Midnight Royal Blue (Background & Atmosphere)**: `#0B1021`, `#141D3B`, `#1F2B56`
  - **Marigold Festive Gold (Primary Accent & Highlights)**: `#F59E0B`, `#FBBF24`, `#FDE68A`
  - **Terracotta & Vermilion (Structural & Alert Elements)**: `#C2410C`, `#EA580C`, `#EF4444`
  - **Sacred Lotus Pink & Coral (Decorative Accents)**: `#EC4899`, `#F472B6`, `#FDA4AF`
  - **Vibrant Eco Emerald (Eco & Positive Balance)**: `#059669`, `#10B981`, `#34D399`
  - **Warm Ivory & Parchment (Text & Card Surfaces)**: `#FDFBF7`, `#FEF3C7`, `#E2E8F0`
  - **Gilded Brass Trims & Borders**: `#D97706`, `#B45309`, `#FCD34D`

- **Typography**:
  - **Headings / Brand**: `'Outfit'`, with fallback `system-ui, -apple-system, sans-serif` (Festive, geometric, modern structural elegance).
  - **UI Labels & Data**: `'Outfit'`, with fallback `system-ui, -apple-system, sans-serif` (High readability, tabular numbers for timers and budget counters).

---

## 2. Phase Plan & Acceptance Checklists

### Phase 0 — Scaffold + Theme
- [x] Create exact project directory structure (`index.html`, `css/styles.css`, `js/config.js`, `js/game.js`, `js/level.js`, `js/item.js`, `js/itemManager.js`, `js/budget.js`, `js/stability.js`, `js/decoration.js`, `js/eco.js`, `js/renderer.js`, `js/input.js`, `js/ui.js`, `js/storage.js`, `js/audio.js`, `README.md`).
- [x] Write `index.html` shell with all screen containers and HUD markup (Home, Level Select, Playing HUD & canvas, Pause, Game Over, Level Complete, Settings, Statistics, Help).
- [x] Write `css/styles.css` foundation with the Midnight Marigold design tokens, responsive layout, glassmorphic panels, and typography.
- [x] Write `js/config.js` containing all exact game balance constants, item stats, level templates (Levels 1–5), difficulty presets (Easy, Medium, Hard), and state enums.
- [x] Write `README.md` skeleton covering title, run instructions, controls, project structure, and balance tuning.
- [x] Record chosen visual theme and acceptance checklist in `plan.md`.
- [x] Acceptance: All files exist in correct structure, config contains all required values, static page opens cleanly in browser without errors.

### Phase 1 — Core Loop: State Machine + Grid + Basic Placement
- [x] Implement robust state machine in `js/game.js` (`MENU`, `LEVEL_SELECT`, `PLAYING`, `PAUSED`, `GAME_OVER`, `TRANSITION`, `LEVEL_COMPLETE`).
- [x] Implement responsive 8×6 canvas grid in `js/renderer.js` supporting high-DPI scaling.
- [x] Implement toolbar UI with all item selector buttons and responsive placement controls.
- [x] Implement basic placement logic in `js/itemManager.js` and `js/budget.js` (click to select, click cell to place, instant budget deduction).
- [x] Implement item removal (right-click / Shift+click) with 50% refund and `removalsCount` tracking.
- [x] Implement insufficient budget error feedback / invalid placement indicators.
- [x] Implement Pause button opening PAUSED screen and Resume returning to PLAYING.
- [x] Apply full visual theme (colors, fonts, button styling, hover states) across all active views.
- [x] Acceptance: Navigate MENU → LEVEL_SELECT → PLAYING; grid renders and scales; items can be placed and removed with 50% refund; budget tracks accurately; insufficient budget shows error; pause/resume works.

### Phase 2 — Stats, Hazards, Collapse, and Game Over
- [x] Wire real-time stats calculation (`Stability`, `Decoration`, `Eco`, `CrowdSafety`) on item place and remove.
- [x] Implement hazard logic system in `js/level.js`:
  - Level 1: No hazards.
  - Level 2: Rain hazard at t=40s reducing Stability by 1/s unless Canopy ≥ 1.
  - Level 3: Crowd pressure reducing Decoration by 0.5/s unless Exit Signs ≥ 2.
  - Level 4: Wind gusts every 10s for 3s reducing Stability by 3 unless Pillars ≥ 4; Eco < 0 penalty.
  - Level 5: Combined hazards (Rain t=30s, Wind t=20s, Crowd t=10s).
- [x] Implement structural collapse logic: Stability ≤ 0 triggers `TRANSITION` (70ms freeze + screen shake + sound trigger) → `GAME_OVER`.
- [x] Implement level countdown timer and time-up condition → `GAME_OVER`.
- [x] Implement `GAME_OVER` screen detailing cause of defeat (Collapse vs Time-up), current level, and incrementing attempt counter.
- [x] Acceptance: Stats bars update accurately; rain, crowd, and wind hazards apply correct penalties under level conditions; Stability ≤ 0 collapses the pandal with screen shake; time-up triggers game over; attempts counter increments; 0 console errors.

### Phase 3 — Level Completion, Scoring, and Screens
- [x] Implement "Finish" button and target evaluation logic (`Stability`, `Decoration`, and `CrowdSafety` target thresholds).
- [x] Implement exact scoring formula: `baseScore = Stability% + Decoration% + CrowdSafety%`, `ecoBonus` (+10% if Eco ≥ threshold), `overtimePenalty`.
- [x] Implement star calculation:
  - 1 Star: Level passed (targets met).
  - 2 Stars: Level passed + Eco bonus earned.
  - 3 Stars: Level passed + Eco bonus + 0 items removed.
- [x] Implement `LEVEL_COMPLETE` screen displaying score, stars earned, Eco bonus summary, and removals count.
- [x] Complete all interactive screen transitions: Home, Level Select (with lock states & star badges), Playing, Pause, Game Over, Level Complete, Settings, Statistics, and Help.
- [x] Acceptance: Meeting targets and finishing awards correct stars and score; all screen navigation buttons function seamlessly; Level Select accurately reflects completion status; Settings and Help screens are fully functional.

### Phase 4 — Persistence, Achievements, Audio, Particles
- [x] Implement `localStorage` save/load under keys `pandal_architect_save` and `pandal_architect_settings`.
- [x] Implement strict schema validation on load (finite non-negative numbers, valid difficulty keys, level index ranges) with legacy save migration to Medium tier.
- [x] Implement achievement tracking system (e.g., First Pandal, Eco Master, Architect Supreme).
- [x] Implement procedural WebAudio engine in `js/audio.js` (synthesized placement clicks, removal thuds, insufficient budget buzzer, hazard sirens, structural collapse rumble, victory fanfares, gentle ambient festival drone).
- [x] Implement audio gesture unlock and graceful silent fallback if WebAudio is unavailable.
- [x] Implement procedural particle effects on Canvas for item placement sparks, hazard alerts, collapse debris, and victory confetti (respecting reduced motion).
- [x] Acceptance: Progress, high scores, and settings persist across page reloads; corrupted/missing saves recover gracefully; achievements trigger on conditions; all procedural audio effects and particles execute cleanly.

### Phase 5 — Difficulty Tiers
- [x] Implement `CONFIG.DIFFICULTIES` presets (Easy: +20% Budget, +20s Time, -10 Targets, -30% Hazard intensity; Medium: standard; Hard: -15% Budget, -15s Time, +10 Targets, +30% Hazard intensity, +2 Eco threshold).
- [x] Implement `applyDifficulty()` overlaying values onto active configuration.
- [x] Implement Home screen difficulty segmented control.
- [x] Implement per-difficulty high scores and star tracking in `Statistics` screen and `Level Select`.
- [x] Display active difficulty badge in the Playing HUD.
- [x] Acceptance: Switching difficulty alters budget, time, targets, and hazard severity accurately; statistics separate records by difficulty tier; difficulty badge visible in HUD.

### Phase 6 — Polish, Responsiveness, Accessibility
- [x] Implement fully responsive mobile layout with scalable canvas viewport and adaptive bottom toolbar.
- [x] Add accessible keyboard navigation (1–6 item slots, Space to place, Esc to pause, F to finish) and visible focus rings.
- [x] Implement automatic game pause on tab blur / window hide event.
- [x] Implement `reducedMotion` accessibility toggle (disables canvas shake, smooths transitions).
- [x] Complete `README.md` with gameplay rules, architecture summary, controls guide, and balancing tables.
- [x] Perform comprehensive UI/UX visual theme consistency pass across all dialogs, tooltips, and canvas assets.
- [x] Acceptance: Responsive and touch-friendly on mobile; keyboard controls operational; auto-pause triggers reliably on tab switch; reduced motion removes screen shake; README is comprehensive and accurate.

### Phase 7 — AUDIT (Report Only)
- [x] Perform complete end-to-end playthrough on Easy, Medium, and Hard across Levels 1–5.
- [x] Verify every state transition and edge case (quick retry, pause/resume, rapid placement, boundary clicks).
- [x] Audit scoring, star calculations, and hazard interval timings against spec.
- [x] Audit storage validation, migrations, and settings persistence.
- [x] Verify audio mute/volume controls and reduced-motion paths.
- [x] Confirm original visual theme fidelity and absence of external or copyrighted assets.
- [x] Output a structured severity-ordered report (`Critical`, `High`, `Medium`, `Low`) with `file:line` references.
- [x] Acceptance: Complete audit report delivered without making unapproved code modifications.
