# GridGuard AI — Backend Service

REST API and PostgreSQL persistence layer for **GridGuard AI: Power Outage Prediction & Grid Equipment Failure Advisor (U1)**.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Migrate and seed PostgreSQL
npm run db:migrate
npm run db:seed

# 4. Start development server
npm run dev