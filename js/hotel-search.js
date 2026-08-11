const AFFILIATE_PARTNERS = {
    booking: {
        name: "Booking.com",
        baseUrl: "https://www.booking.com/searchresults.html",
        affiliateId: "your_booking_affiliate_id",
        commission: 0.04
    },
    airbnb: {
        name: "Airbnb",
        baseUrl: "https://www.airbnb.com/s",
        affiliateId: "your_airbnb_affiliate_id",
        commission: 0.05
    },
    expedia: {
        name: "Expedia",
        baseUrl: "https://www.expedia.com/Hotel-Search",
        affiliateId: "your_expedia_affiliate_id",
        commission: 0.06
    }
};

function generateAffiliateLink(partner, hotelName) {
    const config = AFFILIATE_PARTNERS[partner];
    if (!config) return null;

    const encoded = encodeURIComponent(hotelName);

    switch(partner) {
        case 'booking':
            return `${config.baseUrl}?ss=${encoded}&aid=${config.affiliateId}`;
        case 'airbnb':
            return `${config.baseUrl}/${encoded}`;
        case 'expedia':
            return `${config.baseUrl}?q-destination=${encoded}&affcid=${config.affiliateId}`;
        default:
            return null;
    }
}

async function searchHotels(query, checkIn, checkOut, guests = 2) {
    const results = [];

    try {
        const [booking, airbnb, expedia] = await Promise.all([
            simulateAPI('booking', query),
            simulateAPI('airbnb', query),
            simulateAPI('expedia', query)
        ]);

        results.push(...booking, ...airbnb, ...expedia);
        results.sort((a, b) => a.price - b.price);

        return results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function simulateAPI(platform, query) {
    const prices = { booking: 100, airbnb: 90, expedia: 110 };
    const basePrice = prices[platform] || 100;

    return [{
        id: `${platform}_${Date.now()}`,
        title: `${query} - ${AFFILIATE_PARTNERS[platform].name}`,
        location: query,
        price: basePrice + Math.floor(Math.random() * 50),
        originalPrice: basePrice + 80,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
        platforms: [platform],
        directLink: generateAffiliateLink(platform, query),
        platform: platform
    }];
}

function compareHotelPrices(hotelName) {
    const platforms = ['booking', 'airbnb', 'expedia'];
    const prices = platforms.map(platform => {
        const basePrice = 80 + Math.floor(Math.random() * 100);
        return {
            platform: platform,
            platformName: AFFILIATE_PARTNERS[platform].name,
            price: basePrice,
            commission: basePrice * AFFILIATE_PARTNERS[platform].commission,
            link: generateAffiliateLink(platform, hotelName)
        };
    });

    prices.sort((a, b) => a.price - b.price);
    prices[0].isBestDeal = true;

    return prices;
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
    generateAffiliateLink,
    calculateEstimatedRevenue
};
