# TravelDeal Finder - CORS Fix (Proxy Required)

## Why you got "Error: Failed to fetch"

Your browser was calling `api.stayingapi.com` directly from JavaScript. StayingAPI's
API does not send CORS headers for direct browser access - it's built for
server-to-server calls, their SDK, or their MCP agent server, not for a public
website's frontend JS to call it directly.

When a server doesn't return the right CORS headers, the browser blocks the response
before your code ever sees it. `fetch()` then throws exactly "Failed to fetch" - no
status code, no error body. That's not a bug in the search code itself; it's a
browser security rule that can only be worked around with a proxy.

## The fix: a free Cloudflare Worker proxy

A tiny serverless proxy sits between your PWA and StayingAPI:

Browser -> Your Worker (CORS allowed) -> StayingAPI (server-to-server, CORS doesn't apply) -> back to browser

This also fixes a security issue from before: your live API key now lives in the
Worker, not in your public website's source code.

## SETUP - Do this once (10 minutes)

### Step 1: Create a Cloudflare account (free)

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up (no credit card needed for Workers free tier)

### Step 2: Create the Worker

1. In the Cloudflare dashboard, go to Workers & Pages
2. Click Create > Create Worker
3. Give it a name, e.g. `traveldeal-proxy`
4. Click Deploy (it deploys a default "Hello World" worker first - that's fine)
5. Click Edit code
6. Delete all the default code
7. Open `worker/worker.js` from this zip, copy ALL of it
8. Paste it into the Cloudflare editor
9. Click Save and Deploy

### Step 3: Get your Worker URL

After deploying, Cloudflare shows you a URL like:
```
https://traveldeal-proxy.YOUR-SUBDOMAIN.workers.dev
```
Copy this URL exactly.

### Step 4: Paste the Worker URL into your app

1. Open `js/hotel-search.js`
2. Find this line near the top:
   ```javascript
   const PROXY_BASE_URL = 'PASTE_YOUR_WORKER_URL_HERE';
   ```
3. Replace it with your actual Worker URL (no trailing slash):
   ```javascript
   const PROXY_BASE_URL = 'https://traveldeal-proxy.YOUR-SUBDOMAIN.workers.dev';
   ```
4. Save

### Step 5: Re-upload to GitHub

Upload the updated `js/hotel-search.js` to your GitHub repo (replace the old file).
Wait 1-2 minutes for GitHub Pages to redeploy, then test a search again.

## Testing the Worker directly (optional, to confirm it works)

Open this URL in your browser (replace with your actual worker URL):
```
https://traveldeal-proxy.YOUR-SUBDOMAIN.workers.dev/search?location=Milan,IT&adults=2
```
You should get back JSON, either an immediate result or a `202` with a `jobId`.
If you see JSON here but your PWA still fails, double check `PROXY_BASE_URL` in
`js/hotel-search.js` matches this URL exactly.

## Security: lock down CORS origin (recommended after testing)

In `worker/worker.js`, this line currently allows any website to use your worker:
```javascript
const ALLOWED_ORIGIN = '*';
```
Once your GitHub Pages site is live, change it to your actual domain:
```javascript
const ALLOWED_ORIGIN = 'https://yourusername.github.io';
```
Redeploy the Worker after this change (Save and Deploy again in the dashboard).

## Files in this zip

- `worker/worker.js` - the Cloudflare Worker proxy (deploy this to Cloudflare, not GitHub)
- `index.html`, `css/style.css`, `js/*.js` - your PWA (deploy this to GitHub Pages)
- `manifest.json`, `service-worker.js` - PWA install + offline support
- `assets/icon.svg` - app icon (convert to PNG before deploying)

## Credits and billing (StayingAPI)

| Endpoint | Cost |
|---|---|
| `/v1/search` | Airbnb: 2 credits/result, other platforms: 1 credit/result, min 5/platform |
| `/v1/price-compare` | 30 credits/call |
| `/v1/jobs/{jobId}` (polling) | Always free |
| Failed/empty/blocked calls | Always free |

Check remaining credits in your StayingAPI dashboard.
