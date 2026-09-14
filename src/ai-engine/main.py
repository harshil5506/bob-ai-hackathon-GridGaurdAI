"""
GridGuard AI — AI/ML Risk & Recommendation Engine
FastAPI application providing explainable risk scoring, asset prioritization,
and maintenance/crew pre-positioning recommendations.
"""

from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

from data_fusion import fuse_all_assets, fuse_data_for_asset
from risk_model import (
    WEIGHTS,
    SENSOR_THRESHOLDS,
    analyze_fused_asset,
    analyze_all_fused,
)
from severity_ranker import (
    rank_assets_by_severity,
    generate_maintenance_recommendations,
)

app = FastAPI(
    title="GridGuard AI Engine",
    version="1.0.0",
    description="Explainable Risk Scoring, Asset Prioritization, and Crew Pre-positioning Engine for Grid Reliability.",
)

# Enable CORS for cross-service communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request Models ─────────────────────────────────────────────────────────────

class AnalysisRequest(BaseModel):
    assets: List[Dict[str, Any]] = Field(..., description="Grid assets metadata")
    sensors: List[Dict[str, Any]] = Field(default_factory=list, description="Latest IoT sensor readings")
    weather: List[Dict[str, Any]] = Field(default_factory=list, description="Weather forecast records")
    incidents: List[Dict[str, Any]] = Field(default_factory=list, description="Historical incident logs")


class SingleAssetAnalysisRequest(BaseModel):
    asset: Dict[str, Any]
    latest_sensors: Optional[Dict[str, Any]] = None
    weather_forecasts: Optional[List[Dict[str, Any]]] = None
    incident_history: Optional[List[Dict[str, Any]]] = None


# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    """Health check endpoint for container and service monitoring."""
    return {
        "status": "ok",
        "service": "ai-engine",
        "version": "1.0.0",
        "weights": WEIGHTS,
    }


@app.get("/model/config")
def get_model_config():
    """Returns model weights and IEEE sensor thresholds for explainability and auditability."""
    return {
        "weights": WEIGHTS,
        "sensor_thresholds": SENSOR_THRESHOLDS,
        "description": "Multi-factor explainable risk scoring model grounded in IEEE/IEC transformer standards.",
    }


@app.post("/analyze/risk")
def analyze_grid_risk(payload: AnalysisRequest):
    """
    Main risk analysis pipeline:
    1. Fuse telemetry, weather forecasts, and historical incidents per asset.
    2. Compute transparent, multi-factor risk scores and failure probabilities.
    3. Rank assets by grid impact severity.
    4. Generate actionable maintenance plans and crew staging recommendations.
    """
    try:
        if not payload.assets:
            return {
                "risk_results": [],
                "maintenance_recommendations": [],
                "total_analyzed": 0,
            }

        # Step 1: Fuse data across all dimensions
        fused_data = fuse_all_assets(
            assets=payload.assets,
            sensors=payload.sensors,
            weather=payload.weather,
            incidents=payload.incidents,
        )

        # Step 2: Compute multi-factor risk scores
        raw_results = analyze_all_fused(fused_data)

        # Step 3: Rank assets by combined risk * grid impact severity
        ranked_results = rank_assets_by_severity(raw_results)

        # Step 4: Generate prioritised maintenance & crew staging recommendations
        recommendations = generate_maintenance_recommendations(ranked_results)

        return {
            "risk_results": ranked_results,
            "maintenance_recommendations": recommendations,
            "total_analyzed": len(ranked_results),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI risk analysis failed: {str(e)}")


@app.post("/analyze/single")
def analyze_single_asset(payload: SingleAssetAnalysisRequest):
    """Ad-hoc single asset risk evaluation for simulation or manual parameter testing."""
    try:
        fused = {
            "asset": payload.asset,
            "latest_sensors": payload.latest_sensors or {},
            "weather_forecasts": payload.weather_forecasts or [],
            "incident_history": payload.incident_history or [],
        }
        result = analyze_fused_asset(fused)
        ranked = rank_assets_by_severity([result])
        recommendations = generate_maintenance_recommendations(ranked)
        return {
            "risk_result": ranked[0],
            "maintenance_recommendation": recommendations[0] if recommendations else None,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Single asset analysis failed: {str(e)}")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
