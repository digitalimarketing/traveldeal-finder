# TravelDeal Finder - Live Version (Real Worldwide Search)

## API Key Status: LIVE

This build uses your LIVE StayingAPI key:
`stay_live_ZAT4QseFfL2-KTtah27N5H1DANnzSAREan1uDjz3-Gs`

Unlike the sandbox key (`stay_test_...`), a live key returns real, dynamic data that
changes based on the actual city/country you search and the dates you pick.

## How search works

1. Type 2+ characters in the search box (e.g. "Tok" for Tokyo)
2. A dropdown appears with real worldwide city/country matches (powered by free
   OpenStreetMap Nominatim geocoding - no key required)
3. Click a suggestion (or press Enter) - it fills the box and searches automatically
4. The app calls StayingAPI's `/v1/search` endpoint with your live key
5. Live searches are asynchronous: the API responds with `202 + jobId` while it
   scrapes Booking.com, Airbnb, Vrbo, and Google Hotels in real time
6. The app polls `/v1/jobs/{jobId}` every 3 seconds until results are ready
   (can take up to ~1 minute on the first search for a new city - this is normal)

## Credits and billing

Live searches consume credits from your StayingAPI account:

| Endpoint | Cost |
|---|---|
| `/v1/search` | Airbnb: 2 credits/result, other platforms: 1 credit/result, minimum 5/platform |
| `/v1/price-compare` | 30 credits/call |
| `/v1/listing/{platform}/{id}` | 3 credits |
| `/v1/jobs/{jobId}` (polling) | Always free |
| Failed/empty/blocked calls | Always free |

Check your remaining credit balance in your StayingAPI dashboard: https://stayingapi.com

## Files

- `index.html` - main app markup, autocomplete dropdown, check-in/check-out date pickers
- `js/hotel-search.js` - StayingAPI integration with your live key, async job polling
- `js/location-autocomplete.js` - worldwide city/country autocomplete (Nominatim)
- `js/app.js` - search flow, loading/error states, deal rendering
- `js/i18n.js` - English / Italian / Persian translations
- `css/style.css` - all styling including autocomplete dropdown, spinner, RTL support
- `manifest.json` - PWA manifest
- `service-worker.js` - offline caching, excludes live API calls from cache

## Deploying

1. Extract this zip
2. Add `assets/icon-192.png` and `assets/icon-512.png` (convert from `assets/icon.svg`
   at https://cloudconvert.io/svg-to-png)
3. Upload all files to a GitHub repository (public, for GitHub Pages)
4. Settings > Pages > Deploy from branch `main` / root
5. Open the live URL and search any city worldwide

## Security note

Your live API key is embedded directly in `js/hotel-search.js`, which is visible to
anyone who views your site's source code. This is fine for early testing and personal
use, but before scaling to real traffic, move the API call behind a small backend
(e.g. a Cloudflare Worker or Node.js endpoint) so the key is never exposed publicly.
Otherwise your credits could be drained by someone else copying the key.
