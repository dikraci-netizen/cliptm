require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const http = require('http');
const rateLimit = require('express-rate-limit');
const { WebSocketServer } = require('ws');
const { setupWebSocket } = require('./websocket/ws-handler');
const { JobQueue } = require('./queues/job-queue');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// ============ WEBSOCKET SETUP ============
const wss = new WebSocketServer({ server, path: '/ws' });
setupWebSocket(wss);

// ============ JOB QUEUE ============
const jobQueue = new JobQueue();
app.locals.jobQueue = jobQueue;
app.locals.wss = wss;

// ============ MIDDLEWARE ============
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting - generous for a premium tool
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests. Please try again later.', code: 'RATE_LIMIT' }
});
app.use('/api/', apiLimiter);

// Ensure directories exist
const dirs = ['uploads', 'temp', 'output'].map(d => path.join(__dirname, '..', d));
dirs.forEach(dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); });

// ============ STATIC FILES ============
app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'public')));
app.use('/downloads', express.static(path.join(__dirname, '..', 'output')));

// ============ API ROUTES ============
app.use('/api/pdf', require('./routes/pdf.routes'));
app.use('/api/convert', require('./routes/convert.routes'));
app.use('/api/advanced', require('./routes/advanced.routes'));
app.use('/api/batch', require('./routes/batch.routes'));
app.use('/api/jobs', require('./routes/jobs.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    activeJobs: jobQueue.getStats(),
    uptime: process.uptime()
  });
});

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    code: err.code || 'UNKNOWN_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============ AUTO CLEANUP (every 30 min) ============
setInterval(() => {
  const maxAge = 3600000; // 1 hour
  ['uploads', 'temp', 'output'].forEach(dirName => {
    const dir = path.join(__dirname, '..', dirName);
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(file => {
      if (file === '.gitkeep') return;
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (Date.now() - stat.mtimeMs > maxAge) {
          if (stat.isDirectory()) fs.rmSync(filePath, { recursive: true });
          else fs.unlinkSync(filePath);
        }
      } catch (e) { /* ignore */ }
    });
  });
}, 1800000);

// ============ START SERVER ============
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║       PDF Tools Pro v2.0 - Advanced Engine       ║
║══════════════════════════════════════════════════║
║  Server:    http://localhost:${PORT}               ║
║  WebSocket: ws://localhost:${PORT}/ws              ║
║  Status:    OPERATIONAL                          ║
╚══════════════════════════════════════════════════╝
  `);
});

module.exports = { app, server };
