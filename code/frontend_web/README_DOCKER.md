# Frontend Docker Instructions

Build the image:
```bash
docker build -t frontend_web .
```

Environment variables (Vite):
- `.env` (dev/local default): `VITE_API_BASE_URL=http://localhost:3001` (host-mapped backend-web port from compose).
- `.env.production` (container build default): `VITE_API_BASE_URL=http://localhost:3001` (use host-reachable backend when the SPA runs in the browser).
- Optional overrides (if you prefer components or a proxy): `VITE_API_PROTOCOL`, `VITE_API_HOST`, `VITE_API_PORT`.
