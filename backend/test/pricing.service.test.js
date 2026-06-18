const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const { PricingService } = require('../dist/src/pricing/pricing.service');

describe('PricingService', () => {
  it('keeps international package rates materially higher than local rates', () => {
    const pricing = new PricingService();
    const localQuote = pricing.quotePackageSeat(100000, 2, {
      pricing_market: 'LOCAL_PK',
      display_currency: 'PKR',
    });
    const internationalQuote = pricing.quotePackageSeat(100000, 2, {
      pricing_market: 'INTERNATIONAL',
      display_currency: 'PKR',
    });

    assert.equal(localQuote.base_total_pkr, 200000);
    assert.ok(
      internationalQuote.base_total_pkr >= localQuote.base_total_pkr * 2,
      `expected international total ${internationalQuote.base_total_pkr} to be at least double local total ${localQuote.base_total_pkr}`,
    );
  });

  it('adds facility and handling costs for international itineraries', () => {
    const pricing = new PricingService();
    const localQuote = pricing.quoteItinerary(
      { hotel: 50000, transport: 30000, food: 15000, days: 5 },
      { pricing_market: 'LOCAL_PK', display_currency: 'PKR' },
    );
    const internationalQuote = pricing.quoteItinerary(
      { hotel: 50000, transport: 30000, food: 15000, days: 5 },
      { pricing_market: 'INTERNATIONAL', display_currency: 'PKR' },
    );

    assert.equal(localQuote.breakdown_pkr.security, 0);
    assert.ok(internationalQuote.breakdown_pkr.security > 0);
    assert.ok(internationalQuote.breakdown_pkr.service > localQuote.breakdown_pkr.service);
    assert.ok(internationalQuote.base_total_pkr > localQuote.base_total_pkr * 2);
  });
});
