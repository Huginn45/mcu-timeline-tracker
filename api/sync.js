// api/sync.js - Vercel Serverless Function for Sacred Timeline Cloud Sync (Vercel KV)

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  // Check if KV / Upstash Redis environment variables are configured
  const isConfigured = Boolean(kvUrl && kvToken);

  // Helper functions for KV interaction using Upstash REST protocol
  async function kvGet(key) {
    const url = `${kvUrl}/get/mcu_user:${encodeURIComponent(key)}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });
    if (!response.ok) return null;
    const json = await response.json();
    if (!json.result) return null;
    try {
      return typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
    } catch {
      return json.result;
    }
  }

  async function kvSet(key, value) {
    const url = `${kvUrl}/set/mcu_user:${encodeURIComponent(key)}`;
    const payload = typeof value === 'string' ? value : JSON.stringify(value);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return response.ok;
  }

  // GET: Retrieve timeline progress by sync key
  if (req.method === 'GET') {
    if (!isConfigured) {
      return res.status(503).json({
        configured: false,
        error: "Database is not yet connected. In your Vercel Dashboard, go to 'Storage' -> select 'Upstash' -> 'Redis' to connect."
      });
    }

    const key = (req.query.key || '').trim().toUpperCase();
    if (!key) {
      return res.status(400).json({ error: 'Missing sync key parameter (?key=ST-XXXXX)' });
    }

    try {
      const data = await kvGet(key);
      if (!data) {
        return res.status(404).json({ error: `No timeline found for Sync Key: ${key}` });
      }
      return res.status(200).json({ success: true, key, data });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to retrieve timeline from KV: ' + err.message });
    }
  }

  // POST: Save or update timeline progress
  if (req.method === 'POST') {
    if (!isConfigured) {
      return res.status(503).json({
        configured: false,
        error: "Database is not yet connected. In your Vercel Dashboard, go to 'Storage' -> select 'Upstash' -> 'Redis' to connect."
      });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }

    let key = (body.key || '').trim().toUpperCase();

    // If no key or requested new key, generate a clean 5-char key like ST-8KF29
    if (!key || key === 'NEW') {
      const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
      let randomPart = '';
      for (let i = 0; i < 5; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      key = `ST-${randomPart}`;
    }

    // Validate key format (alphanumeric, dashes, 4-24 chars)
    if (!/^[A-Z0-9_-]{4,24}$/i.test(key)) {
      return res.status(400).json({ error: 'Invalid Sync Key format. Use letters, numbers, and hyphens (4-24 characters).' });
    }

    const payload = {
      watched: Array.isArray(body.data?.watched) ? body.data.watched : [],
      ratings: body.data?.ratings || {},
      notes: body.data?.notes || {},
      datesWatched: body.data?.datesWatched || {},
      updatedAt: new Date().toISOString()
    };

    try {
      const ok = await kvSet(key, payload);
      if (!ok) {
        throw new Error('Vercel KV rejected write request.');
      }
      return res.status(200).json({
        success: true,
        key,
        updatedAt: payload.updatedAt,
        itemCount: payload.watched.length
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to write timeline to KV: ' + err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
