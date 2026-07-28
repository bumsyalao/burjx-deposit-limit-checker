# AED Deposit Limit Checker

A small BurjX-style feature: a single React page, backed by a two-endpoint
Express API, that shows a fixed demo customer their daily AED deposit limit,
what they've deposited today, their remaining allowance, and whether a
proposed deposit amount is eligible. The API owns every business rule; the
frontend never decides eligibility on its own.

**Live app:** _TODO — add the deployed URL here after hosting._

## Setup, run, build, test

Requires Node.js **18+** and npm 9+. This is an npm-workspaces monorepo
(`client/`, `server/`) with one root lockfile — one `npm install` sets up
both packages.

```bash
# 1. Install everything (root + client + server)
npm install

# 2. Run both dev servers together (server on :3001, client on :5173)
npm run dev

# 3. Build both packages for production
npm run build

# 4. Run all tests (server, then client)
npm test
```

Each package can also be run independently from its own directory
(`cd server && npm run dev`, `cd client && npm run dev`, etc.) using the
same script names.

The client reads the API's base URL from `VITE_API_BASE_URL` (see
`client/.env.example`); it defaults to `http://localhost:3001` if unset,
which matches the server's default port.

## API summary

### `GET /api/deposit-summary`

Returns the fixed demo customer's current standing. No request body.

```json
{
  "currency": "AED",
  "dailyLimit": "25000.00",
  "depositedToday": "6800.00",
  "remaining": "18200.00"
}
```

### `POST /api/deposit-check`

```json
{ "amount": "10000.00" }
```

Checks — but does not record — a proposed deposit against the remaining
allowance. `amount` must be a **string**: a positive decimal with at most
two decimal places (e.g. `"10"`, `"10.4"`, `"10.47"`).

- **Eligible** (`amount <= remaining`) → `200 OK`:
  ```json
  {
    "eligible": true,
    "currency": "AED",
    "requestedAmount": "10000.00",
    "remainingBefore": "18200.00",
    "remainingAfter": "8200.00",
    "reason": null
  }
  ```
- **Over the limit** → still `200 OK` (a business result, not a request
  error) with `eligible: false` and `reason: "DAILY_LIMIT_EXCEEDED"`.
- **Malformed input** (non-string, wrong decimal places, zero/negative,
  commas, empty, non-numeric, or invalid JSON body) → `400 Bad Request`:
  ```json
  { "error": "INVALID_AMOUNT", "message": "..." }
  ```

Checking eligibility never mutates `depositedToday` — this is a read/check
flow, not a real deposit.

## Assumptions

The spec left a few details open; these are the calls made, all
documented rather than left implicit:

- **HTTP status for `DAILY_LIMIT_EXCEEDED`**: `200 OK` with
  `eligible: false`, since it's a successfully processed check, not a
  malformed request. Only genuinely bad input (wrong shape, wrong type,
  invalid JSON) gets `400`.
- **`amount` must be a JSON string**, not a number — this is what the
  spec's own example sends, and it keeps any client-supplied amount out
  of JS's float parser entirely.
- **`GET /api/deposit-summary` response shape** wasn't given in the spec;
  it was designed to match the string-decimal convention already used by
  `deposit-check`.
- **No shared types package** between client and server. Duplicating the
  small response-shape types in the client avoids monorepo build-ordering
  complexity that doesn't pay for itself at this size, especially since
  client and server may end up deployed separately.
- **Permissive CORS** on the server, since there's no auth or session
  state in scope and client/server may be on different origins once
  deployed.
- Dependency versions (Express 4, React 18, Vite 5, Vitest 3, etc.) were
  deliberately pinned below their latest majors, which now require
  Node 20+/22+ — keeping this on Node 18 avoided forcing a runtime bump
  just to `npm install`.

## Money handling

All amounts are represented as integer **fils** (1 AED = 100 fils)
end-to-end on the server — see `server/src/money.ts`. Input strings are
parsed by splitting on `.` and combining the whole/fractional digit
substrings as integers; `parseFloat`/`Number()` is never called on a raw
decimal amount, only on pre-validated all-digit substrings. Money is
formatted back to a `"X.XX"` string via integer division/modulo only at
the response boundary. The fixed demo customer's limit and today's
deposited amount are stored as fils constants directly, not derived from
any float math.

## Tests

Three focused areas, split across four files (14 tests total):

- `server/tests/deposit-check.boundary.test.ts` — an amount exactly equal
  to the remaining allowance is eligible.
- `server/tests/deposit-check.rejection.test.ts` — an amount above the
  allowance is rejected (`200`, `eligible: false`), and every malformed
  input shape is rejected (`400`, `INVALID_AMOUNT`); also asserts a check
  never mutates `depositedToday`.
- `client/src/tests/DepositCheckerPage.happyPath.test.tsx` — the frontend
  happy path: the fetched summary renders, and submitting an eligible
  amount displays the API's result.

Run them all with `npm test` from the repo root.

## What's explicitly not built

Authentication, registration, an admin panel, a real payment integration,
a database, cloud infrastructure, multiple pages, multi-customer or
multi-currency support, rate limiting, logging/observability, and any
endpoint that actually records a deposit (only summary + check exist, by
design — this is a checker, not a deposit flow).

## AI use

**Tools used:** Claude Code (Claude Sonnet 5), used for the full
implementation — planning, the Express API, the React frontend, and all
tests — working in explicit, reviewed stages (scaffold → backend →
backend tests → frontend → frontend test → this README), each committed
and pushed separately.

**Example of AI output reviewed and changed:** the first scaffolding
attempt used `npm create vite@latest`, which failed outright — the
installed `create-vite` required Node 20.19+/22.12+ and the environment
runs Node 18.17. Rather than bumping Node, every dependency (Vite,
Vitest, `@testing-library/*`, `concurrently`, etc.) was individually
checked against the npm registry for its `engines.node` field and pinned
to the newest version still compatible with Node 18, then the client was
hand-scaffolded to match the standard `react-ts` Vite template. Separately,
after building the summary card, the displayed values (`AED 25000.00`)
didn't match the comma-grouped formatting the assignment's own spec used
for the same numbers (`AED 25,000.00`) — that was caught by comparing the
rendered page against the spec text and fixed with a display-only
thousands-separator formatter that never touches the underlying fils
arithmetic.

**How it was verified:** `npm run build` (TypeScript compilation for both
packages) and `npm test` (14 tests) were run after every stage. The
running app was also exercised directly — `curl` against every endpoint
case (eligible, exact boundary, over-limit, and every malformed-input
variant) and, for the frontend, live in-browser interaction through the
eligible/ineligible/malformed-input flows — before each stage was
committed.
