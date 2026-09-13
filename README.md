# ⚡ GridGuard AI: Power Outage Prediction & Grid Equipment Failure Advisor

> Proactive grid resilience and predictive maintenance powered by IBM Bob and watsonx.ai.

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | GridGuard AI |
| **Track** | AI |
| **Team Lead** | Harshil Thakkar — d25dit083@charusat.edu.in |
| **Members** | Priyal Rathod, Rutvik Jasani, Hetavi Suhagiya |

---

## 🎯 Problem Statement

Power transformer and substation failures cause catastrophic blackouts costing electric utilities upwards of **$1M+/hour** while impacting millions of citizens and critical infrastructure. 

Most electric utilities still rely on calendar-based maintenance cycles. Although installed IoT sensors continuously measure temperature, vibration, partial discharge, and oil quality, these early failure signatures are never synthesized with compounding severe weather forecasts and historical incident records in time to take preventative action.

---

## 💡 Solution

**GridGuard AI** is an intelligent grid reliability and failure prediction advisor built on **IBM Bob** and **watsonx.ai**.

The platform ingests real-time asset health telemetry, correlates it with live weather forecasts, and cross-references historical failure records. It forecasts outage-prone areas and at-risk equipment weeks in advance, calculates grid impact severity scores, and automatically generates prioritized work orders with optimal field crew pre-positioning plans before severe events occur.

---

## ✨ Key Features

- **Multi-Modal Telemetry & Weather Fusion:** Ingests and continuously correlates IoT sensor data (temperature, vibration, partial discharge, oil quality) with live weather forecasts and historical outage logs.
- **Predictive Equipment Failure Forecasting:** Detects subtle asset degradation signatures weeks in advance using machine learning anomaly models to pinpoint at-risk substations and transformers.
- **Grid Impact Severity Ranking:** Evaluates downline impact, customer density, and cascading risk to prioritize assets that represent the highest threat to grid stability.
- **Automated Maintenance & Crew Pre-Positioning:** Automatically generates prioritized maintenance tickets and suggests field crew staging locations prior to severe weather storms.
- **Interactive IBM Bob Grid Advisor:** Conversational AI advisor providing grid dispatchers and operations engineers with real-time risk alerts, root-cause explanations, and actionable mitigation playbooks.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python 3.11+, TypeScript |
| **Frameworks** | FastAPI, React / Vite, scikit-learn |
| **IBM Technologies** | IBM Bob, watsonx.ai, IBM Cloud Code Engine |
| **Databases** | PostgreSQL, TimescaleDB |
| **Other** | Docker, Open-Meteo API, GitHub Actions |

---

## 📁 Repository Structure

```
├── src/                  # All source code
├── docs/                 # Written documentation
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/                 # Demo artifacts
│   ├── screenshots/      # App screenshots
│   └── demo-video-link.txt  # Link to demo video
├── presentation/         # Slide deck
└── submission.yaml       # Structured submission metadata
```

---

## ⚡ How to Run

> **For complete details, see [`docs/setup-guide.md`](docs/setup-guide.md)**

```bash
# 1. Clone the repo
git clone https://github.com/harshil5506/bob-ai-hackathon-GridGaurdAI.git
cd bob-ai-hackathon-GridGaurdAI
# 2. Configure environment
cp src/.env.example src/.env
# Edit src/.env with your API keys (e.g. WATSONX_API_KEY, PROJECT_ID)
# 3. Install dependencies
# Backend:
cd src
pip install -r requirements.txt
# Frontend (if applicable):
# cd ../frontend && npm install
# 4. Run the project
uvicorn main:app --reload

```

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | [See demo/live-demo-url.txt](demo/live-demo-url.txt) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/slides.pdf](presentation/) |

---

## ⚠️ Known Limitations
Sensor Emulation: Asset health telemetry and weather feeds are generated using realistic utility distribution benchmarks; physical SCADA interfaces are simulated via REST endpoints.
Grid Topology Scope: Current prototype focuses on transmission and high-voltage substation transformer clusters rather than low-voltage residential distribution lines.
Crew Routing: Dispatch pre-positioning suggestions are cluster-based and do not yet integrate with live commercial traffic routing systems.

---

## 🏅 What We're Most Proud Of

The proactive fusion of multi-sensor degradation signals with hyper-local weather risk modeling, enabling grid operators to transition from reactive calendar schedules to predictive crew pre-positioning before costly outages occur.

---
