// hotel-search.js - Real StayingAPI Integration
// Docs: https://stayingapi.com/docs/endpoints/search

const STAYING_API_KEY = 'stay_live_ZAT4QseFfL2-KTtah27N5H1DANnzSAREan1uDjz3-Gs';
const STAYING_API_BASE = 'https://api.stayingapi.com/v1';

const AFFILIATE_PARTNERS = {
    booking: { name: "Booking.com", commission: 0.04 },
    airbnb:  { name: "Airbnb", commission: 0.05 },
    vrbo:    { name: "Vrbo", commission: 0.05 },
    google:  { name: "Google Hotels", commission: 0.03 }
};

// Poll an async job (live keys return 202 + jobId while scraping)
async function pollJob(jobId, { intervalMs = 3000, maxWaitMs = 120000 } = {}) {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
        const res = await fetch(`${STAYING_API_BASE}/jobs/${jobId}`, {
            headers: { 'Authorization': `Bearer ${STAYING_API_KEY}` }
        });
        const json = await res.json();
        if (json.data?.status === 'completed') {
            return json.data.result;
        }
        if (json.data?.status === 'failed') {
            throw new Error('Search job failed');
        }
        await new Promise(r => setTimeout(r, intervalMs));
    }
    throw new Error('Search timed out - please try again');
}

/**
 * Search hotels worldwide by city/country name.
 * @param {string} location  e.g. "Milan, IT" or "Tokyo, Japan"
 */
async function searchHotels(location, checkIn, checkOut, adults = 2, rooms = 1) {
    if (!location || location.trim().length < 2) return [];

    const url = new URL(`${STAYING_API_BASE}/search`);
    url.searchParams.append('location', location);
    if (checkIn) url.searchParams.append('checkIn', checkIn);
    if (checkOut) url.searchParams.append('checkOut', checkOut);
    url.searchParams.append('adults', adults);
    url.searchParams.append('rooms', rooms);
    url.searchParams.append('platforms', 'airbnb,booking,vrbo,google');
    url.searchParams.append('limit', '15');
    url.searchParams.append('currency', 'EUR');

    const response = await fetch(url.toString(), {
        headers: {
            'Authorization': `Bearer ${STAYING_API_KEY}`,
            'Accept': 'application/json'
        }
    });

    if (response.status === 202) {
        // Live key: real scrape in progress, poll for result
        const json = await response.json();
        const jobId = json.data.jobId;
        const properties = await pollJob(jobId);
        return transformProperties(properties, url.searchParams.get('currency'));
    }

    if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error?.message || `API error ${response.status}`);
    }

    const json = await response.json();
    return transformProperties(json.data, json.meta?.currency || 'EUR');
}

function transformProperties(properties, currency = 'EUR') {
    if (!Array.isArray(properties)) return [];

    return properties.map(p => {
        const price = p.price || {};
        const nightly = price.nightlyPrice ?? null;
        const total = price.totalPrice ?? null;

        return {
            id: p.id,
            title: p.name || 'Property',
            location: [p.location?.city, p.location?.country].filter(Boolean).join(', ') || 'Unknown',
            price: nightly ?? total ?? null,
            priceLabel: nightly != null ? `${currency} ${Math.round(nightly)}/night`
                       : total != null ? `${currency} ${Math.round(total)} total`
                       : 'Check price',
            image: (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
            platform: p.platform,
            platformName: AFFILIATE_PARTNERS[p.platform]?.name || p.platform,
            directLink: p.url || '#',
            rating: p.guestRating ?? null,
            ratingScale: p.ratingScale ?? 5,
            reviews: p.reviewCount ?? 0,
            amenities: p.amenities || []
        };
    }).filter(h => h.title);
}

// Compare cross-OTA prices for one exact property name
async function compareHotelPrices(propertyName, checkIn, checkOut, currency = 'EUR') {
    const url = new URL(`${STAYING_API_BASE}/price-compare`);
    url.searchParams.append('name', propertyName);
    if (checkIn) url.searchParams.append('checkIn', checkIn);
    if (checkOut) url.searchParams.append('checkOut', checkOut);
    url.searchParams.append('currency', currency);

    const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${STAYING_API_KEY}` }
    });

    if (response.status === 202) {
        const json = await response.json();
        return await pollJob(json.data.jobId);
    }
    if (!response.ok) throw new Error('Price comparison failed');

    const json = await response.json();
    return json.data;
}

function trackAffiliateClick(hotelId, platform, price) {
    console.log('Affiliate click:', { hotel_id: hotelId, platform, price, timestamp: new Date().toISOString() });
}

function calculateEstimatedRevenue(clicks, conversionRate = 0.03, avgCommission = 5) {
    return clicks * conversionRate * avgCommission;
}

window.HotelSearch = {
    searchHotels,
    compareHotelPrices,
    trackAffiliateClick,
    calculateEstimatedRevenue
};

console.log('StayingAPI integration ready with LIVE key - real worldwide data enabled.');
