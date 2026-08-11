const translations = {
    en: {
        "hero.title": "Find the Best Hotel Deals",
        "hero.subtitle": "Compare prices across Booking.com, Airbnb, Expedia, and direct hotel websites",
        "search.placeholder": "Enter hotel name or destination...",
        "search.button": "Search",
        "features.compare.title": "Compare Prices",
        "features.compare.desc": "View deals side by side across platforms",
        "features.direct.title": "Direct Booking",
        "features.direct.desc": "Book directly and skip extra fees",
        "features.deals.title": "Exclusive Deals",
        "features.deals.desc": "Access negotiated rates just for you",
        "results.title": "Hotel Deals",
        "cta.title": "Ready to Save on Your Next Trip?",
        "cta.button": "Install App",
        "footer.text": "TravelDeal Finder - Your smart travel companion",
        "footer.disclosure": "We may earn commission from bookings made through our links",
        "button.viewDeal": "View Deal"
    },
    it: {
        "hero.title": "Trova le Migliori Offerte Hotel",
        "hero.subtitle": "Confronta i prezzi su Booking.com, Airbnb, Expedia e siti diretti degli hotel",
        "search.placeholder": "Inserisci nome hotel o destinazione...",
        "search.button": "Cerca",
        "features.compare.title": "Confronta Prezzi",
        "features.compare.desc": "Visualizza le offerte fianco a fianco tra piattaforme",
        "features.direct.title": "Prenotazione Diretta",
        "features.direct.desc": "Prenota direttamente e salta le commissioni",
        "features.deals.title": "Offerte Esclusive",
        "features.deals.desc": "Accedi a tariffe negoziate solo per te",
        "results.title": "Offerte Hotel",
        "cta.title": "Pronto a Risparmiare sul Prossimo Viaggio?",
        "cta.button": "Installa App",
        "footer.text": "TravelDeal Finder - Il tuo compagno di viaggio intelligente",
        "footer.disclosure": "Potremmo guadagnare una commissione dalle prenotazioni effettuate tramite i nostri link",
        "button.viewDeal": "Vedi Offerta"
    },
    fa: {
        "hero.title": "بهترین تخفیف‌های هتل را پیدا کنید",
        "hero.subtitle": "مقایسه قیمت‌ها در Booking.com، Airbnb، Expedia و وبسایت‌های مستقیم هتل",
        "search.placeholder": "نام هتل یا مقصد را وارد کنید...",
        "search.button": "جستجو",
        "features.compare.title": "مقایسه قیمت",
        "features.compare.desc": "مشاهده تخفیف‌ها در پلتفرم‌های مختلف",
        "features.direct.title": "رزرو مستقیم",
        "features.direct.desc": "مستقیم رزرو کنید و از کارمزدها جلوگیری کنید",
        "features.deals.title": "تخفیف‌های ویژه",
        "features.deals.desc": "دسترسی به نرخ‌های مذاکره شده فقط برای شما",
        "results.title": "تخفیف‌های هتل",
        "cta.title": "آماده صرفه‌جویی در سفر بعدی هستید؟",
        "cta.button": "نصب برنامه",
        "footer.text": "TravelDeal Finder - همراه هوشمند سفر شما",
        "footer.disclosure": "ما ممکن است از رزروهایی که از طریق لینک‌های ما انجام می‌شود کمیسیون دریافت کنیم",
        "button.viewDeal": "مشاهده تخفیف"
    }
};

let currentLang = 'en';

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });

    localStorage.setItem('preferredLang', lang);
}

function initI18n() {
    const savedLang = localStorage.getItem('preferredLang') || 'en';
    setLanguage(savedLang);

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });
}

document.addEventListener('DOMContentLoaded', initI18n);
