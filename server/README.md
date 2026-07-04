# Sukoun Server

v0 backend for the Sukoun mobile app. See [`../BACKEND.md`](../BACKEND.md) for the full plan.

## Quick start

```bash
cp .env.example .env
npm install
npm run db:setup        # prisma generate + migrate + seed
npm run dev             # http://localhost:4000
```

## Smoke tests

```bash
curl http://localhost:4000/v1/healthz
curl http://localhost:4000/v1/therapists?topRated=true
curl -X POST http://localhost:4000/v1/auth/signup \
  -H "content-type: application/json" \
  -d '{"name":"Manar","email":"manar@sukoun.app","password":"password123"}'
```

## Useful

```bash
npm run db:studio      # Prisma Studio at :5555
npm run db:reset       # nuke + reseed
```
