#!/usr/bin/env node
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { psxTickerRouter } = require("./router");
const { fetchPsxMarketPrices } = require("./psx-market-data");

/**
 * Only auto-starts a standalone server when this file is run directly
 * (`npx psx-ticker`, `npm start`) — not when required as a library, so
 * `require("psx-ticker")` in someone else's app doesn't unexpectedly bind
 * a port as a side effect.
 */
if (require.main === module) {
  const app = express();
  app.use(cors());
  app.use(psxTickerRouter);

  const PORT = process.env.PSX_TICKER_PORT || 3888;
  app.listen(PORT, () => {
    console.log(`psx-ticker listening on port ${PORT}`);
  });
}

module.exports = { psxTickerRouter, fetchPsxMarketPrices };
