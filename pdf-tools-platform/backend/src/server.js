const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Ensure upload and temp directories exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
const tempDir = path.join(__dirname, '..', 'temp');
[uploadsDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Serve static frontend
app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'public')));

// API Routes
app.use('/api/pdf', require('./routes/pdf.routes'));

// Serve processed files
app.use('/downloads', express.static(tempDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Cleanup temp files older than 1 hour
setInterval(() => {
  const oneHourAgo = Date.now() - 3600000;
  if (fs.existsSync(tempDir)) {
    fs.readdirSync(tempDir).forEach(file => {
      const filePath = path.join(tempDir, file);
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs < oneHourAgo) {
        fs.unlinkSync(filePath);
      }
    });
  }
}, 600000); // Run every 10 minutes

app.listen(PORT, () => {
  console.log(`PDF Tools Platform running on http://localhost:${PORT}`);
});

module.exports = app;
