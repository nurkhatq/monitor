// Next.js API route: proxies all /api/proxy/* → VPS backend
// Solves mixed-content (HTTPS Vercel → HTTP VPS)
const BACKEND = process.env.BACKEND_URL || 'http://194.238.41.18:3001';

async function handler(req, { params }) {
  const path  = (await params).path.join('/');
  const url   = new URL(req.url);
  const qs    = url.search || '';
  const target = `${BACKEND}/api/${path}${qs}`;

  const headers = { 'Content-Type': 'application/json' };
  const opts = { method: req.method, headers };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await req.text();
    if (body) opts.body = body;
  }

  try {
    const res  = await fetch(target, opts);
    const data = await res.text();
    return new Response(data, {
      status:  res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 502 });
  }
}

export const GET     = handler;
export const POST    = handler;
export const PUT     = handler;
export const PATCH   = handler;
export const DELETE  = handler;
export const OPTIONS = () => new Response(null, {
  status: 204,
  headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': '*', 'Access-Control-Allow-Headers': '*' },
});

export const dynamic = 'force-dynamic';
