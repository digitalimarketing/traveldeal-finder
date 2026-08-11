// hotel-search.js - Calls YOUR Cloudflare Worker proxy (not StayingAPI directly)

const PROXY_BASE_URL = 'https://restless-snowflake-b84c.digitalimarketingchannel.workers.dev';

const AFFILIATE_PARTNERS = {
    booking: { name: "Booking.com", commission: 0.04 },
    airbnb:  { name: "Airbnb", commission: 0.05 },
    vrbo:    { name: "Vrbo", commission: 0.05 },
    google:  { name: "Google Hotels", commission: 0.03 }
};

// Dynamically extend wait time based on the API's own estimatedSeconds,
// with a 50% buffer, instead of a fixed cutoff that could be too short.
async function pollJob(jobId, initialEstimateSeconds = 60, onProgress = null) {
    const intervalMs = 4000;
    const maxWaitMs = Math.max(initialEstimateSeconds * 1.5, 60) * 1000;
    const start = Date.now();

    while (Date.now() - start < maxWaitMs) {
        const res = await fetch(`${PROXY_BASE_URL}/jobs/${jobId}`);
        const json = await res.json();
        const status = json.data?.status;

        if (status === 'completed') {
            return json.data.result;
        }
        if (status === 'failed') {
            throw new Error('Search job failed on the provider side');
        }

        if (onProgress) {
            const elapsedSec = Math.round((Date.now() - start) / 1000);
            onProgress(elapsedSec, Math.round(maxWaitMs / 1000));
        }

        await new Promise(r => setTimeout(r, intervalMs));
    }
    throw new Error('Search is taking longer than expected. Please try again in a minute.');
}

/**
 * Search hotels worldwide by city/country name.
 */
async function searchHotels(location, checkIn, checkOut, adults = 2, rooms = 1, onProgress = null) {
    if (!location || location.trim().length < 2) return [];

    const url = new URL(`${PROXY_BASE_URL}/search`);
    url.searchParams.append('location', location);
    if (checkIn) url.searchParams.append('checkIn', checkIn);
    if (checkOut) url.searchParams.append('checkOut', checkOut);
    url.searchParams.append('adults', adults);
    url.searchParams.append('rooms', rooms);
    url.searchParams.append('platforms', 'airbnb,booking,vrbo,google');
    url.searchParams.append('limit', '15');
    url.searchParams.append('currency', 'EUR');

    const response = await fetch(url.toString());

    if (response.status === 202) {
        const json = await response.json();
        const jobId = json.data.jobId;
        const estimate = json.data.estimatedSeconds || 60;
        const properties = await pollJob(jobId, estimate, onProgress);
        return transformProperties(properties, 'EUR');
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

async function compareHotelPrices(propertyName, checkIn, checkOut, currency = 'EUR') {
    const url = new URL(`${PROXY_BASE_URL}/price-compare`);
    url.searchParams.append('name', propertyName);
    if (checkIn) url.searchParams.append('checkIn', checkIn);
    if (checkOut) url.searchParams.append('checkOut', checkOut);
    url.searchParams.append('currency', currency);

    const response = await fetch(url.toString());

    if (response.status === 202) {
        const json = await response.json();
        return await pollJob(json.data.jobId, json.data.estimatedSeconds || 60);
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

console.log('Hotel search wired to proxy at:', PROXY_BASE_URL);
