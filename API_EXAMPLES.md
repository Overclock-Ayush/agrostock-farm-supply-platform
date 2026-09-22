# AgroStock API examples

Base URL locally:

```text
http://localhost:8080/api
```

## 1. Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@agrostock.dev","password":"Buyer@123"}'
```

Copy the `token` from the response.

## 2. List products

```bash
curl "http://localhost:8080/api/products?page=0&size=9&sortBy=price&direction=asc"
```

## 3. Create an order

Replace `PRODUCT_ID` with an ID returned by the products endpoint.

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "items":[{"productId":"PRODUCT_ID","quantity":2}],
    "shippingAddress":{
      "line1":"Farm Road 14",
      "city":"Lucknow",
      "state":"Uttar Pradesh",
      "postalCode":"226001",
      "country":"India"
    }
  }'
```

## 4. Admin login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@agrostock.dev","password":"Admin@123"}'
```

## 5. Admin dashboard

```bash
curl http://localhost:8080/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_JWT"
```

## 6. Update order status

```bash
curl -X PATCH http://localhost:8080/api/orders/admin/ORDER_ID/status \
  -H "Authorization: Bearer ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMED"}'
```

Swagger UI is available at `/swagger-ui.html` and can be used instead of curl for an interview demonstration.
