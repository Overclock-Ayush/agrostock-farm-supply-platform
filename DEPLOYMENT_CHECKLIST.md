# AgroStock deployment checklist

## Before GitHub

- [ ] `.env` is not tracked.
- [ ] `MONGODB_URI` is only in local `.env`.
- [ ] A new GitHub repository was created for AgroStock.
- [ ] `README.md` and `ARCHITECTURE.md` are present.

## MongoDB Atlas

- [ ] Cluster created.
- [ ] Database user created.
- [ ] Network Access configured.
- [ ] SRV URI points to the `agrostock` database.
- [ ] Local connection works.

## Local app

- [ ] `docker compose up --build` succeeds.
- [ ] Frontend opens on port 5173.
- [ ] Backend `/api/health` returns `UP`.
- [ ] Products load.
- [ ] Buyer can register/login.
- [ ] Buyer can place an order.
- [ ] Admin dashboard loads.
- [ ] Admin can edit products.
- [ ] Admin can update order status.
- [ ] Swagger UI loads.

## Redis deployment

- [ ] Upstash database created.
- [ ] `rediss://` connection URL copied.
- [ ] Redis secret is not committed.

## Render backend

- [ ] Web Service connected to the new GitHub repository.
- [ ] Root Directory = `backend`.
- [ ] Runtime = Docker.
- [ ] `MONGODB_URI` added.
- [ ] `REDIS_URL` added.
- [ ] `JWT_SECRET` added.
- [ ] `FRONTEND_ORIGIN` added after frontend URL is known.
- [ ] Health path = `/actuator/health`.
- [ ] `/api/health` works on public backend URL.

## Render frontend

- [ ] Static Site connected to the same repository.
- [ ] Root Directory = `frontend`.
- [ ] Build command = `npm install && npm run build`.
- [ ] Publish directory = `dist`.
- [ ] `VITE_API_BASE_URL` points to the public backend `/api` URL.
- [ ] SPA rewrite `/* → /index.html` configured.
- [ ] Login/catalog/order flows work from public URL.

## Final

- [ ] Buyer demo works.
- [ ] Admin demo works.
- [ ] Swagger works.
- [ ] GitHub contains no secrets.
- [ ] Resume claims match the deployed implementation.
