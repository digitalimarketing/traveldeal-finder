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
        .then(registration => console.log('ServiceWorker registered'))
        .catch(err => console.log('ServiceWorker failed: ', err));
}

const sampleDeals = [
    {
        id: 1,
        title: "Grand Hotel Milano",
        location: "Milan, Italy",
        price: 120,
        originalPrice: 180,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
        platforms: ["booking", "direct"],
        directLink: "https://booking.com"
    },
    {
        id: 2,
        title: "Rome Luxury Suites",
        location: "Rome, Italy",
        price: 95,
        originalPrice: 140,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400",
        platforms: ["airbnb", "expedia"],
        directLink: "https://airbnb.com"
    },
    {
        id: 3,
        title: "Venice Canal View",
        location: "Venice, Italy",
        price: 150,
        originalPrice: 220,
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400",
        platforms: ["booking", "direct"],
        directLink: "https://booking.com"
    }
];

function renderDeals(deals) {
    const container = document.getElementById('deals-container');
    const resultsSection = document.getElementById('results-section');

    if (!container || !resultsSection) return;

    container.innerHTML = '';

    deals.forEach(deal => {
        const card = document.createElement('div');
        card.className = 'deal-card';

        const platformsHtml = deal.platforms.map(p => {
            const names = { 'booking': 'Booking.com', 'airbnb': 'Airbnb', 'expedia': 'Expedia', 'direct': 'Direct' };
            return `<span class="platform-tag">${names[p] || p}</span>`;
        }).join('');

        const viewDealText = translations[currentLang]['button.viewDeal'] || 'View Deal';

        card.innerHTML = `
            <img src="${deal.image}" alt="${deal.title}" class="deal-image">
            <div class="deal-info">
                <h4 class="deal-title">${deal.title}</h4>
                <p style="color: #666; margin-bottom: 10px;">${deal.location}</p>
                <div class="deal-price">
                    <span class="price-current">€${deal.price}</span>
                    <span class="price-original">€${deal.originalPrice}</span>
                </div>
                <div class="deal-platforms">${platformsHtml}</div>
                <button class="deal-btn" onclick="window.open('${deal.directLink}', '_blank')">
                    ${viewDealText}
                </button>
            </div>
        `;

        container.appendChild(card);
    });

    resultsSection.style.display = 'block';
}

const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('hotel-search');

if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            renderDeals(sampleDeals);
            document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBtn.click();
    });
}

console.log('TravelDeal Finder initialized');
