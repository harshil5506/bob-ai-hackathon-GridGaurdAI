"""
GridGuard AI — AI/ML Risk & Recommendation Engine Package
Stable Python and API interface for Backend and IBM Bob Advisor.
"""

try:
    from .risk_model import (
        WEIGHTS,
        SENSOR_THRESHOLDS,
        compute_sensor_health_score,
        compute_weather_exposure_score,
        compute_historical_failure_score,
        compute_age_condition_score,
        compute_grid_impact_severity,
        classify_risk_level,
        calculate_failure_probability_7d,
        analyze_fused_asset,
        analyze_all_fused,
    )
    from .data_fusion import fuse_data_for_asset, fuse_all_assets
    from .severity_ranker import (
        CREW_TYPES,
        STAGING_DEPOTS,
        rank_assets_by_severity,
        generate_maintenance_recommendations,
    )
except (ImportError, ValueError):
    from risk_model import (
        WEIGHTS,
        SENSOR_THRESHOLDS,
        compute_sensor_health_score,
        compute_weather_exposure_score,
        compute_historical_failure_score,
        compute_age_condition_score,
        compute_grid_impact_severity,
        classify_risk_level,
        calculate_failure_probability_7d,
        analyze_fused_asset,
        analyze_all_fused,
    )
    from data_fusion import fuse_data_for_asset, fuse_all_assets
    from severity_ranker import (
        CREW_TYPES,
        STAGING_DEPOTS,
        rank_assets_by_severity,
        generate_maintenance_recommendations,
    )


def analyze_grid(
    assets: list[dict],
    sensors: list[dict] = None,
    weather: list[dict] = None,
    incidents: list[dict] = None,
) -> dict:
    """
    Stable programmatic Python callable interface for backend or Bob Advisor.
    Takes raw grid datasets, performs data fusion, explainable risk scoring,
    grid impact ranking, and crew pre-positioning recommendation generation.
    """
    sensors = sensors or []
    weather = weather or []
    incidents = incidents or []

    fused_data = fuse_all_assets(assets, sensors, weather, incidents)
    raw_results = analyze_all_fused(fused_data)
    ranked_results = rank_assets_by_severity(raw_results)
    recommendations = generate_maintenance_recommendations(ranked_results)

    return {
        "risk_results": ranked_results,
        "maintenance_recommendations": recommendations,
        "total_analyzed": len(ranked_results),
    }


def score_single_asset(
    asset: dict,
    latest_sensors: dict = None,
    weather_forecasts: list[dict] = None,
    incident_history: list[dict] = None,
) -> dict:
    """
    Stable callable interface for single-asset evaluation (e.g. for IBM Bob interactive queries).
    """
    fused = {
        "asset": asset,
        "latest_sensors": latest_sensors or {},
        "weather_forecasts": weather_forecasts or [],
        "incident_history": incident_history or [],
    }
    result = analyze_fused_asset(fused)
    ranked = rank_assets_by_severity([result])
    recommendations = generate_maintenance_recommendations(ranked)
    return {
        "risk_result": ranked[0],
        "maintenance_recommendation": recommendations[0] if recommendations else None,
    }


__all__ = [
    "WEIGHTS",
    "SENSOR_THRESHOLDS",
    "CREW_TYPES",
    "STAGING_DEPOTS",
    "analyze_grid",
    "score_single_asset",
    "fuse_data_for_asset",
    "fuse_all_assets",
    "compute_sensor_health_score",
    "compute_weather_exposure_score",
    "compute_historical_failure_score",
    "compute_age_condition_score",
    "compute_grid_impact_severity",
    "classify_risk_level",
    "calculate_failure_probability_7d",
    "analyze_fused_asset",
    "analyze_all_fused",
    "rank_assets_by_severity",
    "generate_maintenance_recommendations",
]
