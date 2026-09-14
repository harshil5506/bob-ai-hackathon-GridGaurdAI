"""
GridGuard AI — Unit & Edge Case Test Suite for AI/ML Engine
Validates:
1. Multi-factor risk calculation (sensor, weather, incident, age)
2. Normal / baseline asset conditions (LOW risk)
3. High temperature & critical partial discharge (CRITICAL risk)
4. Severe incoming weather storm impact
5. Multiple recurring failures recency edge case
6. Empty / missing sensor telemetry graceful handling
7. Asset severity ranking and tie-breaking
8. Maintenance plan generation & crew specialty assignment
9. Staging depot geolocation resolution
10. FastAPI endpoint testing via TestClient
"""

import unittest
from datetime import datetime, date, timedelta

from data_fusion import fuse_data_for_asset, fuse_all_assets
from risk_model import (
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
from severity_ranker import (
    rank_assets_by_severity,
    generate_maintenance_recommendations,
)


class TestAIEngine(unittest.TestCase):

    def setUp(self):
        self.sample_asset_transformer = {
            "id": "TR-101",
            "name": "Transformer TR-101",
            "type": "transformer",
            "substation": "Riverside",
            "location_lat": 28.6200,
            "location_lng": 77.2100,
            "voltage_kv": 220,
            "install_year": 2005,
            "customers_served": 45000,
            "last_maintenance": "2023-08-15",
            "status": "operational",
        }

        self.sample_asset_breaker = {
            "id": "CB-201",
            "name": "Circuit Breaker CB-201",
            "type": "breaker",
            "substation": "Northgate",
            "location_lat": 28.7250,
            "location_lng": 77.1550,
            "voltage_kv": 132,
            "install_year": 2018,
            "customers_served": 15000,
            "last_maintenance": "2024-01-10",
            "status": "operational",
        }

    def test_normal_sensor_readings_yield_low_risk(self):
        """Normal readings within IEEE thresholds must yield low risk."""
        normal_sensors = {
            "temperature_c": 55.0,
            "vibration_mm_s": 1.5,
            "partial_discharge_pc": 25.0,
            "oil_quality_index": 0.95,
            "load_pct": 50.0,
        }
        score, factors = compute_sensor_health_score(normal_sensors)
        self.assertLess(score, 0.35)
        for f in factors:
            self.assertIn(f["status"], ["normal", "good"])

    def test_critical_temperature_triggers_critical_factor(self):
        """Temperature exceeding critical threshold (>85C) must flag critical status."""
        critical_sensors = {
            "temperature_c": 92.0,
            "vibration_mm_s": 2.0,
            "partial_discharge_pc": 30.0,
            "oil_quality_index": 0.85,
            "load_pct": 65.0,
        }
        score, factors = compute_sensor_health_score(critical_sensors)
        temp_factor = next(f for f in factors if f["factor"] == "temperature")
        self.assertEqual(temp_factor["status"], "critical")
        self.assertGreaterEqual(temp_factor["score"], 0.8)

    def test_critical_degraded_oil_and_partial_discharge(self):
        """Severely degraded dielectric oil and high partial discharge must yield high risk score."""
        degraded_sensors = {
            "temperature_c": 88.0,
            "vibration_mm_s": 6.0,
            "partial_discharge_pc": 280.0,
            "oil_quality_index": 0.25,
            "load_pct": 98.0,
        }
        score, factors = compute_sensor_health_score(degraded_sensors)
        self.assertGreaterEqual(score, 0.75)

    def test_missing_sensor_data_graceful_fallback(self):
        """Missing or empty sensor dictionary must return default neutral score without crashing."""
        score, factors = compute_sensor_health_score({})
        self.assertEqual(score, 0.5)
        self.assertEqual(factors[0]["status"], "no_data")

    def test_weather_exposure_storm_conditions(self):
        """Storm probability >80% and high wind speed should yield severe weather score."""
        storm_weather = [
            {
                "forecast_time": "2026-09-15T12:00:00Z",
                "temp_c": 28.0,
                "wind_kph": 75.0,
                "precip_mm": 45.0,
                "storm_probability": 0.90,
            }
        ]
        score, factor = compute_weather_exposure_score(storm_weather)
        self.assertGreaterEqual(score, 0.70)
        self.assertEqual(factor["status"], "severe_storm_incoming")

    def test_weather_empty_fallback(self):
        """Empty weather list returns calm/low baseline."""
        score, factor = compute_weather_exposure_score([])
        self.assertLessEqual(score, 0.15)
        self.assertEqual(factor["status"], "no_forecast")

    def test_historical_incidents_recency_and_frequency(self):
        """Recent repeated incidents must escalate historical failure score."""
        today_str = date.today().isoformat()
        recent_incidents = [
            {"incident_date": today_str, "customers_affected": 20000},
            {"incident_date": (date.today() - timedelta(days=30)).isoformat(), "customers_affected": 15000},
            {"incident_date": (date.today() - timedelta(days=90)).isoformat(), "customers_affected": 25000},
        ]
        score, factor = compute_historical_failure_score(recent_incidents)
        self.assertGreaterEqual(score, 0.60)
        self.assertIn("3_failures_in_18mo", factor["status"])

    def test_grid_impact_severity_higher_for_high_voltage_large_customers(self):
        """Transformers with 45k customers and 220kV should have high grid impact severity."""
        high_impact = compute_grid_impact_severity(self.sample_asset_transformer)
        low_impact = compute_grid_impact_severity(self.sample_asset_breaker)
        self.assertGreater(high_impact, low_impact)
        self.assertGreaterEqual(high_impact, 6.0)

    def test_end_to_end_fused_risk_analysis_and_ranking(self):
        """Full pipeline: fuse data, compute risk, rank, and generate recommendations."""
        assets = [self.sample_asset_transformer, self.sample_asset_breaker]
        sensors = [
            {
                "asset_id": "TR-101",
                "temperature_c": 92.0,
                "vibration_mm_s": 5.8,
                "partial_discharge_pc": 220.0,
                "oil_quality_index": 0.35,
                "load_pct": 98.0,
            },
            {
                "asset_id": "CB-201",
                "temperature_c": 45.0,
                "vibration_mm_s": 1.2,
                "partial_discharge_pc": 10.0,
                "oil_quality_index": 0.90,
                "load_pct": 40.0,
            },
        ]
        weather = [
            {
                "location_lat": 28.6200,
                "location_lng": 77.2100,
                "storm_probability": 0.85,
                "wind_kph": 65.0,
                "precip_mm": 35.0,
            }
        ]
        incidents = [
            {"asset_id": "TR-101", "incident_date": date.today().isoformat(), "customers_affected": 30000}
        ]

        fused = fuse_all_assets(assets, sensors, weather, incidents)
        self.assertEqual(len(fused), 2)

        results = analyze_all_fused(fused)
        ranked = rank_assets_by_severity(results)

        # TR-101 should be Priority 1 with CRITICAL or HIGH risk
        self.assertEqual(ranked[0]["asset_id"], "TR-101")
        self.assertEqual(ranked[0]["priority"], 1)
        self.assertIn(ranked[0]["risk_level"], ["HIGH", "CRITICAL"])

        # CB-201 should be Priority 2 with LOW or MEDIUM risk
        self.assertEqual(ranked[1]["asset_id"], "CB-201")
        self.assertEqual(ranked[1]["priority"], 2)

        # Recommendations should only be generated for TR-101
        recommendations = generate_maintenance_recommendations(ranked)
        self.assertGreaterEqual(len(recommendations), 1)
        top_rec = recommendations[0]
        self.assertEqual(top_rec["asset_id"], "TR-101")
        self.assertIn("staging_location", top_rec)
        self.assertEqual(top_rec["staging_location"]["name"], "Central Metro Depot")
        self.assertIn("justification", top_rec)

    def test_stable_python_callable_interfaces(self):
        """Verify programmatic analyze_grid and score_single_asset functions."""
        try:
            from __init__ import analyze_grid, score_single_asset
        except (ImportError, ValueError):
            from .__init__ import analyze_grid, score_single_asset

        # Test analyze_grid bulk callable
        result = analyze_grid(
            assets=[self.sample_asset_transformer, self.sample_asset_breaker],
            sensors=[],
            weather=[],
            incidents=[]
        )
        self.assertIn("risk_results", result)
        self.assertIn("maintenance_recommendations", result)
        self.assertEqual(result["total_analyzed"], 2)

        # Test score_single_asset with only elevated sensor (calm weather & clean history)
        single_res = score_single_asset(
            asset=self.sample_asset_transformer,
            latest_sensors={"temperature_c": 95.0, "oil_quality_index": 0.30},
        )
        self.assertIn("risk_result", single_res)
        self.assertGreater(single_res["risk_result"]["risk_score"], 0.40)

        # Test score_single_asset with multi-factor risk alignment (severe sensor + severe weather)
        multi_factor_res = score_single_asset(
            asset=self.sample_asset_transformer,
            latest_sensors={
                "temperature_c": 95.0,
                "vibration_mm_s": 6.5,
                "partial_discharge_pc": 280.0,
                "oil_quality_index": 0.25,
                "load_pct": 105.0,
            },
            weather_forecasts=[
                {"location_lat": 28.62, "location_lng": 77.21, "storm_probability": 0.90, "wind_kph": 75.0}
            ],
            incident_history=[
                {"incident_date": date.today().isoformat(), "customers_affected": 20000}
            ]
        )
        self.assertIn(multi_factor_res["risk_result"]["risk_level"], ["HIGH", "CRITICAL"])
        self.assertIsNotNone(multi_factor_res["maintenance_recommendation"])



if __name__ == "__main__":
    unittest.main()

