const translations = {
    en: {
        "hero.title": "Find the Best Hotel Deals Worldwide",
        "hero.subtitle": "Compare live prices across Booking.com, Airbnb, Vrbo, and Google Hotels",
        "search.placeholder": "Type a city or country, e.g. Milan, Italy",
        "search.button": "Search",
        "search.checkin": "Check-in",
        "search.checkout": "Check-out",
        "results.title": "Hotel Deals",
        "cta.title": "Ready to Save on Your Next Trip?",
        "cta.button": "Install App",
        "footer.text": "TravelDeal Finder - Your smart travel companion",
        "footer.disclosure": "We may earn commission from bookings made through our links"
    },
    it: {
        "hero.title": "Trova le Migliori Offerte Hotel nel Mondo",
        "hero.subtitle": "Confronta i prezzi in tempo reale su Booking.com, Airbnb, Vrbo e Google Hotels",
        "search.placeholder": "Scrivi una città o un paese, es. Milano, Italia",
        "search.button": "Cerca",
        "search.checkin": "Check-in",
        "search.checkout": "Check-out",
        "results.title": "Offerte Hotel",
        "cta.title": "Pronto a Risparmiare sul Prossimo Viaggio?",
        "cta.button": "Installa App",
        "footer.text": "TravelDeal Finder - Il tuo compagno di viaggio intelligente",
        "footer.disclosure": "Potremmo guadagnare una commissione dalle prenotazioni effettuate tramite i nostri link"
    },
    fa: {
        "hero.title": "بهترین تخفیف‌های هتل را در سراسر جهان پیدا کنید",
        "hero.subtitle": "مقایسه قیمت‌های زنده در Booking.com، Airbnb، Vrbo و Google Hotels",
        "search.placeholder": "نام شهر یا کشور را بنویسید، مثلاً میلان، ایتالیا",
        "search.button": "جستجو",
        "search.checkin": "تاریخ ورود",
        "search.checkout": "تاریخ خروج",
        "results.title": "تخفیف‌های هتل",
        "cta.title": "آماده صرفه‌جویی در سفر بعدی هستید؟",
        "cta.button": "نصب برنامه",
        "footer.text": "TravelDeal Finder - همراه هوشمند سفر شما",
        "footer.disclosure": "ما ممکن است از رزروهایی که از طریق لینک‌های ما انجام می‌شود کمیسیون دریافت کنیم"
    }
};

let currentLang = 'en';

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) element.textContent = translations[lang][key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) element.placeholder = translations[lang][key];
    });

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) btn.classList.add('active');
    });

    localStorage.setItem('preferredLang', lang);
}

function initI18n() {
    const savedLang = localStorage.getItem('preferredLang') || 'en';
    setLanguage(savedLang);

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });
}

document.addEventListener('DOMContentLoaded', initI18n);
