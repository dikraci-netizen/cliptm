const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const advancedService = require('../services/advanced.service');

// OCR
router.post('/ocr', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File required' });
    const result = await advancedService.ocrPDF(req.file.path, req.body);
    if (result.downloadPath) return res.download(result.downloadPath, 'ocr-result.txt');
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
});

// Compare PDFs
router.post('/compare', upload.array('files', 2), async (req, res, next) => {
  try {
    if (!req.files || req.files.length !== 2) return res.status(400).json({ error: '2 PDF files required' });
    const result = await advancedService.comparePDFs(req.files[0].path, req.files[1].path);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
});

// Redact PDF
router.post('/redact', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const options = typeof req.body.options === 'string' ? JSON.parse(req.body.options) : req.body;
    const result = await advancedService.redactPDF(req.file.path, options);
    res.download(result.path, 'redacted.pdf');
  } catch (err) { next(err); }
});

// Annotate PDF
router.post('/annotate', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const annotations = typeof req.body.annotations === 'string' ? JSON.parse(req.body.annotations) : req.body.annotations || [];
    const result = await advancedService.annotatePDF(req.file.path, annotations);
    res.download(result.path, 'annotated.pdf');
  } catch (err) { next(err); }
});

// Create PDF
router.post('/create', async (req, res, next) => {
  try {
    const result = await advancedService.createPDF(req.body);
    res.download(result.path, 'created.pdf');
  } catch (err) { next(err); }
});

// Form creator
router.post('/create-form', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const fields = typeof req.body.fields === 'string' ? JSON.parse(req.body.fields) : req.body.fields || [];
    const result = await advancedService.createForm(req.file.path, fields);
    res.download(result.path, 'form.pdf');
  } catch (err) { next(err); }
});

// AI Summarize
router.post('/summarize', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const result = await advancedService.summarizePDF(req.file.path, req.body);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
});

// Analyze/Statistics
router.post('/analyze', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const result = await advancedService.analyzePDF(req.file.path);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
});

module.exports = router;
