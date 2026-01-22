# Delivery System

> Monorepo for a delivery platform: admin dashboard, backend API, and customer-facing frontend.

This repository contains three main projects:

- `admin-dashboard` — Admin web app (Vite + React + TypeScript, Tailwind)
- `delivery-backend` — Node/Express API with Sequelize (database, auth, uploads, payments)
- `Delivery-frontend` — Customer-facing web app (Vite + React, Tailwind)

**Directory overview**

- [admin-dashboard](admin-dashboard) — admin UI and dashboard
- [delivery-backend](delivery-backend) — backend API, models, controllers, routes
- [Delivery-frontend](Delivery-frontend) — public-facing frontend

## Quick Start

Prerequisites

- Node.js (LTS, >=16 recommended)
- npm or yarn or pnpm
- A SQL database (Postgres/MySQL) with credentials

Install dependencies

From each project folder, run:

```bash
# backend
cd delivery-backend
npm install

# admin dashboard
cd ../admin-dashboard
npm install

# customer frontend
cd ../Delivery-frontend
npm install
```

Run locally

Start the backend (development):

```bash
cd delivery-backend
# either the dev script or start depending on the package.json
npm run dev || npm start
```

Start the admin dashboard (development):

```bash
cd admin-dashboard
npm run dev || npm start
```

Start the customer frontend (development):

```bash
cd Delivery-frontend
npm run dev || npm start
```

## Database & Migrations

The backend uses Sequelize and includes `migrations/` and `seeders/`.

Run migrations and seeders (from `delivery-backend`):

```bash
cd delivery-backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

If you use a different workflow (TypeORM, custom scripts, Docker), adapt accordingly.

## Environment Variables

Create an `.env` file in `delivery-backend` (and frontends if necessary). Common vars:

- `PORT` — backend port (e.g. `3000`)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` — database connection
- `DATABASE_URL` — optional full connection string
- `JWT_SECRET` — authentication secret
- `VITE_API_URL` or `REACT_APP_API_URL` — frontend API base URL
- Storage / third-party keys (e.g. `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`)

Check `delivery-backend/config/` for concrete configuration details.

## Scripts & Tests

Each project exposes scripts in its `package.json`. Common commands:

- `npm run dev` — start development server
- `npm start` — start production server
- `npm run build` — build frontend for production
- `npm test` — run tests (if present)

Run lint/format where available:

```bash
cd admin-dashboard && npm run lint && npm run format
cd Delivery-frontend && npm run lint && npm run format
```

## Deployment

General guidance:

- Build frontends with `npm run build` and deploy static assets to your CDN or hosting provider.
- Deploy `delivery-backend` to any Node hosting (Heroku, DigitalOcean App Platform, AWS ECS/EKS, etc.).
- Ensure environment variables and database connections are configured in your hosting environment.

CI/CD: Add workflows to build, test, and deploy each workspace project independently.

## Troubleshooting

- If migrations fail, confirm DB credentials and that the DB server accepts connections.
- If CORS issues occur, update backend CORS settings or set `VITE_API_URL` to the correct origin.
- Check logs in each service (`logs/` or stdout) for runtime errors.

## Contributing

1. Fork the repo and create a feature branch.
2. Add tests for new behavior where applicable.
3. Open a PR with a clear description of changes.

## References

- Backend config and controllers: [delivery-backend](delivery-backend)
- Admin UI: [admin-dashboard](admin-dashboard)
- Customer frontend: [Delivery-frontend](Delivery-frontend)

## License

This project is provided without an explicit license in the repository; add a `LICENSE` file if you wish to define terms (MIT recommended for open source).

---

If you'd like, I can:

- Add example `.env` templates for each project
- Create scripts to install dependencies for all subprojects at once
- Add CI workflow templates for GitHub Actions

Tell me which of those you'd like next.
