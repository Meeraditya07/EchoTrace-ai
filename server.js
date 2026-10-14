import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = '0.0.0.0';
const DIST_DIR = path.resolve(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json',
  '.wasm': 'application/wasm'
};

const COMPRESSIBLE_TYPES = new Set([
  'text/html; charset=utf-8',
  'text/javascript; charset=utf-8',
  'text/css; charset=utf-8',
  'application/json; charset=utf-8',
  'image/svg+xml',
  'text/plain; charset=utf-8',
  'application/json'
]);

function sendResponse(req, res, statusCode, contentType, content, isAsset = false) {
  const headers = {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };

  if (isAsset) {
    // Vite hashed static assets are immutable and safe to cache for 1 year
    headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  } else if (contentType.startsWith('text/html')) {
    // HTML should always revalidate so updates are fetched immediately
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
  }

  // Handle compression if supported and content is compressible
  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (COMPRESSIBLE_TYPES.has(contentType) && content.length > 512) {
    if (acceptEncoding.includes('gzip')) {
      headers['Content-Encoding'] = 'gzip';
      headers['Vary'] = 'Accept-Encoding';
      zlib.gzip(content, (err, compressed) => {
        if (err) {
          headers['Content-Length'] = Buffer.byteLength(content);
          res.writeHead(statusCode, headers);
          if (req.method !== 'HEAD') res.end(content);
          else res.end();
          return;
        }
        headers['Content-Length'] = compressed.length;
        res.writeHead(statusCode, headers);
        if (req.method !== 'HEAD') res.end(compressed);
        else res.end();
      });
      return;
    } else if (acceptEncoding.includes('deflate')) {
      headers['Content-Encoding'] = 'deflate';
      headers['Vary'] = 'Accept-Encoding';
      zlib.deflate(content, (err, compressed) => {
        if (err) {
          headers['Content-Length'] = Buffer.byteLength(content);
          res.writeHead(statusCode, headers);
          if (req.method !== 'HEAD') res.end(content);
          else res.end();
          return;
        }
        headers['Content-Length'] = compressed.length;
        res.writeHead(statusCode, headers);
        if (req.method !== 'HEAD') res.end(compressed);
        else res.end();
      });
      return;
    }
  }

  headers['Content-Length'] = Buffer.byteLength(content);
  res.writeHead(statusCode, headers);
  if (req.method !== 'HEAD') {
    res.end(content);
  } else {
    res.end();
  }
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain', 'Allow': 'GET, HEAD' });
    res.end('Method Not Allowed');
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Cloud Run / container health check endpoint
  if (pathname === '/healthz' || pathname === '/health') {
    const healthData = JSON.stringify({
      status: 'ok',
      service: 'echotrace-ai',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
    sendResponse(req, res, 200, 'application/json; charset=utf-8', Buffer.from(healthData));
    return;
  }

  // Prevent directory traversal attacks
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(DIST_DIR, safePath);

  // Ensure resolved path is strictly within DIST_DIR
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      fs.readFile(filePath, (readErr, data) => {
        if (readErr) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const isAsset = pathname.startsWith('/assets/');
        sendResponse(req, res, 200, contentType, data, isAsset);
      });
      return;
    }

    // If request has a file extension or is in /assets/, treat as 404
    const hasExtension = path.extname(pathname) !== '';
    if (hasExtension || pathname.startsWith('/assets/')) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File Not Found');
      return;
    }

    // SPA routing fallback: serve dist/index.html for client-side navigation
    const indexPath = path.join(DIST_DIR, 'index.html');
    fs.readFile(indexPath, (indexErr, indexData) => {
      if (indexErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Build not found. Please run "npm run build" first.');
        return;
      }
      sendResponse(req, res, 200, 'text/html; charset=utf-8', indexData, false);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[EchoTrace AI] Production server listening on http://${HOST}:${PORT}`);
  console.log(`[EchoTrace AI] Serving static files from: ${DIST_DIR}`);
});

// Graceful shutdown handling for Cloud Run SIGTERM / SIGINT signals
const shutdown = (signal) => {
  console.log(`[EchoTrace AI] Received ${signal}. Closing server gracefully...`);
  server.close(() => {
    console.log('[EchoTrace AI] Closed out remaining connections.');
    process.exit(0);
  });
  // Force shutdown if connections do not close in 5 seconds
  setTimeout(() => {
    console.error('[EchoTrace AI] Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
