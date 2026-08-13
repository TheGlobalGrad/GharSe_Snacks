import { createReadStream, existsSync } from 'node:fs';
import { createServer, request as httpRequest } from 'node:http';
import { extname, join, normalize } from 'node:path';

const port = Number(process.env.PORT || 3000);
const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
const mimeTypes = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
    '.ico': 'image/x-icon', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg',
    '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.xml': 'application/xml; charset=utf-8'
};

function sendJson(res, status, value) {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(value));
}

function proxyToBackend(req, res) {
    const url = new URL(req.url, backendUrl);
    const proxyReq = httpRequest({ hostname: url.hostname, port: url.port, path: url.pathname + url.search, method: req.method, headers: { ...req.headers, host: url.host } }, proxyRes => {
        res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
        proxyRes.pipe(res);
    });
    proxyReq.on('error', error => sendJson(res, 502, { error: `Backend service is not available: ${error.message}` }));
    req.pipe(proxyReq);
}

createServer((req, res) => {
    if (req.url?.startsWith('/api/')) return proxyToBackend(req, res);
    if (!['GET', 'HEAD'].includes(req.method || '')) return sendJson(res, 405, { error: 'Method not allowed.' });
    const urlPath = req.url === '/' ? '/index.html' : decodeURIComponent((req.url || '').split('?')[0]);
    const filePath = normalize(join(process.cwd(), urlPath));
    if (!filePath.startsWith(process.cwd()) || !existsSync(filePath)) return sendJson(res, 404, { error: 'Not found.' });
    res.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream' });
    if (req.method === 'HEAD') return res.end();
    createReadStream(filePath).pipe(res);
}).listen(port, () => console.log(`GharSe is running at http://localhost:${port}`));
