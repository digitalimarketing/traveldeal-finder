// location-autocomplete.js
// Worldwide city/country autocomplete using OpenStreetMap Nominatim (free, no API key)

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

let debounceTimer = null;
let selectedLocation = null;

async function fetchLocationSuggestions(query) {
    if (!query || query.length < 2) return [];

    const url = new URL(NOMINATIM_URL);
    url.searchParams.append('q', query);
    url.searchParams.append('format', 'json');
    url.searchParams.append('addressdetails', '1');
    url.searchParams.append('limit', '8');
    url.searchParams.append('featureType', 'city');

    try {
        const response = await fetch(url.toString(), {
            headers: { 'Accept-Language': (typeof currentLang !== 'undefined' && currentLang === 'fa') ? 'fa' : (typeof currentLang !== 'undefined' ? currentLang : 'en') }
        });
        if (!response.ok) throw new Error('Geocoding error');
        const data = await response.json();

        return data.map(item => {
            const addr = item.address || {};
            const city = addr.city || addr.town || addr.village || addr.municipality || item.name || '';
            const country = addr.country || '';
            const countryCode = (addr.country_code || '').toUpperCase();
            return {
                displayName: item.display_name,
                short: [city, country].filter(Boolean).join(', ') || item.display_name,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                city,
                country,
                countryCode
            };
        });
    } catch (error) {
        console.error('Location suggestion error:', error);
        return [];
    }
}

function renderSuggestions(suggestions) {
    const dropdown = document.getElementById('location-dropdown');
    if (!dropdown) return;

    if (!suggestions.length) {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
        return;
    }

    dropdown.innerHTML = suggestions.map((s, i) => `
        <div class="location-suggestion" data-index="${i}">
            <span class="suggestion-icon">📍</span>
            <span class="suggestion-text">${s.short}</span>
            ${s.countryCode ? `<span class="suggestion-flag">${countryCodeToFlag(s.countryCode)}</span>` : ''}
        </div>
    `).join('');

    dropdown.style.display = 'block';

    dropdown.querySelectorAll('.location-suggestion').forEach((el, i) => {
        el.addEventListener('click', () => selectSuggestion(suggestions[i]));
    });

    window._currentSuggestions = suggestions;
}

function countryCodeToFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '';
    const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

function selectSuggestion(suggestion) {
    selectedLocation = suggestion;
    const input = document.getElementById('hotel-search');
    if (input) input.value = suggestion.short;

    const dropdown = document.getElementById('location-dropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
    }

    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) searchBtn.click();
}

function initLocationAutocomplete() {
    const input = document.getElementById('hotel-search');
    if (!input) return;

    input.addEventListener('input', () => {
        selectedLocation = null;
        clearTimeout(debounceTimer);
        const query = input.value.trim();

        if (query.length < 2) {
            renderSuggestions([]);
            return;
        }

        debounceTimer = setTimeout(async () => {
            const suggestions = await fetchLocationSuggestions(query);
            renderSuggestions(suggestions);
        }, 350);
    });

    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('location-dropdown');
        const wrapper = document.getElementById('search-input-wrapper');
        if (dropdown && wrapper && !wrapper.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    let activeIndex = -1;
    input.addEventListener('keydown', (e) => {
        const dropdown = document.getElementById('location-dropdown');
        const items = dropdown ? dropdown.querySelectorAll('.location-suggestion') : [];
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, items.length - 1);
            updateActiveItem(items, activeIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, 0);
            updateActiveItem(items, activeIndex);
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            selectSuggestion(window._currentSuggestions[activeIndex]);
            activeIndex = -1;
        }
    });

    function updateActiveItem(items, index) {
        items.forEach(el => el.classList.remove('active'));
        if (items[index]) items[index].classList.add('active');
    }
}

function getSelectedLocation() {
    return selectedLocation;
}

document.addEventListener('DOMContentLoaded', initLocationAutocomplete);

window.LocationAutocomplete = { getSelectedLocation, fetchLocationSuggestions };
