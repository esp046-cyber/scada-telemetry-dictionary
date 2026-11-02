// Optional sync API. The app works fully offline without it. Auth: Bearer token from env API_TOKEN.
const http = require('http'), fs = require('fs'), path = require('path');
const TOKEN = process.env.API_TOKEN;
if (!TOKEN) { console.error('Set API_TOKEN before starting.'); process.exit(1); }
const sanitize = (s) => String(s).replace(/[<>"'`]/g, '').slice(0, 100);
const terms = JSON.parse(fs.readFileSync(path.join(__dirname, '../database/terms.json'), 'utf8'));
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname !== '/api/terms') { res.writeHead(404); return res.end(); }
  if (req.headers.authorization !== `Bearer ${TOKEN}`) { res.writeHead(401); return res.end('Unauthorized'); }
  const q = sanitize(url.searchParams.get('q') || '').toLowerCase();
  const out = q ? terms.filter(t => (t.term + t.summary).toLowerCase().includes(q)) : terms;
  res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(out));
}).listen(process.env.PORT || 3000);
