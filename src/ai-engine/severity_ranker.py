"""
GridGuard AI — Severity Ranker & Maintenance Recommendation Generator
Ranks assets by grid impact and generates prioritised maintenance/crew plans.
"""

from datetime import datetime, timedelta, timezone


# Crew type mapping based on asset type and failure mode
CREW_TYPES = {
    "transformer": {
        "overheating": "transformer_cooling_specialist",
        "oil_contamination": "transformer_oil_specialist",
        "partial_discharge": "transformer_insulation_specialist",
        "general": "transformer_specialist",
    },
    "breaker": {
        "mechanism_jam": "breaker_mechanic",
        "overcurrent": "protection_engineer",
        "general": "breaker_specialist",
    },
    "substation": {
        "flooding": "substation_emergency_team",
        "general": "substation_engineer",
    },
}

# Staging depots near each substation
STAGING_DEPOTS = {
    "Riverside":  {"lat": 28.6200, "lng": 77.2100, "name": "Central Metro Depot"},
    "Northgate":  {"lat": 28.7250, "lng": 77.1550, "name": "Northern Service Center"},
    "Eastfield":  {"lat": 28.6350, "lng": 77.3250, "name": "Industrial Zone Depot"},
    "Southbank":  {"lat": 28.5050, "lng": 77.2850, "name": "Coastal Operations Base"},
    "Westpoint":  {"lat": 28.6550, "lng": 77.1050, "name": "Westpoint Service Hub"},
}


def rank_assets_by_severity(risk_results: list[dict]) -> list[dict]:
    """
    Rank assets by a combined score of risk + grid impact.
    Returns sorted list with priority assignments.
    """
    ranked = []
    for result in risk_results:
        # Combined ranking score: risk severity * grid impact
        risk_score = result.get("risk_score", 0)
        grid_impact = result.get("grid_impact_severity", 1)
        combined = risk_score * grid_impact  # 0 to 10 scale
        result["combined_severity"] = round(combined, 2)
        ranked.append(result)

    # Sort by combined severity descending
    ranked.sort(key=lambda x: x["combined_severity"], reverse=True)

    # Assign priority numbers
    for i, item in enumerate(ranked):
        item["priority"] = i + 1

    return ranked


def generate_maintenance_recommendations(ranked_results: list[dict]) -> list[dict]:
    """
    Generate prioritised maintenance work orders for HIGH and CRITICAL risk assets.
    Includes crew type, size, staging location, and action items.
    """
    recommendations = []
    now = datetime.now(timezone.utc)

    for result in ranked_results:
        risk_level = result.get("risk_level", "LOW")
        if risk_level not in ("HIGH", "CRITICAL"):
            continue

        asset = result.get("asset", {})
        asset_type = asset.get("type", "transformer")
        substation = asset.get("substation", "Unknown")

        # Determine primary failure mode from contributing factors
        factors = result.get("contributing_factors", [])
        primary_factor = _determine_primary_factor(factors)
        crew_type = _select_crew_type(asset_type, primary_factor)
        action = _generate_action(asset_type, primary_factor, risk_level, factors)

        # Crew size based on criticality
        crew_size = 4 if risk_level == "CRITICAL" else 3

        # Staging location
        staging = STAGING_DEPOTS.get(substation, {"lat": 28.6000, "lng": 77.2000, "name": "Metro Central Depot"})

        # Recommended completion time based on urgency
        if risk_level == "CRITICAL":
            recommended_by = now + timedelta(hours=12)
        else:
            recommended_by = now + timedelta(hours=48)

        # Estimated downtime
        downtime = _estimate_downtime(asset_type, primary_factor)

        recommendations.append({
            "asset_id": result.get("asset_id"),
            "priority": result.get("priority"),
            "action": action,
            "crew_type": crew_type,
            "crew_size": crew_size,
            "staging_location": staging,
            "recommended_by": recommended_by.isoformat() + "Z",
            "estimated_downtime_hours": downtime,
            "justification": _generate_justification(result, factors),
        })

    return recommendations


def _determine_primary_factor(factors: list[dict]) -> str:
    """Determine the primary risk factor from contributing factors."""
    if not factors:
        return "general"

    # Find the factor with the highest score
    max_factor = max(factors, key=lambda f: f.get("score", 0))
    factor_name = max_factor.get("factor", "general")

    # Map factor names to failure modes
    factor_map = {
        "temperature": "overheating",
        "oil_quality": "oil_contamination",
        "partial_discharge": "partial_discharge",
        "vibration": "mechanism_jam",
        "load": "overload",
        "weather_forecast": "storm_damage",
    }
    return factor_map.get(factor_name, "general")


def _select_crew_type(asset_type: str, failure_mode: str) -> str:
    """Select appropriate crew type based on asset and failure mode."""
    type_crews = CREW_TYPES.get(asset_type, CREW_TYPES["transformer"])
    return type_crews.get(failure_mode, type_crews.get("general", "general_maintenance"))


def _generate_action(asset_type: str, failure_mode: str, risk_level: str, factors: list[dict]) -> str:
    """Generate a specific maintenance action description."""
    prefix = "EMERGENCY: " if risk_level == "CRITICAL" else ""

    action_map = {
        "overheating": f"{prefix}Inspect cooling system, check oil circulation, and verify fan operation. Reduce load if temperature exceeds 85°C.",
        "oil_contamination": f"{prefix}Perform dissolved gas analysis (DGA), replace contaminated oil, and inspect seals for degradation.",
        "partial_discharge": f"{prefix}Conduct partial discharge measurement, inspect bushing insulation, and assess winding integrity.",
        "mechanism_jam": f"{prefix}Inspect operating mechanism, clean and lubricate moving parts, test trip/close operations.",
        "overload": f"{prefix}Review load distribution, identify load transfer options, and install temporary load monitoring.",
        "storm_damage": f"{prefix}Pre-storm inspection: secure loose components, verify lightning arresters, clear debris from substation area.",
        "general": f"{prefix}Comprehensive asset inspection covering electrical, mechanical, and thermal parameters.",
    }
    return action_map.get(failure_mode, action_map["general"])


def _estimate_downtime(asset_type: str, failure_mode: str) -> float:
    """Estimate required downtime in hours for the maintenance action."""
    downtime_map = {
        ("transformer", "overheating"): 4.0,
        ("transformer", "oil_contamination"): 8.0,
        ("transformer", "partial_discharge"): 6.0,
        ("transformer", "general"): 4.0,
        ("transformer", "storm_damage"): 2.0,
        ("breaker", "mechanism_jam"): 3.0,
        ("breaker", "general"): 2.0,
    }
    return downtime_map.get((asset_type, failure_mode), 4.0)


def _generate_justification(result: dict, factors: list[dict]) -> str:
    """Generate a human-readable justification for the maintenance recommendation."""
    parts = []
    asset = result.get("asset", {})

    risk_score = result.get("risk_score", 0)
    risk_level = result.get("risk_level", "UNKNOWN")
    parts.append(f"Risk assessment: {risk_level} ({risk_score:.2f}/1.00).")

    # Add factor-specific justifications
    for factor in sorted(factors, key=lambda f: f.get("score", 0), reverse=True)[:3]:
        name = factor.get("factor", "")
        status = factor.get("status", "")
        value = factor.get("value", "")

        if name == "temperature" and status != "normal":
            parts.append(f"Temperature at {value}°C ({status}).")
        elif name == "oil_quality" and status != "good":
            parts.append(f"Oil quality index {value} ({status}).")
        elif name == "vibration" and status != "normal":
            parts.append(f"Vibration at {value} mm/s ({status}).")
        elif name == "partial_discharge" and status != "normal":
            parts.append(f"Partial discharge at {value} pC ({status}).")
        elif name == "weather_forecast" and status != "calm":
            max_storm = factor.get("max_storm_prob", 0)
            parts.append(f"Severe weather forecast: {max_storm*100:.0f}% storm probability ({status}).")
        elif name == "historical_failures":
            count = factor.get("recent_count_18mo", 0)
            if count > 0:
                parts.append(f"Historical: {count} incident(s) in past 18 months.")

    customers = asset.get("customers_served", 0)
    if customers > 0:
        parts.append(f"Serves {customers:,} customers.")

    return " ".join(parts)
