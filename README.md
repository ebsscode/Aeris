# Coding Interview Assessment

Solutions to the four-part assessment.

```
.
├── A/          Task A — Mystic Waves (Python)
├── B/          Task B — CargoCraft Fleet (Python)
├── C/          Task C — Xero API written answers (Markdown)
└── frontend/   Task D — E-commerce Product Detail Page (Vue 3 + Vite + TypeScript)
```

---

## A. Mystic Waves (Python)

Total energy of `n` alternating waves `x, -x, x, …`. Pairs cancel, so the answer
is `x` when `n` is odd and `0` when `n` is even — O(1) per test case.

**Run** (reads from stdin):

```bash
cd A
python solution.py < sample_input.txt
# Expected: 0 / 2 / 0 / 4 (one per line)
```

**Test:**

```bash
cd A
python test_solution.py        # or: pytest
```

---

## B. CargoCraft Fleet (Python)

Given `n` propulsion units, find the min/max number of crafts where
`4*a + 6*b = n` (`a` = Type A, `b` = Type B), or `-1` if impossible.

Approach: `n` must be even. With `m = n/2` the feasible craft counts are every
integer in `[ceil(m/3), floor(m/2)]`, so the answer is
`min = ceil(m/3)`, `max = floor(m/2)`, and `-1` when that range is empty.
O(1) per test case using Python's arbitrary-precision integers (handles `n ≤ 10¹⁸`).

**Run** (reads from stdin):

```bash
cd B
python solution.py < sample_input.txt
# Expected:
# 1 1
# -1
# 4 6
# 166374058999707392 249561088499561088
```

**Test:**

```bash
cd B
python test_solution.py        # includes a brute-force cross-check for n = 1..2000
```

---

## C. Xero API answers (Markdown)

Written answers to C1–C5 are in [`C/answers.md`](C/answers.md).

---

## D. Frontend — Product Detail Page (Vue 3 + Vite + TypeScript)

An e-commerce product detail page with variant selection, quantity control,
add-to-cart flow, and a mock API service layer.

**Run:**

```bash
cd frontend
npm install
npm run dev        # open the printed http://localhost:5173
```

**Other scripts:**

```bash
npm run build      # production build to dist/
npm run preview    # preview the production build
npm run test       # vitest unit tests
```

### What it implements

- **UI:** product image, name, price, stock status, description, and **two variant
  dimensions** (Color, Size). Price and stock update when the selected SKU changes.
- **Quantity control:** min `1`, max = available stock; the `+` button is disabled
  at the stock limit.
- **Add to cart:** disabled when the selected SKU is out of stock; shows success
  feedback and updates the cart-count badge; shows a user-friendly error (and does
  **not** change the count) on failure.
- **All required states:** Loading, API error (with Retry), Out of stock,
  Add-to-cart success, Add-to-cart failure.

### Structure

```
frontend/src/
├── api/
│   ├── types.ts        # domain types
│   └── mockApi.ts      # mock service layer (getProductDetail, addToCart)
├── composables/
│   └── useProduct.ts   # loading / error / data state for fetching
├── components/
│   ├── ProductDetail.vue   # main page logic
│   ├── VariantSelector.vue # generic single-dimension picker
│   ├── QuantityControl.vue # quantity stepper with clamping
│   └── CartBadge.vue       # cart-count badge
├── App.vue
└── main.ts
```

### Assumptions

- **No real backend.** `src/api/mockApi.ts` simulates a server with ~500 ms latency,
  mutable in-memory stock, and a running cart count. Stock decrements on a successful
  add-to-cart, so repeated adds eventually hit "Insufficient stock".
- The product has 4 SKUs (Black/White × 128GB/256GB). One SKU (**White / 128GB**) is
  intentionally **out of stock** and one (**Black / 256GB**, stock 3) is low, to
  demonstrate the out-of-stock and insufficient-stock paths.
- To demo the **API error** state, set `productId` to `"ERROR"` in `src/App.vue`
  (`getProductDetail('ERROR')` rejects).
- Images are inline SVG data URLs so the app runs fully offline.
- Cart state lives in the page (front-of-mind for this task); it is not persisted.

### Tests

- `tests/mockApi.test.ts` — mock service layer (success, insufficient stock,
  out of stock, stock decrement, error/unknown product).
- `tests/QuantityControl.test.ts` — stepper bounds and disabled states.
```bash
cd frontend && npm run test
```
# Aeris
