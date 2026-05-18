#!/usr/bin/env node

/**
 * Pro Planner Generator - Web Server
 * Zero-dependency HTTP server that serves the web UI and generates PDFs
 * 
 * Usage: node server.js
 * Then open http://localhost:3000 in your browser
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PlannerGenerator } from './src/generator.js';
import { themes, paperSizes } from './src/themes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const OUTPUT_DIR = path.join(__dirname, 'output');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// MIME types for serving static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

// ==================== SERVER ====================

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  try {
    // API: Generate planners
    if (pathname === '/api/generate') {
      await handleGenerate(url.searchParams, res);
      return;
    }

    // API: List generated files
    if (pathname === '/api/files') {
      await handleListFiles(res);
      return;
    }

    // API: Clear output
    if (pathname === '/api/clear') {
      await handleClear(res);
      return;
    }

    // Download generated PDF files
    if (pathname.startsWith('/download/')) {
      const filename = decodeURIComponent(pathname.replace('/download/', ''));
      await handleDownload(filename, res);
      return;
    }

    // Serve static files from public/
    await serveStatic(pathname, res);

  } catch (error) {
    console.error('Server error:', error);
    sendJSON(res, 500, { success: false, error: error.message });
  }
});

// ==================== API HANDLERS ====================

async function handleGenerate(params, res) {
  const type = params.get('type') || 'daily';
  const theme = params.get('theme') || 'minimalist';
  const size = params.get('size') || 'letter';
  const year = parseInt(params.get('year')) || new Date().getFullYear();
  const pages = params.get('pages') ? parseInt(params.get('pages')) : undefined;
  const allThemes = params.get('allThemes') === 'true';
  const isBundle = params.get('bundle') === 'true';

  const results = [];

  if (type === 'all') {
    // Generate all planner types
    const generator = new PlannerGenerator({
      theme,
      pageSize: size,
      outputDir: OUTPUT_DIR
    });
    const genResults = await generator.generateAll({ year, pages });
    results.push(...genResults.filter(r => !r.error));

  } else if (allThemes) {
    // Generate in all themes
    for (const [themeName] of Object.entries(themes)) {
      const generator = new PlannerGenerator({
        theme: themeName,
        pageSize: size,
        outputDir: OUTPUT_DIR
      });
      try {
        const result = await generator.generate(type, {
          pages, year,
          filename: `${type}-planner-${themeName}-${size}.pdf`
        });
        results.push(result);
      } catch (e) {
        // skip failed
      }
    }

  } else if (isBundle) {
    // Generate multiple types
    const types = type.split(',');
    const generator = new PlannerGenerator({
      theme,
      pageSize: size,
      outputDir: OUTPUT_DIR
    });
    const genResults = await generator.generateBundle(types, { year, pages });
    results.push(...genResults.filter(r => !r.error));

  } else {
    // Generate single planner
    const generator = new PlannerGenerator({
      theme,
      pageSize: size,
      outputDir: OUTPUT_DIR
    });
    const result = await generator.generate(type, { pages, year });
    results.push(result);
  }

  // Get file info for response
  const files = results.map(r => {
    const filename = path.basename(r.path);
    const filePath = path.join(OUTPUT_DIR, filename);
    let fileSize = 0;
    try {
      fileSize = fs.statSync(filePath).size;
    } catch (e) {}
    return {
      filename,
      theme: r.theme,
      pageSize: r.pageSize,
      pages: r.pages,
      type: r.type,
      size: fileSize
    };
  });

  sendJSON(res, 200, { success: true, files, count: files.length });
}

async function handleListFiles(res) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    sendJSON(res, 200, { success: true, files: [] });
    return;
  }

  const filenames = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.pdf'));
  const files = filenames.map(filename => {
    const filePath = path.join(OUTPUT_DIR, filename);
    const stats = fs.statSync(filePath);
    return {
      filename,
      size: stats.size,
      created: stats.mtime.toISOString()
    };
  });

  sendJSON(res, 200, { success: true, files });
}

async function handleClear(res) {
  if (fs.existsSync(OUTPUT_DIR)) {
    const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.pdf'));
    files.forEach(f => fs.unlinkSync(path.join(OUTPUT_DIR, f)));
  }
  sendJSON(res, 200, { success: true, message: 'Output cleared' });
}

async function handleDownload(filename, res) {
  // Security: prevent directory traversal
  const safeName = path.basename(filename);
  const filePath = path.join(OUTPUT_DIR, safeName);

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
    return;
  }

  const stat = fs.statSync(filePath);
  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Length': stat.size,
    'Content-Disposition': `attachment; filename="${safeName}"`
  });
  fs.createReadStream(filePath).pipe(res);
}

// ==================== STATIC FILE SERVER ====================

async function serveStatic(pathname, res) {
  // Default to index.html
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Not Found</h1>');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const content = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(content);
}

// ==================== HELPERS ====================

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// ==================== START ====================

server.listen(PORT, () => {
  console.log('');
  console.log('  \x1b[1m\x1b[35m+==========================================+\x1b[0m');
  console.log('  \x1b[1m\x1b[35m|   PRO PLANNER GENERATOR - Web Server     |\x1b[0m');
  console.log('  \x1b[1m\x1b[35m+==========================================+\x1b[0m');
  console.log('');
  console.log(`  \x1b[32m✓ Server running at:\x1b[0m  \x1b[1m\x1b[36mhttp://localhost:${PORT}\x1b[0m`);
  console.log('');
  console.log('  \x1b[90mOpen this URL in your browser to start generating planners.\x1b[0m');
  console.log('  \x1b[90mPress Ctrl+C to stop the server.\x1b[0m');
  console.log('');
});
