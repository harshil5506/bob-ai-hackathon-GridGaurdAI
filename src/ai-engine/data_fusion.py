"""
GridGuard AI — Data Fusion Module
Fuses sensor telemetry, weather forecasts, and incident records by asset.
Prepares unified, normalized data structures for the risk scoring engine.
Supports both direct telemetry schemas and relational DB schemas (substation FKs, DGA ppm).
"""

from datetime import datetime
from typing import Any, Dict, List


def fuse_data_for_asset(
    asset: Dict[str, Any],
    sensors: List[Dict[str, Any]],
    weather: List[Dict[str, Any]],
    incidents: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Fuse all available data sources for a single asset.
    Handles field aliases across backend DB schemas.
    """
    asset_id = asset.get("id")
    substation_id = asset.get("substation_id")
    asset_lat = float(asset.get("location_lat") or asset.get("latitude") or 0.0)
    asset_lng = float(asset.get("location_lng") or asset.get("longitude") or 0.0)

    # Filter sensor readings for this asset
    asset_sensors = [s for s in sensors if s.get("asset_id") == asset_id]
    latest_sensor = asset_sensors[0] if asset_sensors else {}

    # Extract & normalize temperature
    oil_temp = latest_sensor.get("oil_temperature_c") or latest_sensor.get("temperature_c")
    winding_temp = latest_sensor.get("winding_temperature_c")
    temps = [float(t) for t in (oil_temp, winding_temp) if t is not None]
    temperature_c = max(temps) if temps else None

    # Extract vibration
    vib = latest_sensor.get("vibration_rms_mm_s") or latest_sensor.get("vibration_mm_s")
    vibration_mm_s = float(vib) if vib is not None else None

    # Extract partial discharge
    pd = latest_sensor.get("partial_discharge_pc")
    partial_discharge_pc = float(pd) if pd is not None else None

    # Extract or infer oil quality from DGA (IEEE C57.104)
    oil_quality = latest_sensor.get("oil_quality_index")
    if oil_quality is not None:
        oil_quality_index = float(oil_quality)
    else:
        c2h2 = float(latest_sensor.get("dga_acetylene_c2h2_ppm") or 0.0)
        h2 = float(latest_sensor.get("dga_hydrogen_h2_ppm") or 0.0)
        if c2h2 > 0 or h2 > 0:
            # IEEE degradation: C2H2 > 2 ppm or H2 > 100 ppm is severe
            deg = min(1.0, (c2h2 / 10.0) * 0.6 + (h2 / 400.0) * 0.4)
            oil_quality_index = round(max(0.1, 1.0 - deg), 3)
        else:
            oil_quality_index = None

    # Extract load
    load = latest_sensor.get("load_pct")
    load_pct = float(load) if load is not None else None

    # Match weather forecasts by substation_id OR geolocation proximity
    asset_weather = []
    for w in weather:
        w_sub = w.get("substation_id")
        if substation_id and w_sub and w_sub == substation_id:
            asset_weather.append(w)
            continue

        w_lat = float(w.get("location_lat") or w.get("latitude") or 0.0)
        w_lng = float(w.get("location_lng") or w.get("longitude") or 0.0)
        if w_lat and asset_lat and abs(w_lat - asset_lat) < 0.08 and abs(w_lng - asset_lng) < 0.08:
            asset_weather.append(w)

    # Normalize weather forecast fields
    normalized_weather = []
    for w in asset_weather:
        storm_prob = float(w.get("lightning_strike_probability") or w.get("storm_probability") or 0.0)
        wind = float(w.get("wind_gust_kmh") or w.get("wind_speed_kmh") or w.get("wind_kph") or 0.0)
        precip = float(w.get("precipitation_mm") or w.get("precip_mm") or 0.0)
        normalized_weather.append({
            "storm_probability": storm_prob,
            "wind_kph": wind,
            "precip_mm": precip,
            "forecast_time": w.get("forecast_time"),
        })

    # Filter & normalize incident history
    asset_incidents = [i for i in incidents if i.get("asset_id") == asset_id]
    normalized_incidents = []
    for inc in asset_incidents:
        inc_date = inc.get("occurred_at") or inc.get("incident_date")
        customers = int(inc.get("customers_affected") or 0)
        normalized_incidents.append({
            "incident_date": inc_date,
            "customers_affected": customers,
            "cause": inc.get("root_cause") or inc.get("cause"),
        })

    # Normalize asset metadata fields
    customers_served = int(asset.get("downstream_customers") or asset.get("customers_served") or 0)
    install = asset.get("installation_date") or asset.get("install_year") or 2015
    if isinstance(install, str) and len(install) >= 4:
        try:
            install_year = int(install[:4])
        except Exception:
            install_year = 2015
    else:
        install_year = int(install)

    normalized_asset = dict(asset)
    normalized_asset["customers_served"] = customers_served
    normalized_asset["install_year"] = install_year

    return {
        "asset": normalized_asset,
        "latest_sensors": {
            "temperature_c": temperature_c,
            "vibration_mm_s": vibration_mm_s,
            "partial_discharge_pc": partial_discharge_pc,
            "oil_quality_index": oil_quality_index,
            "load_pct": load_pct,
            "humidity_pct": latest_sensor.get("humidity_pct"),
        },
        "weather_forecasts": normalized_weather,
        "incident_history": normalized_incidents,
    }


def fuse_all_assets(
    assets: List[Dict[str, Any]],
    sensors: List[Dict[str, Any]],
    weather: List[Dict[str, Any]],
    incidents: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """Fuse data across all assets in batch."""
    return [
        fuse_data_for_asset(asset, sensors, weather, incidents)
        for asset in assets
    ]
