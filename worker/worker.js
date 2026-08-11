// worker.js - Cloudflare Worker proxy for StayingAPI
// This solves TWO problems at once:
// 1. CORS - browsers can call THIS worker (which allows CORS), and the worker
//    calls StayingAPI server-to-server (where CORS does not apply at all).
// 2. Security - your live API key lives here, server-side, never shipped to
//    the browser or visible in your site's public source code.
//
// Deploy this for free at https://workers.cloudflare.com (takes ~5 minutes).

const STAYING_API_KEY = 'stay_live_ZAT4QseFfL2-KTtah27N5H1DANnzSAREan1uDjz3-Gs';
const STAYING_API_BASE = 'https://api.stayingapi.com/v1';

// IMPORTANT: after you deploy, replace '*' with your actual GitHub Pages domain
// for better security, e.g. 'https://yourusername.github.io'
const ALLOWED_ORIGIN = '*';

const corsHeaders = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
    async fetch(request) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);
        // Expected: /search?location=Milan,IT&checkIn=...&checkOut=...
        // Expected: /jobs/{jobId}
        // Expected: /price-compare?name=...

        let targetPath = url.pathname; // e.g. /search
        let targetUrl;

        if (targetPath.startsWith('/jobs/')) {
            targetUrl = `${STAYING_API_BASE}${targetPath}`;
        } else if (targetPath === '/search' || targetPath === '/price-compare') {
            targetUrl = `${STAYING_API_BASE}${targetPath}${url.search}`;
        } else {
            return new Response(
                JSON.stringify({ error: 'Unknown proxy route' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        try {
            const apiResponse = await fetch(targetUrl, {
                headers: {
                    'Authorization': `Bearer ${STAYING_API_KEY}`,
                    'Accept': 'application/json'
                }
            });

            const body = await apiResponse.text();

            return new Response(body, {
                status: apiResponse.status,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            });
        } catch (err) {
            return new Response(
                JSON.stringify({ error: 'Proxy error', message: err.message }),
                { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }
    }
};
