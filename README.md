# ECHOTRACE AI — Temporal Problem-Memory System

> *"Remember the problem. Recognize the pattern. Prevent the repeat."*

**ECHOTRACE AI** is a temporal problem-memory system designed for college campuses and shared public facilities. 

Ordinary campus ticketing systems treat every submission as an isolated complaint—collecting tickets in a silo and closing them when surface symptoms are cleared. **EchoTrace AI remembers previous problems, tracks what happened afterward, identifies potentially related recurring issues across time, and equips facility personnel with preventive action playbooks.**

---

## 🎯 The Core Scenario

Consider what happens in a typical university facility:
1. **Monday:** Someone reports water dripping from a ceiling tile outside Chemistry Lab 204 (`#OBS-2026-001`). Custodial places a bucket.
2. **Wednesday:** Another student reports an extremely slippery floor near the entrance to Lab 204 (`#OBS-2026-002`). Someone mops the slick tile.
3. **Friday:** A custodial worker logs that the floor is wet again outside Lab 204 (`#OBS-2026-003`).

In standard portals, these appear as three disconnected low-level complaints. **EchoTrace AI links them into an active 3-stage temporal pattern cluster (89%–91% correlation)**, explains the matching signals (shared physical coordinates, 48h temporal delta, overlapping fluid/slip indicators), provides an audit timeline, and generates a **Preventive Playbook** (subfloor moisture scan, overhead pipe borescope inspection) to solve the root cause before a student slip injury occurs.

> **Responsible AI Rule:** EchoTrace AI **never** automatically claims the leak caused the slippery floor without evidence. All connections are explicitly presented as *"AI-suggested — needs verification"* and require authorized human field confirmation.

---

## ✨ Key Features Built in this Prototype

### 1. Situational Dashboard
- **Live Metrics:** Total memory records, open problems, potentially recurring clusters, verified resolutions, and an active **Recurrence Risk Index**.
- **Active Recurrence Spotlight:** Prominently highlights active multi-incident sequences (such as the Curie Science Hall Lab 204 case) with direct "Inspect Incident Chain" drill-down.
- **Recent Campus Memory Stream:** Chronological feed of campus events with color-coded actor badges.
- **Category Distribution:** Real-time breakdown of issues across Plumbing, Life Safety, Electrical, HVAC, and Access Control.

### 2. Intelligent Problem Reporting with Live "Echo Scan"
- **Interactive Form:** Title, detailed description, category, building/zone, room/corridor, custom date/time, severity, and privacy-preserved reporter roles.
- **Real-Time Memory Preview:** As the user types their title or room number, EchoTrace AI runs live similarity comparisons against memory and renders an instant notification: *"EchoTrace Memory Match Detected (89% Confidence) — Similar historical observation found: #OBS-2026-001"*.
- **Demo Quick-Fill Presets:** One-click scenario buttons (Lab 204 Water Leak, Lab 204 Slippery Floor, Turing Breaker Buzz) for fast demo walkthroughs.

### 3. Problem Memory Explorer
- **Comprehensive Search & Filters:** Filter by keywords, room numbers, building, category, severity, status, or toggle **"Recurring Only"**.
- **Observation Cards:** Show problem IDs, relative timestamps, location metadata, and recurrence alert tags.

### 4. Multi-Signal Explainability Engine (`similarityEngine.ts`)
- Computes deterministic multi-factor correlation scores:
  - **Physical Proximity (35%):** Exact building matching + room/corridor token overlap.
  - **Temporal Sequence (25%):** Temporal decay window prioritizing 12h–72h active sequences.
  - **Symptom & Keyword Overlap (30%):** Semantic tokenizer analyzing symptom clusters (`water`, `leak`, `puddle`, `slip`, `breaker`, `spark`, etc.).
  - **Cross-Category Alignment (10%):** Recognizes interdisciplinary dependencies (e.g., plumbing leaks producing secondary slip safety hazards).
- **Human-in-the-Loop Controls:** Facility inspectors can mark suggestions as **Verified Related** (with custom inspection notes) or **Rejected Unrelated**, creating a tamper-evident audit record.

### 5. Campus Chronological Timeline
- Full audit history across all campus facilities.
- Clearly distinguishes between **Report Filed** (cyan), **AI Pattern Detected** (indigo), **Human Field Verification** (amber), **Maintenance Actions** (emerald), and **Problem Resolution** (green).

### 6. Prevention Playbooks (`playbookEngine.ts`)
- Generates categorized action items across 3 phases:
  - **Immediate Safety Containment** (e.g., hazard cones, absorbent water socks)
  - **Root-Cause Diagnostics** (e.g., ceiling cavity borescope inspection, subfloor moisture metering)
  - **Recurrence Prevention** (e.g., pipe coupling seal, IoT LoRaWAN moisture puck installation)
- Interactive checkboxes allowing maintenance technicians to log progress and assign completed actions.

### 7. Pattern Clusters View
- Aggregates related observations into macro incident chains for campus administrators and facility directors.

### 8. Responsible AI Charter & Transparency Modal
- Explains our local heuristic approach, privacy-preserving role assignment (no PII), and strict ethical rules against automated causal claims.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | Strict type safety, clean component hierarchy |
| **Bundler & Dev Server** | Vite 8 | Instant Hot Module Replacement (HMR) & fast builds |
| **Styling** | Custom Vanilla CSS Design System | Deep slate theme, CSS custom properties, accessible contrast, responsive grid |
| **Icons** | `lucide-react` | Professional facility and status iconography |
| **Persistence** | Browser `localStorage` | Resilient client-side storage with seed data & reset capability |
| **Intelligence Engine** | Deterministic Heuristic Correlation Engine v1.2 | Multi-signal temporal & semantic similarity matching |

---

## 🚀 Running the Application Locally

### Prerequisites
- Node.js (v18 or higher; tested on Node v24)
- npm

### Installation & Startup

```powershell
# 1. Clone or navigate to the repository
cd EchoTrace-ai

# 2. Install dependencies
# (On Windows PowerShell where script execution may be restricted, use npm.cmd)
npm.cmd install

# 3. Start the local Vite development server
npm.cmd run dev
```

The application will be accessible at: **`http://localhost:5173/`**

### Production Build
To test the production compilation:
```powershell
npm.cmd run build
```
The build produces a clean, minified bundle under `dist/` (total size ~330 KB gzipped, well under the 10 MB budget).

---

## 🔍 Genuinely Functional vs. Demo Logic

In accordance with our **Responsible AI standard**, we explicitly state what is fully operational and what represents synthetic demo scaffolding:

| Component | Status | How it Works |
| :--- | :--- | :--- |
| **Multi-Signal Similarity Math** | **Genuinely Works** | Real deterministic heuristic calculating physical token overlap, temporal hour delta, keyword intersection, and cross-category weights in `similarityEngine.ts`. |
| **Live Echo Scan Preview** | **Genuinely Works** | Evaluates input dynamically on every keystroke in the reporting modal against the entire active observation memory. |
| **Human Verification Workflow** | **Genuinely Works** | Clicking "Verify Related" or "Reject Unrelated" updates state, persists to `localStorage`, and appends an immutable verification event to the timeline. |
| **Playbook Task Checklist** | **Genuinely Works** | Interactive checkboxes persist completion states, timestamp, and technician name in memory. |
| **Search & Multi-Filters** | **Genuinely Works** | Real-time text search and multi-attribute filtering across category, building, severity, status, and recurrence flags. |
| **Cloud LLM API Calls** | **Transparent Local Logic** | EchoTrace AI **does not make external cloud API calls** in this prototype. We do not pretend a remote cloud LLM was called. All synthesis runs locally and deterministically. |
| **Initial Seed Data** | **Synthetic Demo Data** | Initial observations (`#OBS-2026-001` to `#OBS-2026-006`) are pre-populated synthetic examples designed to demonstrate multi-day campus recurrence patterns. |

---

## Limitations

While EchoTrace AI provides an interactive, fully functional prototype of temporal recurrence clustering and preventive playbooks, the following limitations genuinely apply to the current implementation:

1. **Constraints of Related-Report Detection:**
   - The similarity engine (`similarityEngine.ts`) uses deterministic heuristics (spatial string tokenization, temporal decay math, and predefined symptom dictionary sets) rather than continuous deep-learning vector embeddings or large language models.
   - Variations in spelling, terminology outside the curated symptom keyword clusters, or non-English submissions may yield lower match confidence or missed correlations.

2. **Mandatory Human Verification (No Automated Causal Claims):**
   - The system identifies potential **correlational links**, not proven physical causes.
   - A high confidence score (e.g., 91%) indicates that two observations share strong spatial, temporal, and symptomatic signals, but it does not prove that one incident caused the other.
   - Physical field inspection and human verification remain strictly required before initiating structural or costly facility repairs.

3. **Demo-Only Functionality & Synthetic Data:**
   - The initial observations (`#OBS-2026-001` through `#OBS-2026-006`) and the modal quick-fill buttons are pre-populated synthetic data designed to demonstrate campus recurrence patterns during evaluation.
   - In a production deployment, these would be replaced by authenticated incident feeds from an institutional work-order system.

4. **Client-Side Storage Scope:**
   - Persistence is implemented entirely in the browser's `localStorage` (`echotrace_observations` and `echotrace_timeline`).
   - There is no centralized multi-tenant database, backend server, or cross-device real-time sync. Changes made in one browser session are contained within that local browser.

5. **Simulated Sensor & Hardware Integration:**
   - Playbook action items mention physical equipment and diagnostics (e.g., IoT LoRaWAN moisture pucks, borescope cameras, subfloor moisture meters), but the application does not connect to physical telemetry hardware or campus Building Management Systems (BMS). All checklist updates are recorded manually.

---

## 🧭 Short Demo Walkthrough for Judges

1. **Observe the Dashboard:**
   - Look at the top metric cards showing **6 Total Records**, **4 Open Problems**, and **3 Potentially Recurring Issues**.
   - Notice the **Active Recurrence Pattern Spotlight** tracking Curie Science Hall Lab 204.
2. **Inspect the Lab 204 Chain:**
   - Click **"Inspect Incident Chain"** in the spotlight banner.
   - In the modal, review the **AI-Suggested Echoes** tab. Observe the 89% and 91% confidence scores and inspect the individual signal breakdown bars (Location, Temporal, Symptom Overlap, Category Alignment).
   - Click **"Verify Related"** to confirm the link between the ceiling leak and the slippery floor.
3. **Execute Prevention Playbook Tasks:**
   - Switch to the **"Prevention Playbook"** tab.
   - Check off *"Immediate Hazard Containment"* or *"Overhead & Riser Borescope Inspection"*.
   - Switch to the **"Chronological Timeline"** tab to see your action logged in real time.
4. **Test Real-Time Problem Reporting:**
   - Click **"Report Problem"** in the top navigation.
   - Click the **"Lab 204 Water Leak"** demo quick-fill button, or type *"Water on tile near Lab 204"*.
   - Watch the cyan **"Real-Time EchoTrace Memory Match Detected"** banner pop up automatically before submitting!
   - Click **"Submit to Problem Memory"**.
5. **Explore Pattern Clusters & Global Timeline:**
   - Click the **"Pattern Clusters"** tab to view the grouped multi-stage incident chains.
   - Click the **"Timeline"** tab to inspect campus-wide history filtered by Reports, AI Detections, or Human Verifications.
6. **Review AI Charter:**
   - Click **"AI Principles"** in the top right to view our transparency guidelines and privacy commitments.
