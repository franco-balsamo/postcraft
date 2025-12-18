# PostCraft

Herramienta para crear y publicar contenido en Instagram y Facebook sin salir del browser. Armás el diseño con una de las plantillas, completás los campos, y publicás directo o lo programás para después.

---

## Qué hace

- Editor visual con preview en tiempo real (posts y stories)
- Publicación directa a Instagram / Facebook vía Meta API
- Programación de posts (cola con Bull + Redis)
- Historial de todo lo publicado
- Sistema de planes con Stripe (free / pro / enterprise)
- Exportar diseño como PNG

## Stack

**Backend** — Node.js 20, Express, PostgreSQL, Redis, Bull, Passport.js (OAuth Meta), Cloudinary, Stripe

**Frontend** — React 18, Vite, Tailwind CSS, Zustand, React Query, Axios

Corre todo en Docker.

---

## Levantar en local

### Requisitos

- Docker Desktop corriendo
- Git

### Setup

```bash
git clone <repo>
cd brandkit

cp .env.example .env
```

Generá los secrets:

```bash
openssl rand -hex 32  # → POSTGRES_PASSWORD
openssl rand -hex 32  # → REDIS_PASSWORD
openssl rand -hex 64  # → JWT_SECRET
```

Pegá los valores en `.env`. Las variables de Meta, Cloudinary y Stripe son opcionales para desarrollo local — el sistema arranca sin ellas.

```bash
docker compose -f docker-compose.dev.yml up --build
```

Eso levanta todo: Postgres, Redis, backend en `:3000` y frontend en `:5173`.

Las migraciones corren automáticamente.

---

## Variables de entorno

Ver `.env.example` para la lista completa. Las obligatorias para levantar:

| Variable | Descripción |
|----------|-------------|
| `POSTGRES_PASSWORD` | Password de la DB |
| `REDIS_PASSWORD` | Password de Redis |
| `JWT_SECRET` | Secret para firmar tokens |
| `CORS_ORIGIN` | Origen del frontend (ej: `http://localhost:5173`) |
| `FRONTEND_URL` | URL del frontend |

Para publicar en redes también necesitás `META_APP_ID`, `META_APP_SECRET`, `META_CALLBACK_URL` y las de Cloudinary.

---

## Endpoints principales

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/meta          → OAuth Meta
GET  /api/auth/me

POST /api/publish            → publica o programa un post
GET  /api/posts              → historial con filtros y paginación
DELETE /api/posts/:id

GET  /api/plans
POST /api/plans/upgrade      → Stripe Checkout
POST /api/webhooks/stripe
```

Auth vía Bearer token o cookie HTTP-only (se setea en login/OAuth).

---

## Producción

Usar `docker-compose.yml` (sin puertos de DB expuestos al host).

```bash
docker compose up --build -d
```

Checklist antes de deployar:
- Secrets generados con `openssl rand -hex 64`
- `CORS_ORIGIN` apuntando al dominio real
- Claves live de Stripe
- Webhook configurado en el dashboard de Stripe
- Callback URL registrada en Meta for Developers
- HTTPS con reverse proxy (nginx / caddy)

---

## Estructura

```
backend/
  src/
    routes/      auth, publish, posts, plans, webhooks
    services/    publishService, tokenService, planService, scheduleService
    middleware/  auth (JWT + cookie), errorHandler
    config/      db, redis, cloudinary
    jobs/        publishQueue (Bull processor)
  migrations/    001_init.sql

frontend/
  src/
    pages/       Dashboard, Editor, Posts, Settings
    components/  Editor (canvas, fields, publish), Layout, UI
    store/       Zustand (auth)
    api/         clients axios
```

