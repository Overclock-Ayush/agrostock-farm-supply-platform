# AgroStock — Farm Supply & Inventory Management Platform

**Made by Ayush Sahu 2026**

AgroStock is a resume-ready full-stack application for an agricultural supply business. It combines a searchable farm-supply catalog, JWT-secured buyer/admin workflows, MongoDB Atlas persistence, inventory controls, transactional order processing, Redis caching, Swagger/OpenAPI documentation, and a responsive React frontend.

## Tech stack

**Backend:** Java 21, Spring Boot 3.5.16, Spring Security, JWT, Spring Data MongoDB, MongoDB Atlas, Redis, Maven, Docker, Swagger/OpenAPI.

**Frontend:** React 18, React Router, Vite, plain CSS.

## What you can demonstrate in an interview

- RESTful API design with clean controller/service/repository separation.
- JWT authentication and role-based authorization (`ADMIN` / `BUYER`).
- MongoDB document modeling with indexes and embedded order items.
- Transactional order creation with inventory protection and stock restoration on cancellation.
- Atomic MongoDB stock updates that only decrement when enough stock exists.
- Redis-backed caching for frequently accessed product details with cache eviction on updates.
- Pagination, filtering, sorting, validation, global exception handling, Swagger/OpenAPI, and Docker.
- A real React client that consumes the backend instead of a static mockup.

## Project structure

```text
agrostock-resume/
├── backend/
│   ├── src/main/java/com/ayush/agrostock/
│   │   ├── config/          # Spring Security, Redis, Mongo transactions, OpenAPI, seed data
│   │   ├── controller/      # REST endpoints
│   │   ├── domain/          # Enums
│   │   ├── dto/             # Request/response models
│   │   ├── exception/       # API exception handling
│   │   ├── model/           # MongoDB documents
│   │   ├── repository/      # Mongo repositories + custom atomic stock updates
│   │   ├── security/        # JWT service/filter/user loading
│   │   └── service/         # Business logic
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
├── ARCHITECTURE.md
├── RESUME_SNIPPET.txt
└── README.md
```

## Demo accounts

The backend seeds demo users when `APP_SEED_DEMO_DATA=true` and the corresponding email does not already exist.

**Admin**
- Email: `admin@agrostock.dev`
- Password: `Admin@123`

**Buyer**
- Email: `buyer@agrostock.dev`
- Password: `Buyer@123`

These credentials are for this portfolio/demo project. Change or disable demo seeding for any non-demo deployment.

---

# 1. Create / configure MongoDB Atlas

You can use an Atlas Free cluster for this portfolio project. MongoDB's current Atlas documentation describes Free clusters as the small-scale development tier, with limited resources. Free clusters use a three-node replication setup, which is suitable for this application's MongoDB transaction configuration. See the official Atlas documentation before creating the cluster.

1. Sign in to MongoDB Atlas.
2. Create a new Project, for example `AgroStock`.
3. Create a **Free** cluster.
4. Create a database user and save its username/password.
5. In **Network Access**, add your current IP address for local development.
6. For a cloud deployment such as Render, add the IP/network range required by your deployment. For a simple portfolio demo, many developers temporarily use `0.0.0.0/0`; if you do this, use a strong database password and understand that it allows connection attempts from any IP that also has valid database credentials.
7. Click **Connect → Drivers** and copy your SRV connection string.
8. Change the database name in the URI to `agrostock`.

Example shape:

```text
mongodb+srv://USERNAME:PASSWORD@YOUR-CLUSTER.mongodb.net/agrostock?retryWrites=true&w=majority
```

Do not put your real connection string into GitHub. Keep it in `.env` locally and in your deployment provider's secret/environment-variable settings.

---

# 2. Generate a JWT secret

Use a long random value. For example, in PowerShell:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copy the result into `JWT_SECRET`. The backend accepts either a base64 secret with enough decoded bytes or a plain UTF-8 secret of at least 32 bytes.

---

# 3. Run locally — easiest method: Docker Compose

This option runs:

- Spring Boot backend on `http://localhost:8080`
- React frontend on `http://localhost:5173`
- Redis in a local Docker container
- MongoDB remains in MongoDB Atlas

### Install first

You need:

- Docker Desktop
- Git
- A MongoDB Atlas account

Java/Node/Maven are not required for the Docker-based run.

### Create your `.env`

From the project root:

```powershell
Copy-Item .env.example .env
```

Open `.env` and replace:

```text
MONGODB_URI=...
JWT_SECRET=...
```

Keep:

```text
REDIS_URL=redis://redis:6379
FRONTEND_ORIGIN=http://localhost:5173,http://localhost
APP_SEED_DEMO_DATA=true
```

### Start everything

```powershell
docker compose up --build
```

Open:

```text
http://localhost:5173
```

Backend health check:

```text
http://localhost:8080/api/health
```

Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

Stop the stack with:

```powershell
docker compose down
```

---

# 4. Run locally without Docker

Use this if you prefer IntelliJ IDEA / VS Code / terminal development.

## Backend

Install Java 21 and Maven.

Create the root `.env` file from `.env.example` as described earlier. The backend is configured to read that file when you run from the project root or from `backend/`. For native development, set `REDIS_URL` to your Upstash Redis `rediss://...` URL, or point it at a local Redis service.

Then run:

```powershell
cd backend
mvn spring-boot:run
```

## Frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

---

# 5. Test the main workflow locally

Use the seeded buyer account:

```text
buyer@agrostock.dev
Buyer@123
```

Then:

1. Browse the catalog.
2. Add products to cart.
3. Enter a delivery address.
4. Place an order.
5. Confirm the order appears under **Orders**.
6. Sign out.
7. Sign in as `admin@agrostock.dev` / `Admin@123`.
8. Open **Admin**.
9. Inspect dashboard metrics, low-stock items, products, and orders.
10. Move an order from `PENDING → CONFIRMED → PACKED → SHIPPED → DELIVERED`.
11. Create/edit a product.
12. Open Swagger and authenticate if you want to demonstrate the API directly.

---

# 6. Push the project to a NEW GitHub repository

Create a new empty GitHub repository, for example:

```text
ecommerce-order-inventory-api
```

Do not commit `.env`.

From the project root:

```powershell
git init
git branch -M main
git add .
git status
git commit -m "Build AgroStock farm supply platform"
git remote add origin https://github.com/YOUR_USERNAME/ecommerce-order-inventory-api.git
git push -u origin main
```

Before `git push`, confirm `.env` is not listed in `git status`.

---

# 7. Deploy the backend on Render

The simplest portfolio deployment is to use **Render Web Service** for Spring Boot and **Render Static Site** for React. Render currently supports free web services and static sites. Free web services spin down after 15 minutes without inbound traffic, so the first request after idle can be slower. Render also supports Docker-based web services.

### Backend

1. Sign in to Render.
2. Choose **New → Web Service**.
3. Connect your new GitHub repository.
4. Set the **Root Directory** to:

```text
backend
```

5. Choose **Docker** as the runtime.
6. Set the instance plan you want; Render currently offers a Free compute option for supported web services.
7. Set the health check path to:

```text
/actuator/health
```

8. Add environment variables:

```text
MONGODB_URI=your MongoDB Atlas URI
REDIS_URL=your Upstash Redis rediss:// URI
JWT_SECRET=your long random secret
JWT_EXPIRATION_MINUTES=120
FRONTEND_ORIGIN=https://YOUR-FRONTEND.onrender.com
APP_SEED_DEMO_DATA=true
```

9. Start the deployment.
10. Wait for the service to become healthy.
11. Test:

```text
https://YOUR-BACKEND.onrender.com/api/health
```

12. Open:

```text
https://YOUR-BACKEND.onrender.com/swagger-ui.html
```

Keep the backend URL; the frontend will need it.

---

# 8. Create free Redis for deployment with Upstash

Redis is separate from MongoDB. For a portfolio deployment, Upstash Redis is a simple managed option. Its current free tier includes 256 MB of data and 500,000 commands per month.

1. Create an Upstash account.
2. Create a Redis database in the region closest to your backend.
3. Copy the Redis connection details.
4. Use the TLS connection form (`rediss://...`) as the `REDIS_URL` environment variable in Render.
5. Do not commit Redis credentials to GitHub.

---

# 9. Deploy the frontend on Render

1. In Render, choose **New → Static Site**.
2. Connect the same GitHub repository.
3. Set the **Root Directory** to:

```text
frontend
```

4. Build command:

```text
npm install && npm run build
```

5. Publish directory:

```text
dist
```

6. Add an environment variable:

```text
VITE_API_BASE_URL=https://YOUR-BACKEND.onrender.com/api
```

7. Create the site.
8. Add a rewrite rule:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

This is required so React Router routes work when a page is opened directly.

9. Deploy.
10. Open the generated Render URL.

---

# 10. Final production verification

Test from the public frontend:

- Login as buyer.
- Browse/filter/sort products.
- Add to cart.
- Place an order.
- Check order history.
- Login as admin.
- Open the admin dashboard.
- Confirm metrics load.
- Edit a product.
- Check low-stock items.
- Update order status.
- Open the backend Swagger URL.
- Open the backend `/api/health` endpoint.

If the UI loads but API calls fail with CORS errors, update the backend environment variable:

```text
FRONTEND_ORIGIN=https://YOUR-ACTUAL-FRONTEND-URL.onrender.com
```

Then redeploy the backend.

---

# API quick reference

```text
POST   /api/auth/register
POST   /api/auth/login

GET    /api/products
GET    /api/products/{id}
POST   /api/products                    # ADMIN
PUT    /api/products/{id}               # ADMIN
DELETE /api/products/{id}               # ADMIN
GET    /api/products/admin/all          # ADMIN

POST   /api/orders                      # BUYER
GET    /api/orders/me                   # BUYER
GET    /api/orders/{id}                 # OWNER or ADMIN
GET    /api/orders/admin/all             # ADMIN
PATCH  /api/orders/admin/{id}/status    # ADMIN

GET    /api/admin/dashboard              # ADMIN
GET    /api/health
GET    /swagger-ui.html
```

---

# Resume-ready description

See `RESUME_SNIPPET.txt` for a concise version.

A strong project line is:

> **AgroStock — Farm Supply & Inventory Management Platform** | Java, Spring Boot, MongoDB Atlas, Spring Security, JWT, Redis, React, Docker
>
> Built a full-stack agri-supply platform with role-based JWT authentication, MongoDB-backed product/inventory management, transactional order processing with guarded stock updates, Redis caching, pagination/filtering/sorting, Swagger/OpenAPI, and a responsive React admin/customer workflow.

Only keep claims that match the code you actually deploy and can explain in an interview.

---

# Important security notes

- Never commit `.env`.
- Never put real credentials in frontend source code.
- Use a strong MongoDB database-user password.
- Use a unique JWT secret per environment.
- For production beyond a portfolio/demo, restrict Atlas network access instead of using `0.0.0.0/0`.
- Free Render services are appropriate for testing/hobby projects and may sleep when idle.
- The seeded demo admin credentials should be changed or demo seeding disabled for non-portfolio use.
