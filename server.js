const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const zlib = require('zlib');

const PORT = process.env.PORT || 8000;

const SECURITY_HEADERS = {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
};

function withSecurityHeaders(headers) {
  return { ...SECURITY_HEADERS, ...headers };
}

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

function getMimeType(filePath) {
  const base = path.basename(filePath).toLowerCase();
  if (base === 'feed.xml') return 'application/atom+xml; charset=utf-8';
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

function serveFile(req, res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, withSecurityHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }));
      res.end('File not found');
      return;
    }

    const mimeType = getMimeType(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    // Compress text-based files (HTML, CSS, JS, JSON)
    const shouldCompress = ['.html', '.css', '.js', '.json', '.svg'].includes(ext);
    
    if (shouldCompress) {
      // Check if client accepts gzip
      const acceptEncoding = req.headers['accept-encoding'] || '';
      if (acceptEncoding.includes('gzip')) {
        zlib.gzip(data, (err, compressed) => {
          if (err) {
            res.writeHead(200, withSecurityHeaders({ 'Content-Type': mimeType }));
            res.end(data);
            return;
          }
          res.writeHead(200, withSecurityHeaders({
            'Content-Type': mimeType,
            'Content-Encoding': 'gzip',
            'Cache-Control': 'public, max-age=31536000'
          }));
          res.end(compressed);
        });
        return;
      }
    }
    
    res.writeHead(200, withSecurityHeaders({
      'Content-Type': mimeType,
      'Cache-Control': shouldCompress ? 'public, max-age=31536000' : 'public, max-age=86400'
    }));
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Handle review URLs - redirect /review/:id to /review/:id.html
  const reviewMatch = pathname.match(/^\/review\/(\d+)$/);
  if (reviewMatch) {
    const reviewId = reviewMatch[1];
    const reviewFile = path.join(__dirname, 'review', `${reviewId}.html`);
    
    // Check if the review file exists
        fs.access(reviewFile, fs.constants.F_OK, (err) => {
          if (err) {
            // Return a proper 404 HTML page
            const notFoundHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Review Not Found - Snarkflix</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #e74c3c; }
        a { color: #3498db; text-decoration: none; }
    </style>
</head>
<body>
    <h1>Review Not Found</h1>
    <p>The review you're looking for doesn't exist.</p>
    <p><a href="/">← Back to Snarkflix</a></p>
</body>
</html>`;
            res.writeHead(404, withSecurityHeaders({ 'Content-Type': 'text/html; charset=utf-8' }));
            res.end(notFoundHtml);
          } else {
            serveFile(req, res, reviewFile);
          }
        });
    return;
  }

  // Handle all other requests
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // Security check - prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, withSecurityHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }));
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If file doesn't exist, serve index.html for SPA routing
      const indexPath = path.join(__dirname, 'index.html');
      serveFile(req, res, indexPath);
      return;
    }

    serveFile(req, res, filePath);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Review URLs: http://localhost:8000/review/1, /review/2, etc.');
});

module.exports = server;
