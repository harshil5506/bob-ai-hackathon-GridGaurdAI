"""
GridGuard AI — Data Fusion Module
Fuses sensor data, weather forecasts, and incident records by asset.
Prepares unified data structures for the risk scoring engine.
"""

from datetime import datetime


def fuse_data_for_asset(asset: dict, sensors: list[dict], weather: list[dict], incidents: list[dict]) -> dict:
    """
    Fuse all available data sources for a single asset.

    Args:
        asset: Asset record from database
        sensors: List of all latest sensor readings (will be filtered to this asset)
        weather: List of all weather forecasts (will be matched by location proximity)
        incidents: List of all incidents (will be filtered to this asset)

    Returns:
        Unified data dict ready for risk scoring
    """
    asset_id = asset.get("id")
    asset_lat = float(asset.get("location_lat", 0))
    asset_lng = float(asset.get("location_lng", 0))

    # Filter sensor readings for this asset
    asset_sensors = [s for s in sensors if s.get("asset_id") == asset_id]
    latest_sensor = asset_sensors[0] if asset_sensors else {}

    # Match weather to nearest location (simple proximity — within 0.05 degrees)
    asset_weather = []
    for w in weather:
        w_lat = float(w.get("location_lat", 0))
        w_lng = float(w.get("location_lng", 0))
        if abs(w_lat - asset_lat) < 0.05 and abs(w_lng - asset_lng) < 0.05:
            asset_weather.append(w)

    # Filter incidents for this asset
    asset_incidents = [i for i in incidents if i.get("asset_id") == asset_id]

    return {
        "asset": asset,
        "latest_sensors": {
            "temperature_c": latest_sensor.get("temperature_c"),
            "vibration_mm_s": latest_sensor.get("vibration_mm_s"),
            "partial_discharge_pc": latest_sensor.get("partial_discharge_pc"),
            "oil_quality_index": latest_sensor.get("oil_quality_index"),
            "load_pct": latest_sensor.get("load_pct"),
            "humidity_pct": latest_sensor.get("humidity_pct"),
        },
        "weather_forecasts": asset_weather,
        "incident_history": asset_incidents,
    }


def fuse_all_assets(assets: list[dict], sensors: list[dict], weather: list[dict], incidents: list[dict]) -> list[dict]:
    """
    Fuse data for all assets.

    Returns:
        List of fused data dicts, one per asset
    """
    return [
        fuse_data_for_asset(asset, sensors, weather, incidents)
        for asset in assets
    ]
