const express = require("express");
const { fetchPsxMarketPrices } = require("./psx-market-data");

const psxTickerRouter = express.Router();

/**
 * GET /api/psx-prices?symbols=HBL,ABL,SELECT
 * -> { "prices": { "HBL": 307.54, "ABL": 170.2, "SELECT": 30.76 } }
 * Unknown/unmatched symbols are simply omitted, never returned as zero.
 */
psxTickerRouter.get("/api/psx-prices", async (req, res) => {
  const symbolsParam = typeof req.query.symbols === "string" ? req.query.symbols : "";
  const symbols = symbolsParam
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);

  if (symbols.length === 0) {
    return res.json({ prices: {} });
  }

  try {
    const allPrices = await fetchPsxMarketPrices();
    const prices = {};
    for (const symbol of symbols) {
      if (allPrices[symbol] !== undefined) {
        prices[symbol] = allPrices[symbol];
      }
    }
    res.json({ prices });
  } catch {
    res.status(502).json({ error: "Failed to fetch PSX prices." });
  }
});

module.exports = { psxTickerRouter };
