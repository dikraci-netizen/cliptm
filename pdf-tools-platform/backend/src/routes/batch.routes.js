const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const pdfService = require('../services/pdf.service');
const { broadcastJobProgress } = require('../websocket/ws-handler');
const { getOutputPath } = require('../utils/helpers');
const archiver = require('archiver');
const fs = require('fs');

// Batch process multiple files with same operation
router.post('/process', upload.array('files', 50), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Files required for batch processing' });
    }
    
    const { operation, options: rawOptions } = req.body;
    const options = typeof rawOptions === 'string' ? JSON.parse(rawOptions) : rawOptions || {};
    const wss = req.app.locals.wss;
    const jobQueue = req.app.locals.jobQueue;
    
    // Create a job for tracking
    const job = jobQueue.createJob('batch_' + operation, {
      fileCount: req.files.length,
      operation
    });
    
    const results = [];
    const totalFiles = req.files.length;
    
    for (let i = 0; i < totalFiles; i++) {
      const file = req.files[i];
      const progress = Math.round(((i + 1) / totalFiles) * 100);
      
      try {
        let result;
        switch (operation) {
          case 'compress':
            result = await pdfService.compressPDF(file.path, options.quality);
            break;
          case 'rotate':
            result = await pdfService.rotatePDF(file.path, options.angle || 90, 'all');
            break;
          case 'watermark':
            result = await pdfService.addWatermark(file.path, options);
            break;
          case 'page-numbers':
            result = await pdfService.addPageNumbers(file.path, options);
            break;
          case 'flatten':
            result = await pdfService.flattenPDF(file.path);
            break;
          case 'repair':
            result = await pdfService.repairPDF(file.path);
            break;
          default:
            throw new Error(`Unsupported batch operation: ${operation}`);
        }
        results.push({ file: file.originalname, success: true, ...result });
      } catch (err) {
        results.push({ file: file.originalname, success: false, error: err.message });
      }
      
      // Broadcast progress
      jobQueue.updateProgress(job.id, progress, `Processing ${i + 1}/${totalFiles}: ${file.originalname}`);
      broadcastJobProgress(wss, job.id, { progress, current: i + 1, total: totalFiles, currentFile: file.originalname });
    }
    
    // Create zip with all results
    const zipPath = getOutputPath('zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.pipe(output);
    
    for (const result of results) {
      if (result.success && result.path && fs.existsSync(result.path)) {
        archive.file(result.path, { name: `processed-${result.file}` });
      }
    }
    
    await archive.finalize();
    await new Promise(resolve => output.on('close', resolve));
    
    // Complete job
    jobQueue.completeJob(job.id, { zipPath, processedCount: results.filter(r => r.success).length });
    broadcastJobProgress(wss, job.id, { progress: 100, status: 'completed' });
    
    // Clean individual result files
    results.forEach(r => { if (r.path && fs.existsSync(r.path)) fs.unlinkSync(r.path); });
    
    res.download(zipPath, 'batch-result.zip');
  } catch (err) { next(err); }
});

module.exports = router;
