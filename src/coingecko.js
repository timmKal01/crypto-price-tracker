const BASE_URL = 'https://api.coingecko.com/api/v3/coins/markets';

/** The free public tier is shared/rate-limited and occasionally 429s under load — retry with
 *  backoff rather than ever treating a throttle as "no data." */
async function fetchWithRetry(url, { retries = 4, baseDelayMs = 1500 } = {}) {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, { headers: { Connection: 'close' } });
            if (res.ok) return res;
            if (![429, 500, 502, 503, 504].includes(res.status)) {
                throw new Error(`CoinGecko API request failed: ${res.status} ${res.statusText}`);
            }
            lastErr = new Error(`CoinGecko API returned ${res.status}`);
        } catch (err) {
            lastErr = err;
        }
        if (attempt < retries) {
            await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** attempt));
        }
    }
    throw lastErr;
}

export async function fetchPrices({ coinIds, vsCurrency }) {
    const ids = coinIds.map((c) => c.trim().toLowerCase());
    const url = new URL(BASE_URL);
    url.searchParams.set('vs_currency', vsCurrency.trim().toLowerCase());
    url.searchParams.set('ids', ids.join(','));
    url.searchParams.set('price_change_percentage', '24h,7d');

    const res = await fetchWithRetry(url);
    const coins = await res.json();

    const byId = new Map(coins.map((c) => [c.id, c]));
    return ids.map((id) => {
        const c = byId.get(id);
        if (!c) return { coinId: id, found: false };
        return {
            coinId: c.id,
            found: true,
            symbol: c.symbol,
            name: c.name,
            vsCurrency: vsCurrency.trim().toLowerCase(),
            currentPrice: c.current_price,
            marketCap: c.market_cap,
            marketCapRank: c.market_cap_rank,
            totalVolume: c.total_volume,
            high24h: c.high_24h,
            low24h: c.low_24h,
            priceChangePercentage24h: c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h,
            priceChangePercentage7d: c.price_change_percentage_7d_in_currency ?? null,
            circulatingSupply: c.circulating_supply,
            totalSupply: c.total_supply,
            maxSupply: c.max_supply,
            allTimeHigh: c.ath,
            allTimeHighDate: c.ath_date,
            allTimeLow: c.atl,
            allTimeLowDate: c.atl_date,
            lastUpdated: c.last_updated,
        };
    });
}
