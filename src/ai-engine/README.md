# GridGuard AI — AI/ML Risk & Recommendation Engine

> **Module Owner:** Person 3 (AI/ML Engineer)  
> **Service Port:** `8001`  
> **Interface:** REST API (FastAPI)  
> **Execution:** Standalone Python microservice, callable by Express backend  

---

## 1. Architecture & Design Principles

The GridGuard AI Engine provides transparent, explainable risk scoring, asset failure prediction, asset criticality ranking, and actionable maintenance/crew pre-positioning recommendations.

Rather than treating risk as an opaque black box, the engine computes grounded, multi-factor scores based on IEEE/IEC transformer and switchgear standards.

### Core Formula

$$\text{Risk Score} = w_1 \cdot S_{\text{sensor}} + w_2 \cdot W_{\text{weather}} + w_3 \cdot H_{\text{incident}} + w_4 \cdot A_{\text{age}}$$

| Factor | Weight ($w_i$) | Driver | IEEE/IEC Grounding |
|---|---|---|---|
| **Sensor Health** | 0.35 | Top-oil temperature, vibration, partial discharge, dielectric oil quality, load ratio | IEEE C57.104, IEC 60599 |
| **Weather Exposure** | 0.30 | 72h storm probability, wind gusts (>60 km/h), precipitation (>30 mm) | Extreme weather vulnerability |
| **Historical Failures** | 0.20 | Incident frequency in past 18 months, recency decay (365d), customers affected | Weibull-decay reliability |
| **Age & Condition** | 0.15 | Asset age relative to 30-year lifespan, maintenance overdue index (>180d) | Asset lifecycle degradation |

All component scores are normalized to $[0.0, 1.0]$.

---

## 2. Risk Classification & Grid Impact

### Risk Categories
- **CRITICAL** ($\ge 0.75$): Immediate emergency maintenance required ($\le 12\text{ hours}$).
- **HIGH** ($0.50 - 0.74$): Priority inspection and preventative scheduling ($\le 48\text{ hours}$).
- **MEDIUM** ($0.25 - 0.49$): Routine monitoring; elevated watch status during storms.
- **LOW** ($< 0.25$): Normal operating parameters.

### Grid Impact Severity (1.0 – 10.0 scale)
Considers:
1. **Customers Served**: Scaled against 60,000 baseline.
2. **Voltage Level**: 400 kV (1.0), 220 kV (0.8), 132 kV (0.6), 66 kV (0.4), 33 kV (0.3).
3. **Asset Type**: Transformers (1.0), Substations (0.9), Breakers (0.6).
4. **Cascade Multiplier**: $1.0 + 0.3 \times \text{voltage factor}$.

### Asset Ranking Formula
$$\text{Combined Severity} = \text{Risk Score} \times \text{Grid Impact Severity}$$
Assets are sorted descending by Combined Severity to assign **Priority 1, 2, 3...** work order sequence.

---

## 3. Maintenance & Crew Pre-positioning

For every asset flagged as **HIGH** or **CRITICAL**, the engine produces an actionable work order:
- **Crew Specialization Mapping**:
  - Overheating $\rightarrow$ `transformer_cooling_specialist`
  - Oil contamination $\rightarrow$ `transformer_oil_specialist`
  - Partial discharge $\rightarrow$ `transformer_insulation_specialist`
  - Mechanism jam $\rightarrow$ `breaker_mechanic`
  - Storm damage $\rightarrow$ `substation_emergency_team`
- **Crew Sizing**: 4 technicians for CRITICAL, 3 for HIGH.
- **Staging Depots**: Geolocation lookup mapped to nearest operational base (`Central Metro Depot`, `Northern Service Center`, `Industrial Zone Depot`, etc.).
- **Deadlines**: 12 hours for CRITICAL, 48 hours for HIGH.
- **Estimated Downtime**: Domain-specific estimate (e.g. 8h oil overhaul, 4h cooling inspection).

---

## 4. API Endpoints

### `GET /health`
Verifies service health and current weight configuration.

### `GET /model/config`
Returns transparent weight configuration and IEEE sensor threshold parameters for explainability auditing.

### `POST /analyze/risk`
Main bulk analysis endpoint called by Express backend (`POST /api/risk/calculate`).

**Input:**
```json
{
  "assets": [...],
  "sensors": [...],
  "weather": [...],
  "incidents": [...]
}
```

**Output:**
```json
{
  "total_analyzed": 12,
  "risk_results": [
    {
      "asset_id": "TR-101",
      "risk_score": 0.824,
      "risk_level": "CRITICAL",
      "failure_probability_7d": 0.785,
      "grid_impact_severity": 8.8,
      "combined_severity": 7.25,
      "priority": 1,
      "component_scores": {
        "sensor_health": 0.85,
        "weather_exposure": 0.72,
        "historical_risk": 0.60,
        "age_condition": 0.55
      },
      "contributing_factors": [
        { "factor": "temperature", "value": 92.0, "status": "critical", "score": 0.84 },
        { "factor": "weather_forecast", "max_storm_prob": 0.85, "status": "severe_storm_incoming", "score": 0.72 }
      ]
    }
  ],
  "maintenance_recommendations": [
    {
      "asset_id": "TR-101",
      "priority": 1,
      "action": "EMERGENCY: Inspect cooling system, check oil circulation, and verify fan operation.",
      "crew_type": "transformer_cooling_specialist",
      "crew_size": 4,
      "staging_location": { "lat": 28.62, "lng": 77.21, "name": "Central Metro Depot" },
      "recommended_by": "2026-09-15T02:54:30Z",
      "estimated_downtime_hours": 4.0,
      "justification": "Risk assessment: CRITICAL (0.82/1.00). Temperature at 92.0°C (critical). Severe weather forecast: 85% storm probability. Serves 45,000 customers."
    }
  ]
}
```

### `POST /analyze/single`
On-demand single asset simulation endpoint for interactive "what-if" scenario testing.

---

## 5. Running and Testing

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run Service
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### Run Test Suite
```bash
python test_ai_engine.py
```
All 9 unit and edge-case tests validate:
- Normal sensor baselines
- IEEE critical threshold trips
- Degraded oil and partial discharge escalation
- Missing sensor telemetry fallback
- Severe storm weather impacts
- Recurring incident recency and frequency
- Grid impact severity calculations
- End-to-end data fusion, ranking, and crew staging
