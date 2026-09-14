# GridGuard AI — API Contracts

> **This is the canonical contract between all services. Changes require PR review from all team members.**

## Service Endpoints

| Service | Port | Owner |
|---------|------|-------|
| Frontend (Vite) | 3000 | Person 1 |
| Backend (Express) | 5000 | Person 2 |
| AI Engine (FastAPI) | 8001 | Person 3 |
| Bob Service (FastAPI) | 8002 | Person 4 |
| PostgreSQL | 5432 | Person 2 |

## Public API (Backend → Frontend)

All endpoints are prefixed with `/api`.

### GET /api/assets
### GET /api/assets/:id
### GET /api/weather
### GET /api/incidents
### POST /api/risk/calculate
### GET /api/maintenance/plan
### POST /api/bob/chat

See `implementation_plan.md` for full request/response schemas.

## Internal APIs

### AI Engine: POST http://ai-engine:8001/analyze/risk
### Bob Service: POST http://bob-service:8002/bob/advise
