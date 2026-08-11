// app.js - Main application logic (wired to real StayingAPI search)

let deferredPrompt = null;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.style.display = 'inline-block';
});

if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
            installBtn.style.display = 'none';
        }
    });
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('ServiceWorker registered'))
        .catch(err => console.log('ServiceWorker failed:', err));
}

function renderDeals(deals) {
    const container = document.getElementById('deals-container');
    const resultsSection = document.getElementById('results-section');
    if (!container || !resultsSection) return;

    if (!deals.length) {
        container.innerHTML = `<p class="no-results">No properties found. Try a different city or country.</p>`;
        resultsSection.style.display = 'block';
        return;
    }

    container.innerHTML = deals.map(deal => {
        const ratingText = deal.rating != null
            ? `Rating: ${deal.rating}/${deal.ratingScale} (${deal.reviews} reviews)`
            : 'No rating yet';

        return `
            <div class="deal-card">
                <img src="${deal.image}" alt="${deal.title}" class="deal-image" loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'">
                <div class="deal-info">
                    <h4 class="deal-title">${deal.title}</h4>
                    <p class="deal-location">${deal.location}</p>
                    <p class="deal-rating">${ratingText}</p>
                    <div class="deal-price">
                        <span class="price-current">${deal.priceLabel}</span>
                    </div>
                    <div class="deal-platforms">
                        <span class="platform-tag">${deal.platformName}</span>
                    </div>
                    <button class="deal-btn" onclick="window.HotelSearch.trackAffiliateClick('${deal.id}','${deal.platform}',${deal.price || 0}); window.open('${deal.directLink}', '_blank')">
                        View on ${deal.platformName}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    resultsSection.style.display = 'block';
}

function showLoading() {
    const container = document.getElementById('deals-container');
    const resultsSection = document.getElementById('results-section');
    if (!container || !resultsSection) return;
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Searching Booking.com, Airbnb, Vrbo and Google Hotels...</p>
            <p class="loading-note">Live searches can take up to a minute the first time.</p>
        </div>
    `;
    resultsSection.style.display = 'block';
}

function showError(message) {
    const container = document.getElementById('deals-container');
    const resultsSection = document.getElementById('results-section');
    if (!container || !resultsSection) return;
    container.innerHTML = `<p class="error-state">Error: ${message}</p>`;
    resultsSection.style.display = 'block';
}

const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('hotel-search');

async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    showLoading();
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });

    try {
        const checkInEl = document.getElementById('checkin-date');
        const checkOutEl = document.getElementById('checkout-date');
        const checkIn = checkInEl?.value || null;
        const checkOut = checkOutEl?.value || null;

        const results = await window.HotelSearch.searchHotels(query, checkIn, checkOut, 2, 1);
        renderDeals(results);
    } catch (error) {
        console.error('Search error:', error);
        showError(error.message || 'Something went wrong. Please try again.');
    }
}

if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

console.log('App initialized - connected to real StayingAPI search');
