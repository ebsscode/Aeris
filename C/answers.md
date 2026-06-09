# C. Xero API — Scenario Answers

> Reference: https://developer.xero.com/documentation/api/accounting/overview
>
> Base URL for the Accounting API: `https://api.xero.com/api.xro/2.0/`
> Every Accounting API call needs three things:
> - `Authorization: Bearer <access_token>` (OAuth 2.0)
> - `xero-tenant-id: <tenantId>` (which organisation to act against)
> - `Accept: application/json`

---

## C1. How would you prove that our Xero API connection is working before checking invoices?

Call the **connections endpoint** first — it is the cheapest, most reliable health check
because it does *not* depend on any organisation data:

```http
GET https://api.xero.com/connections
Authorization: Bearer <access_token>
Accept: application/json
```

What it proves:

- **`200 OK`** → the OAuth 2.0 access token is valid and not expired.
- The **response body** is the list of tenants (organisations) the token is authorised for.
  Each entry contains a `tenantId` (GUID) that you must pass as `xero-tenant-id` on every
  subsequent Accounting API call.
- **An empty array** means the token is valid but no organisation is connected → the user
  must (re)authorise / connect an org. This is a different problem from a bad token.

If `/connections` returns `401`, the token is invalid/expired → refresh it using the
refresh token before doing anything else.

So the order is: **valid token → at least one connection → grab the tenantId → then query invoices.**

---

## C2. If `/connections` works but `GET /Invoices` fails, what would you check?

`/connections` succeeding tells us the **token itself is fine**, so the problem is specific
to the Accounting API call. I would check, roughly in order of likelihood:

1. **Missing or wrong `xero-tenant-id` header.** `/connections` doesn't need it, but
   `/Invoices` does. Without it (or with a stale tenantId) you get `401`/`403`. Use the
   `tenantId` returned from `/connections`.
2. **Insufficient OAuth scopes.** `/connections` only needs the basic scopes
   (`openid profile email offline_access`). Reading invoices requires
   `accounting.transactions` or `accounting.transactions.read`. If the scope was not
   granted at consent time, the call fails (`403`). Fix = re-consent with the right scopes.
3. **Token expired between calls.** Access tokens are short-lived (~30 min). Refresh and retry.
4. **Wrong URL / verb.** It must be `https://api.xero.com/api.xro/2.0/Invoices` (note
   `api.xro/2.0`), not the developer-portal domain.
5. **Missing `Accept: application/json`** → you may get XML back and a JSON parser then "fails".
6. **Rate limiting (`429`)** — see C5.
7. **Server-side / transient (`500`, `503`)** — retry with backoff.

Practical tip: read the HTTP **status code** and the response body. Xero returns a structured
error payload (`Type`, `Message`, `ValidationErrors`) that usually says exactly what is wrong.

---

## C3. What endpoint would you call to check invoices?

```http
GET https://api.xero.com/api.xro/2.0/Invoices
Authorization: Bearer <access_token>
xero-tenant-id: <tenantId>
Accept: application/json
```

Because an org can have thousands of invoices, narrow/paginate the result instead of
pulling everything:

- **Pagination:** `?page=1` (Xero returns 100 invoices per page; keep requesting until a
  page is empty). Add `&pageSize=` where supported.
- **Filtering** with the `where` query param, e.g. only authorised invoices:
  `?where=Status=="AUTHORISED"`
- **Status shortcut:** `?Statuses=AUTHORISED,PAID`
- **Date filter / incremental sync:** use the `If-Modified-Since` header to fetch only
  invoices changed after a timestamp.
- **`?summaryOnly=true`** for a lighter, faster payload when you only need headers.

---

## C4. How would you check one specific invoice?

Request the single resource by its identifier — either the Xero **InvoiceID (GUID)** or the
human **InvoiceNumber**:

```http
GET https://api.xero.com/api.xro/2.0/Invoices/{InvoiceID}
Authorization: Bearer <access_token>
xero-tenant-id: <tenantId>
Accept: application/json
```

For example:

```
GET /api.xro/2.0/Invoices/297c2dc5-cc47-4afd-8ec8-74990b8761e9
GET /api.xro/2.0/Invoices/INV-0123
```

The single-invoice response includes the **full detail** (line items, allocations, payments,
attachments flag) that the list endpoint omits. To download the PDF of that invoice, send the
same URL with `Accept: application/pdf`.

---

## C5. If the invoice API returns `429`, how should the backend handle it?

A `429 Too Many Requests` means a Xero rate limit was hit. Xero enforces several limits
(e.g. ~60 calls/minute per tenant, a concurrent-request limit, and a daily app limit). The
backend should treat this as **expected back-pressure, not an error to surface to the user**:

1. **Respect the `Retry-After` header.** On a `429`, Xero returns `Retry-After` (seconds).
   Wait *exactly* that long before retrying — do not retry immediately.
2. **Retry with exponential backoff + jitter** as a fallback if `Retry-After` is absent, and
   cap the number of retries so a request can't loop forever.
3. **Inspect which limit was hit.** Xero sends a `X-Rate-Limit-Problem` header
   (`minute` / `daily` / `concurrent`) so you can react appropriately — a daily-limit hit
   should not be retried tightly.
4. **Throttle proactively.** Queue outbound calls and stay under the per-minute/concurrent
   limits (e.g. a token-bucket / rate limiter) so you rarely hit `429` in the first place.
5. **Cache & batch.** Avoid redundant calls — cache invoice data, use `If-Modified-Since`
   for incremental syncs, and use pagination/filters instead of re-fetching everything.
6. **Make retries safe.** Reads (`GET`) are idempotent. For writes, use idempotency safeguards
   so a retry after `429` cannot create a duplicate invoice.
7. **Degrade gracefully & observe.** Process the request asynchronously/from a queue, return a
   "syncing, please retry shortly" state to the user rather than a hard error, and log/alert on
   sustained `429`s so the limit problem is visible.
