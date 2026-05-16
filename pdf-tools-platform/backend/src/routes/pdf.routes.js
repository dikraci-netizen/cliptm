const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const pdfController = require('../controllers/pdf.controller');

// Merge PDFs
router.post('/merge', upload.array('files', 20), pdfController.merge);

// Split PDF
router.post('/split', upload.single('file'), pdfController.split);

// Compress PDF
router.post('/compress', upload.single('file'), pdfController.compress);

// Rotate PDF pages
router.post('/rotate', upload.single('file'), pdfController.rotate);

// Add watermark
router.post('/watermark', upload.single('file'), pdfController.watermark);

// Protect/Encrypt PDF
router.post('/protect', upload.single('file'), pdfController.protect);

// Unlock PDF
router.post('/unlock', upload.single('file'), pdfController.unlock);

// Convert images to PDF
router.post('/images-to-pdf', upload.array('files', 50), pdfController.imagesToPdf);

// PDF to images
router.post('/pdf-to-images', upload.single('file'), pdfController.pdfToImages);

// Extract text from PDF
router.post('/extract-text', upload.single('file'), pdfController.extractText);

// Add page numbers
router.post('/page-numbers', upload.single('file'), pdfController.addPageNumbers);

// Remove pages
router.post('/remove-pages', upload.single('file'), pdfController.removePages);

// Reorder pages
router.post('/reorder', upload.single('file'), pdfController.reorderPages);

// PDF metadata
router.post('/metadata', upload.single('file'), pdfController.getMetadata);

// Edit metadata
router.post('/edit-metadata', upload.single('file'), pdfController.editMetadata);

// Flatten PDF (remove form fields)
router.post('/flatten', upload.single('file'), pdfController.flatten);

// Grayscale conversion
router.post('/grayscale', upload.single('file'), pdfController.grayscale);

// Sign PDF (add signature image)
router.post('/sign', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]), pdfController.sign);

// Repair PDF
router.post('/repair', upload.single('file'), pdfController.repair);

module.exports = router;
