"""
GridGuard AI — Risk Scoring Model
Weighted multi-factor explainable risk scoring for grid assets.

Formula:
  risk_score = w1 * sensor_health_score
             + w2 * weather_exposure_score
             + w3 * historical_failure_score
             + w4 * asset_age_score

All scores are normalized to [0, 1] where 1 = highest risk.
"""

import math
from datetime import datetime, date, timedelta
from typing import Optional


# ── Weight Configuration ──────────────────────────────────────────────────────
WEIGHTS = {
    "sensor_health": 0.35,
    "weather_exposure": 0.30,
    "historical_failure": 0.20,
    "age_condition": 0.15,
}

# ── Sensor Thresholds (based on IEEE/IEC transformer standards) ───────────────
SENSOR_THRESHOLDS = {
    "temperature_c": {"normal": 65, "warning": 75, "critical": 85, "max": 105},
    "vibration_mm_s": {"normal": 2.5, "warning": 4.0, "critical": 5.5, "max": 8.0},
    "partial_discharge_pc": {"normal": 50, "warning": 100, "critical": 200, "max": 500},
    "oil_quality_index": {"good": 0.80, "warning": 0.60, "critical": 0.40, "min": 0.0},
    "load_pct": {"normal": 70, "warning": 85, "critical": 95, "max": 120},
}


def compute_sensor_health_score(sensors: dict) -> tuple[float, list[dict]]:
    """
    Compute a composite sensor health score from latest readings.
    Returns (score, contributing_factors) where score ∈ [0, 1].
    Higher score = worse health = higher risk.
    """
    if not sensors:
        return 0.5, [{"factor": "sensors", "status": "no_data", "weight": 1.0}]

    factors = []
    scores = []

    # Temperature risk
    temp = sensors.get("temperature_c")
    if temp is not None:
        temp = float(temp)
        t = SENSOR_THRESHOLDS["temperature_c"]
        if temp >= t["critical"]:
            score = 0.8 + 0.2 * min((temp - t["critical"]) / (t["max"] - t["critical"]), 1.0)
            status = "critical"
        elif temp >= t["warning"]:
            score = 0.5 + 0.3 * (temp - t["warning"]) / (t["critical"] - t["warning"])
            status = "above_threshold"
        elif temp >= t["normal"]:
            score = 0.2 + 0.3 * (temp - t["normal"]) / (t["warning"] - t["normal"])
            status = "elevated"
        else:
            score = 0.2 * temp / t["normal"]
            status = "normal"
        scores.append(score)
        factors.append({"factor": "temperature", "value": temp, "status": status, "score": round(score, 3)})

    # Vibration risk
    vib = sensors.get("vibration_mm_s")
    if vib is not None:
        vib = float(vib)
        t = SENSOR_THRESHOLDS["vibration_mm_s"]
        if vib >= t["critical"]:
            score = 0.8 + 0.2 * min((vib - t["critical"]) / (t["max"] - t["critical"]), 1.0)
            status = "critical"
        elif vib >= t["warning"]:
            score = 0.5 + 0.3 * (vib - t["warning"]) / (t["critical"] - t["warning"])
            status = "above_threshold"
        else:
            score = 0.5 * vib / t["warning"]
            status = "normal"
        scores.append(score)
        factors.append({"factor": "vibration", "value": vib, "status": status, "score": round(score, 3)})

    # Partial discharge risk
    pd = sensors.get("partial_discharge_pc")
    if pd is not None:
        pd = float(pd)
        t = SENSOR_THRESHOLDS["partial_discharge_pc"]
        if pd >= t["critical"]:
            score = 0.8 + 0.2 * min((pd - t["critical"]) / (t["max"] - t["critical"]), 1.0)
            status = "critical"
        elif pd >= t["warning"]:
            score = 0.5 + 0.3 * (pd - t["warning"]) / (t["critical"] - t["warning"])
            status = "above_threshold"
        else:
            score = 0.5 * pd / t["warning"]
            status = "normal"
        scores.append(score)
        factors.append({"factor": "partial_discharge", "value": pd, "status": status, "score": round(score, 3)})

    # Oil quality risk (inverted — lower oil quality = higher risk)
    oil = sensors.get("oil_quality_index")
    if oil is not None:
        oil = float(oil)
        t = SENSOR_THRESHOLDS["oil_quality_index"]
        if oil <= t["critical"]:
            score = 0.8 + 0.2 * max((t["critical"] - oil) / t["critical"], 0)
            status = "critical"
        elif oil <= t["warning"]:
            score = 0.5 + 0.3 * (t["warning"] - oil) / (t["warning"] - t["critical"])
            status = "below_normal"
        elif oil <= t["good"]:
            score = 0.2 + 0.3 * (t["good"] - oil) / (t["good"] - t["warning"])
            status = "fair"
        else:
            score = 0.2 * (1.0 - oil) / (1.0 - t["good"])
            status = "good"
        scores.append(score)
        factors.append({"factor": "oil_quality", "value": oil, "status": status, "score": round(score, 3)})

    # Load risk
    load = sensors.get("load_pct")
    if load is not None:
        load = float(load)
        t = SENSOR_THRESHOLDS["load_pct"]
        if load >= t["critical"]:
            score = 0.8 + 0.2 * min((load - t["critical"]) / (t["max"] - t["critical"]), 1.0)
            status = "overloaded"
        elif load >= t["warning"]:
            score = 0.4 + 0.4 * (load - t["warning"]) / (t["critical"] - t["warning"])
            status = "high_load"
        else:
            score = 0.4 * load / t["warning"]
            status = "normal"
        scores.append(score)
        factors.append({"factor": "load", "value": load, "status": status, "score": round(score, 3)})

    composite = sum(scores) / len(scores) if scores else 0.5
    return min(composite, 1.0), factors


def compute_weather_exposure_score(weather_data: list[dict]) -> tuple[float, dict]:
    """
    Compute weather risk from forecast data for an asset's location.
    Considers storm probability, wind speed, and precipitation in next 72h.
    """
    if not weather_data:
        return 0.1, {"factor": "weather", "status": "no_forecast", "score": 0.1}

    max_storm = max(float(w.get("storm_probability", 0)) for w in weather_data)
    max_wind = max(float(w.get("wind_kph", 0)) for w in weather_data)
    max_precip = max(float(w.get("precip_mm", 0)) for w in weather_data)

    # Storm probability is the primary driver
    storm_score = max_storm

    # Wind severity (>60 kph is dangerous for grid equipment)
    wind_score = min(max_wind / 80.0, 1.0)

    # Precipitation severity (>30mm is significant)
    precip_score = min(max_precip / 50.0, 1.0)

    composite = 0.5 * storm_score + 0.3 * wind_score + 0.2 * precip_score

    if max_storm >= 0.8:
        status = "severe_storm_incoming"
    elif max_storm >= 0.5:
        status = "storm_warning"
    elif max_storm >= 0.3:
        status = "elevated"
    else:
        status = "calm"

    return min(composite, 1.0), {
        "factor": "weather_forecast",
        "max_storm_prob": round(max_storm, 2),
        "max_wind_kph": round(max_wind, 1),
        "max_precip_mm": round(max_precip, 1),
        "status": status,
        "score": round(composite, 3),
    }


def compute_historical_failure_score(incidents: list[dict]) -> tuple[float, dict]:
    """
    Compute risk from historical incident frequency and recency.
    More recent and frequent incidents = higher risk.
    """
    if not incidents:
        return 0.05, {"factor": "historical_failures", "count": 0, "status": "clean_record", "score": 0.05}

    today = date.today()
    count = len(incidents)

    # Recency score: most recent incident's recency
    recent_dates = []
    for inc in incidents:
        inc_date = inc.get("incident_date")
        if isinstance(inc_date, str):
            try:
                inc_date = date.fromisoformat(inc_date[:10])
            except Exception:
                inc_date = None
        elif isinstance(inc_date, datetime):
            inc_date = inc_date.date()
        if inc_date:
            recent_dates.append(inc_date)

    if recent_dates:
        most_recent = max(recent_dates)
        days_since = (today - most_recent).days
        recency_score = max(0.0, 1.0 - (days_since / 365.0))  # decays over 1 year
    else:
        recency_score = 0.0

    # Frequency score: number of incidents in last 18 months
    cutoff = today - timedelta(days=548)
    recent_count = sum(1 for d in recent_dates if d >= cutoff)
    frequency_score = min(recent_count / 4.0, 1.0)  # 4+ incidents = max

    # Severity: total customer impact
    total_affected = sum(int(inc.get("customers_affected", 0) or 0) for inc in incidents)
    severity_score = min(total_affected / 100000.0, 1.0)

    composite = 0.4 * recency_score + 0.35 * frequency_score + 0.25 * severity_score

    if recent_count >= 3:
        status = f"{recent_count}_failures_in_18mo"
    elif recent_count >= 1:
        status = f"{recent_count}_failure_in_18mo"
    else:
        status = "historical_only"

    return min(composite, 1.0), {
        "factor": "historical_failures",
        "count": count,
        "recent_count_18mo": recent_count,
        "most_recent_days_ago": (today - max(recent_dates)).days if recent_dates else None,
        "total_customers_affected": total_affected,
        "status": status,
        "score": round(composite, 3),
    }


def compute_age_condition_score(asset: dict) -> tuple[float, dict]:
    """
    Compute risk from asset age, time since last maintenance, and voltage criticality.
    """
    current_year = datetime.now().year
    install_year = int(asset.get("install_year") or current_year)
    age_years = max(0, current_year - install_year)

    # Age risk: transformers have ~30-40 year lifespan
    age_score = min(age_years / 30.0, 1.0)

    # Maintenance overdue risk
    last_maint = asset.get("last_maintenance")
    days_since_maint = None
    if last_maint:
        if isinstance(last_maint, str):
            try:
                last_maint = date.fromisoformat(last_maint[:10])
            except Exception:
                last_maint = None
        elif isinstance(last_maint, datetime):
            last_maint = last_maint.date()
        if last_maint:
            days_since_maint = (date.today() - last_maint).days
            # Maintenance every 6 months is ideal, 12 months is overdue
            maint_score = min(days_since_maint / 365.0, 1.0)
        else:
            maint_score = 0.8
    else:
        maint_score = 0.8  # Unknown maintenance history is risky

    composite = 0.6 * age_score + 0.4 * maint_score

    if age_years >= 20:
        status = "aging"
    elif age_years >= 12:
        status = "mature"
    else:
        status = "modern"

    return min(composite, 1.0), {
        "factor": "age_and_condition",
        "age_years": age_years,
        "days_since_maintenance": days_since_maint,
        "status": status,
        "score": round(composite, 3),
    }


def compute_grid_impact_severity(asset: dict) -> float:
    """
    Compute grid impact severity on a 1-10 scale.
    Based on customers served, voltage level, and asset type.
    """
    customers = int(asset.get("customers_served") or 0)
    voltage_kv = int(asset.get("voltage_kv") or 132)
    asset_type = asset.get("type", "transformer")

    # Customer impact (normalized to 0-1, assuming max ~60,000 for a single asset)
    customer_score = min(customers / 60000.0, 1.0)

    # Voltage criticality
    voltage_map = {400: 1.0, 220: 0.8, 132: 0.6, 66: 0.4, 33: 0.3}
    voltage_score = voltage_map.get(voltage_kv, 0.5)

    # Type criticality (transformers are more critical than breakers)
    type_map = {"transformer": 1.0, "substation": 0.9, "breaker": 0.6}
    type_score = type_map.get(asset_type, 0.5)

    # Cascade factor (higher voltage = more downstream impact)
    cascade = 1.0 + 0.3 * voltage_score

    severity = (0.5 * customer_score + 0.3 * voltage_score + 0.2 * type_score) * cascade * 10
    return round(min(severity, 10.0), 1)


def classify_risk_level(score: float) -> str:
    """Map a 0-1 risk score to a risk level category."""
    if score >= 0.75:
        return "CRITICAL"
    elif score >= 0.50:
        return "HIGH"
    elif score >= 0.25:
        return "MEDIUM"
    else:
        return "LOW"


def calculate_failure_probability_7d(risk_score: float, weather_score: float) -> float:
    """
    Estimate 7-day failure probability.
    Combines the overall risk score with weather urgency.
    """
    # Base probability from risk score (exponential curve — risk accelerates)
    base = 1 - math.exp(-3.0 * risk_score)

    # Weather amplifier (severe weather can double the probability)
    weather_multiplier = 1.0 + weather_score

    prob = base * weather_multiplier
    return round(min(prob, 0.99), 3)


def analyze_fused_asset(fused: dict) -> dict:
    """
    Run complete risk analysis on a single fused asset record.
    Returns structured risk result with component breakdowns and explainable factors.
    """
    asset = fused.get("asset", {})
    asset_id = asset.get("id")
    latest_sensors = fused.get("latest_sensors", {})
    weather_forecasts = fused.get("weather_forecasts", [])
    incident_history = fused.get("incident_history", [])

    # 1. Component scores
    sensor_score, sensor_factors = compute_sensor_health_score(latest_sensors)
    weather_score, weather_factor = compute_weather_exposure_score(weather_forecasts)
    hist_score, hist_factor = compute_historical_failure_score(incident_history)
    age_score, age_factor = compute_age_condition_score(asset)

    # 2. Overall weighted risk score
    risk_score = (
        WEIGHTS["sensor_health"] * sensor_score
        + WEIGHTS["weather_exposure"] * weather_score
        + WEIGHTS["historical_failure"] * hist_score
        + WEIGHTS["age_condition"] * age_score
    )
    risk_score = round(min(max(risk_score, 0.0), 1.0), 3)

    # 3. Classifications & impact
    risk_level = classify_risk_level(risk_score)
    failure_prob_7d = calculate_failure_probability_7d(risk_score, weather_score)
    grid_impact = compute_grid_impact_severity(asset)

    # 4. Consolidate explainable factors
    contributing_factors = []
    contributing_factors.extend(sensor_factors)
    contributing_factors.append(weather_factor)
    contributing_factors.append(hist_factor)
    contributing_factors.append(age_factor)

    return {
        "asset_id": asset_id,
        "asset": asset,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "failure_probability_7d": failure_prob_7d,
        "failure_prob_7d": failure_prob_7d,
        "grid_impact_severity": grid_impact,
        "component_scores": {
            "sensor_health": round(sensor_score, 3),
            "weather_exposure": round(weather_score, 3),
            "historical_risk": round(hist_score, 3),
            "age_condition": round(age_score, 3),
        },
        "contributing_factors": contributing_factors,
    }


def analyze_all_fused(fused_list: list[dict]) -> list[dict]:
    """Run risk analysis on all fused assets."""
    return [analyze_fused_asset(item) for item in fused_list]

