const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const pdfController = require('../controllers/pdf.controller');

// Core PDF operations
router.post('/merge', upload.array('files', 50), pdfController.merge);
router.post('/split', upload.single('file'), pdfController.split);
router.post('/compress', upload.single('file'), pdfController.compress);
router.post('/rotate', upload.single('file'), pdfController.rotate);
router.post('/watermark', upload.single('file'), pdfController.watermark);
router.post('/protect', upload.single('file'), pdfController.protect);
router.post('/page-numbers', upload.single('file'), pdfController.addPageNumbers);
router.post('/remove-pages', upload.single('file'), pdfController.removePages);
router.post('/reorder', upload.single('file'), pdfController.reorderPages);
router.post('/extract-pages', upload.single('file'), pdfController.extractPages);
router.post('/extract-text', upload.single('file'), pdfController.extractText);
router.post('/metadata', upload.single('file'), pdfController.getMetadata);
router.post('/edit-metadata', upload.single('file'), pdfController.editMetadata);
router.post('/flatten', upload.single('file'), pdfController.flatten);
router.post('/repair', upload.single('file'), pdfController.repair);
router.post('/sign', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'signature', maxCount: 1 }]), pdfController.sign);
router.post('/header-footer', upload.single('file'), pdfController.addHeaderFooter);
router.post('/resize', upload.single('file'), pdfController.resizePages);

module.exports = router;
