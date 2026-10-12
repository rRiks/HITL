# 🎮 HITL Jenga Frontend (React 19 + Vite + Three.js)

The interactive dashboard and 3D WebGL simulator for the **Human-in-the-Loop (HITL) Jenga: AI-Paced Development** workshop game.

---

## 🏗️ Architecture & Component Hierarchy

- **`App.jsx`**: Main state controller, backend synchronization, modal orchestration, and catastrophic collapse event sequencing.
- **`components/Virtual3DTower.jsx`**:
  - Three.js WebGL canvas rendering the 18-tier (54-block) enterprise architecture tower.
  - OrbitControls with tuned bounds (360° horizontal orbit, restricted vertical angle).
  - Realistic materials (MeshStandardMaterial with roughness, metalness, and subtle colored emissives).
  - Cybernetic floor pedestal with illuminated grid markings and particle starfield.
  - **Animated Block Extraction**: Smooth slide-out along the block's orientation axis, gravity drop, and tumble onto the pedestal floor.
  - **Dynamic Wobble**: Physical oscillation and angular tilt calculated from tower tension stress.
  - **3D Catastrophic Collapse Simulation**: Particle explosion physics where all 54 blocks pop upward, explode outward with gravity ($-34\,\text{m/s}^2$), bounce on the pedestal, and scatter across the floor with pulsing red hazard lights.
- **`components/StageArena.jsx`**:
  - Split-pane interface displaying the current Salesforce stage briefing, AI prompt & output diff, and the 4 decision action buttons.
- **`components/GameOverModal.jsx`**:
  - Translucent glassmorphic post-mortem incident report.
  - Displays the exact root cause exception (Governor limits, security bypass, CPU timeout, etc.) and workshop debrief lessons.
  - Contains **"Replay 3D Collapse 💥"** and **"Inspect 3D Tower Rubble 🔍"** toggle to inspect the fallen blocks in full 3D.
- **`components/VictoryModal.jsx`**:
  - Celebratory debrief when completing all 11 stages.
  - Displays final score, surviving subsystems, and enterprise readiness badge.
- **`components/DiceRollModal.jsx`**:
  - High-intensity dice roll popup with simulated probability wheel for the "Accept As-Is" decision.
- **`components/CustomPromptModal.jsx`**:
  - Interactive prompt input with clickable keyword chips customized for each stage.
- **`components/Navbar.jsx` & `LiveLeaderboardTicker.jsx`**:
  - Real-time 11-node circuit progression bar, 2-minute countdown timer, application health gauge, and live simulated workshop standings.
- **`hooks/useSound.js`**:
  - Zero-dependency procedural audio synthesizer built with the native Web Audio API (slide tones, dice ratchets, crash chords, heartbeat alerts).

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Production build verification
npm run build
```
