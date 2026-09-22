# AgroStock architecture

```text
                 ┌──────────────────────────┐
                 │        React UI          │
                 │  Catalog / Cart / Admin  │
                 └────────────┬─────────────┘
                              │ HTTPS/JSON
                              ▼
                 ┌──────────────────────────┐
                 │     Spring Boot API      │
                 │ Controllers → Services   │
                 │        → Repositories    │
                 └───────┬─────────┬────────┘
                         │         │
              ┌──────────▼───┐   ┌─▼─────────────┐
              │ MongoDB Atlas │   │ Redis / Upstash│
              │ users         │   │ product cache │
              │ products      │   │ TTL + eviction│
              │ orders        │   └───────────────┘
              └───────────────┘

Security:
React → Authorization: Bearer <JWT> → JwtAuthenticationFilter
                                          ↓
                                  Spring Security
                                  ROLE_BUYER / ROLE_ADMIN

Order flow:
1. Validate authenticated buyer.
2. Load requested products.
3. Validate availability.
4. Atomically decrement each SKU when stock >= requested quantity.
5. Build server-side price snapshots and totals.
6. Persist the order.
7. MongoDB transaction rolls back on failure.

Cancellation flow:
1. Validate the status transition.
2. Atomically restore item stock.
3. Persist CANCELLED status in the same transaction.
```

## Key design decisions

### MongoDB instead of relational JPA

Products and orders are modeled as MongoDB documents. Order items are embedded snapshots so product name, SKU, unit price, and line totals remain historically meaningful even after a catalog item changes.

### Inventory consistency

The stock decrement is performed with a query that requires `stockQuantity >= quantity` and then applies `$inc: -quantity`. This removes the simple read-then-write race that could otherwise oversell a product. The method is executed inside the MongoDB transaction used by order creation.

### Caching

Product detail reads are cached in Redis for 10 minutes. Product updates and deletes evict the affected entry. This gives a concrete caching story to discuss rather than adding Redis as an unused dependency.

### Authorization

Spring Security owns route protection. Public product browsing and authentication endpoints do not need a token. Order creation is buyer-only. Catalog mutations and operations dashboards are admin-only.
