const express = require('express');
const router = express.Router();

// Get all jobs status
router.get('/status', (req, res) => {
  const jobQueue = req.app.locals.jobQueue;
  res.json({
    success: true,
    stats: jobQueue.getStats(),
    history: jobQueue.getHistory(20)
  });
});

// Get specific job
router.get('/:jobId', (req, res) => {
  const jobQueue = req.app.locals.jobQueue;
  const job = jobQueue.getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({ success: true, job });
});

module.exports = router;
