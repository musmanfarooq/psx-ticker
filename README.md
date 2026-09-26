# psx-ticker

A small REST API for live Pakistan Stock Exchange (PSX) prices.

PSX has no official public API. This scrapes PSX's own [market-summary](https://www.psx.com.pk/market-summary/) page — a plain server-rendered HTML table — giving full coverage of all ~690 currently-listed symbols, rather than the ~100-or-so most-liquid names that third-party aggregators tend to mirror.

## Running it

```bash
npx psx-ticker
```

Runs on `http://localhost:3888` by default (configurable via a `PORT` env var, e.g. `PORT=5000 npx psx-ticker`).

### From source

```bash
git clone <this repo>
cd psx-ticker
npm install
cp .env.example .env
npm start
```

## Using it in your own app

`psx-ticker` is server-side only — it can't be imported into a React/browser
bundle, both because it relies on Node-only APIs (`express`, `cheerio`) and
because PSX's own market-summary page doesn't send CORS headers, so a browser
can't fetch it directly anyway. A frontend should always talk to `psx-ticker`
over HTTP, never import it as code.

If your backend is already an Express app, mount the router directly instead
of running `psx-ticker` as a separate process:

```js
const express = require("express");
const { psxTickerRouter } = require("psx-ticker");

const app = express();
app.use(psxTickerRouter); // adds GET /api/psx-prices to your existing app

app.listen(3000);
```

Your frontend then just calls your own backend, same-origin, exactly like any
other route:

```js
const res = await fetch("/api/psx-prices?symbols=HBL,SELECT");
const { prices } = await res.json();
```

`psx-ticker` never binds its own port when used this way — `app.listen()` only
runs when the package is executed directly (`npx psx-ticker` / `npm start`),
not when it's `require()`'d as a dependency.

Need the raw prices without HTTP at all (e.g. inside a cron job)? Use the
underlying fetch function directly:

```js
const { fetchPsxMarketPrices } = require("psx-ticker");
const prices = await fetchPsxMarketPrices(); // { HBL: 307.54, ABL: 170.2, ... }
```

## API

### `GET /api/psx-prices?symbols=HBL,ABL,SELECT`

Comma-separated list of ticker symbols (case-insensitive).

**Response:**

```json
{ "prices": { "HBL": 307.54, "ABL": 170.2, "SELECT": 30.76 } }
```

Symbols with no match (delisted, not currently traded, or misspelled) are simply omitted — never returned as `0`.

On upstream failure:

```json
{ "error": "Failed to fetch PSX prices." }
```
returned with a `502` status.

Results are cached in-memory for 60 seconds to avoid hammering PSX on every request.

## License

ISC
