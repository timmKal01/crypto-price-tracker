# Crypto Price Tracker

Look up current price, market cap, 24h/7d change, volume, supply, and
all-time high/low for any cryptocurrency, via the public [CoinGecko
API](https://www.coingecko.com/en/api).

Built for trading, portfolio, and market-research tools that need a
quick price/market-cap snapshot without wiring up a full exchange API.

## Input

```json
{
  "coinIds": ["bitcoin", "ethereum"],
  "vsCurrency": "usd"
}
```

| Field | Type | Description |
|---|---|---|
| `coinIds` | array of strings (required) | One or more CoinGecko coin IDs (not ticker symbols), e.g. `"bitcoin"`, `"ethereum"`, `"solana"`, `"dogecoin"`. Find the exact ID on a coin's CoinGecko page URL. |
| `vsCurrency` | string | The fiat or crypto currency to price against, e.g. `"usd"`, `"eur"`, `"btc"`. Default `"usd"`. |

## Output

One record per requested coin:

```json
{
  "coinId": "bitcoin",
  "found": true,
  "symbol": "btc",
  "name": "Bitcoin",
  "vsCurrency": "usd",
  "currentPrice": 64154,
  "marketCap": 1287658233263,
  "marketCapRank": 1,
  "totalVolume": 21109041334,
  "high24h": 64516,
  "low24h": 63246,
  "priceChangePercentage24h": 1.8,
  "priceChangePercentage7d": 0.3,
  "circulatingSupply": 20071518,
  "totalSupply": 20071518,
  "maxSupply": 21000000,
  "allTimeHigh": 126080,
  "allTimeHighDate": "2025-10-06T10:57:42.000Z",
  "allTimeLow": 67.81,
  "allTimeLowDate": "2013-07-05T16:00:00.000Z",
  "lastUpdated": "2026-08-18T02:13:30.000Z"
}
```

An unrecognized coin ID returns `{ "coinId": "...", "found": false }`
for that entry rather than being silently dropped — CoinGecko's own
API omits unknown IDs from its response with no error, so this actor
detects the gap and reports it explicitly.

## How it works

Direct calls to the public [CoinGecko
API](https://www.coingecko.com/en/api/documentation) — no proxy, no
key, no scraping. The free public tier is shared and rate-limited; the
actor retries with backoff on a throttle before surfacing a real
error.

## Pricing note

Billed per **lookup** (one run), not per coin returned — one charge
whether you request 1 coin or 20.
