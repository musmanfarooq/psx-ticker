const cheerio = require("cheerio");

const MARKET_SUMMARY_URL = "https://www.psx.com.pk/market-summary/";
const CACHE_TTL_MS = 60_000;

let cache = { prices: null, fetchedAt: 0 };

/**
 * PSX has no official public API. This scrapes PSX's own market-summary
 * page (server-rendered HTML) for full ~690-symbol coverage, unlike
 * third-party aggregators that only mirror the ~100 most-liquid names.
 */
async function fetchPsxMarketPrices() {
  const now = Date.now();
  if (cache.prices && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.prices;
  }

  const response = await fetch(MARKET_SUMMARY_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch PSX market data.");
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const prices = {};
  $("td.dataportal[data-srip]").each((_, symbolCell) => {
    const symbol = $(symbolCell).attr("data-srip")?.trim();
    if (!symbol) return;

    // Current price is the 5th <td> sibling after the symbol cell:
    // LDCP, Open, High, Low, Current.
    const currentText = $(symbolCell).nextAll("td").eq(4).text().trim();
    const price = Number(currentText.replace(/,/g, ""));
    if (Number.isFinite(price)) {
      prices[symbol] = price;
    }
  });

  cache = { prices, fetchedAt: now };
  return prices;
}

module.exports = { fetchPsxMarketPrices };
