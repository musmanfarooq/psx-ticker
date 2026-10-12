import type { Router } from "express";

/**
 * Express router exposing `GET /api/psx-prices?symbols=HBL,ABL,SELECT`.
 * Mount it on an existing Express app with `app.use(psxTickerRouter)`.
 */
export const psxTickerRouter: Router;

/**
 * Scrapes PSX's market-summary page and returns the latest price for
 * every listed symbol, keyed by ticker symbol (e.g. `{ HBL: 307.54 }`).
 * Responses are cached in-process for 60 seconds.
 */
export function fetchPsxMarketPrices(): Promise<Record<string, number>>;
