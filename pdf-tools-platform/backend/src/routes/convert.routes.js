const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const pdfService = require('../services/pdf.service');

// Images to PDF
router.post('/images-to-pdf', upload.array('files', 50), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'At least 1 image required' });
    const filePaths = req.files.map(f => f.path);
    const result = await pdfService.imagesToPDF(filePaths, req.body);
    res.download(result.path, 'images-to-pdf.pdf');
  } catch (err) { next(err); }
});

// PDF to Images
router.post('/pdf-to-images', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const result = await pdfService.pdfToImages(req.file.path, req.body);
    res.download(result.path, 'pdf-pages.zip');
  } catch (err) { next(err); }
});

module.exports = router;
