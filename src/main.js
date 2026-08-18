import { Actor, log } from 'apify';
import { fetchPrices } from './coingecko.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { coinIds, vsCurrency = 'usd' } = input;

if (!Array.isArray(coinIds) || coinIds.length === 0) {
    throw new Error('Input "coinIds" must be a non-empty array, e.g. ["bitcoin", "ethereum"].');
}

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const PRICE_LOOKUP_EVENT = 'price-lookup';

const results = await fetchPrices({ coinIds, vsCurrency });

for (const result of results) {
    await Actor.pushData(result);
}

await Actor.charge({ eventName: PRICE_LOOKUP_EVENT });

log.info(`Pushed ${results.length} coin record(s)`);

await Actor.exit();
