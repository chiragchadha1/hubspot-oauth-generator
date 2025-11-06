export function vercelJsonTemplate(config) {
  // Environment variables should be set in Vercel Dashboard
  // Settings → Environment Variables (not in vercel.json)
  return JSON.stringify({
    version: 2
  }, null, 2);
}

