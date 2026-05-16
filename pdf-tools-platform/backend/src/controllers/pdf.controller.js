const pdfService = require('../services/pdf.service');
const path = require('path');
const fs = require('fs');

const tempDir = path.join(__dirname, '..', '..', 'temp');

// Helper: send file response
const sendFile = (res, filePath, filename) => {
  res.download(filePath, filename, (err) => {
    if (err) console.error('Download error:', err);
  });
};

const sendJson = (res, data) => {
  res.json({ success: true, ...data });
};

exports.merge = async (req, res, next) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'At least 2 PDF files required' });
    }
    const filePaths = req.files.map(f => f.path);
    const outputPath = await pdfService.mergePDFs(filePaths);
    sendFile(res, outputPath, 'merged.pdf');
  } catch (err) { next(err); }
};

exports.split = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const { ranges } = req.body; // e.g. "1-3,5,7-10"
    const outputPath = await pdfService.splitPDF(req.file.path, ranges);
    sendFile(res, outputPath, 'split.zip');
  } catch (err) { next(err); }
};

exports.compress = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const { quality } = req.body; // low, medium, high
    const outputPath = await pdfService.compressPDF(req.file.path, quality || 'medium');
    sendFile(res, outputPath, 'compressed.pdf');
  } catch (err) { next(err); }
};

exports.rotate = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const { angle, pages } = req.body; // angle: 90, 180, 270; pages: "all" or "1,3,5"
    const outputPath = await pdfService.rotatePDF(req.file.path, parseInt(angle) || 90, pages || 'all');
    sendFile(res, outputPath, 'rotated.pdf');
  } catch (err) { next(err); }
};

exports.watermark = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const { text, opacity, position, fontSize } = req.body;
    const outputPath = await pdfService.addWatermark(req.file.path, {
      text: text || 'WATERMARK',
      opacity: parseFloat(opacity) || 0.3,
      position: position || 'center',
      fontSize: parseInt(fontSize) || 50
    });
    sendFile(res, outputPath, 'watermarked.pdf');
  } catch (err) { next(err); }
};

exports.protect = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });
    const outputPath = await pdfService.protectPDF(req.file.path, password);
    sendFile(res, outputPath, 'protected.pdf');
  } catch (err) { next(err); }
};

exports.unlock = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const { password } = req.body;
    const outputPath = await pdfService.unlockPDF(req.file.path, password);
    sendFile(res, outputPath, 'unlocked.pdf');
  } catch (err) { next(err); }
};

exports.imagesToPdf = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least 1 image file required' });
    }
    const filePaths = req.files.map(f => f.path);
    const { pageSize, margin } = req.body;
    const outputPath = await pdfService.imagesToPDF(filePaths, { pageSize, margin });
    sendFile(res, outputPath, 'images-to-pdf.pdf');
  } catch (err) { next(err); }
};

exports.pdfToImages = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const { format, dpi } = req.body;
    const outputPath = await pdfService.pdfToImages(req.file.path, {
      format: format || 'png',
      dpi: parseInt(dpi) || 150
    });
    sendFile(res, outputPath, 'pdf-images.zip');
  } catch (err) { next(err); }
};

exports.extractText = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const result = await pdfService.extractText(req.file.path);
    sendJson(res, { text: result.text, pages: result.numpages, info: result.info });
  } catch (err) { next(err); }
};

exports.addPageNumbers = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const { position, startFrom, format } = req.body;
    const outputPath = await pdfService.addPageNumbers(req.file.path, {
      position: position || 'bottom-center',
      startFrom: parseInt(startFrom) || 1,
      format: format || 'numeric'
    });
    sendFile(res, outputPath, 'numbered.pdf');
  } catch (err) { next(err); }
};

exports.removePages = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const { pages } = req.body; // e.g. "1,3,5-7"
    if (!pages) return res.status(400).json({ error: 'Pages to remove required' });
    const outputPath = await pdfService.removePages(req.file.path, pages);
    sendFile(res, outputPath, 'pages-removed.pdf');
  } catch (err) { next(err); }
};

exports.reorderPages = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const { order } = req.body; // e.g. "3,1,2,5,4"
    if (!order) return res.status(400).json({ error: 'Page order required' });
    const outputPath = await pdfService.reorderPages(req.file.path, order);
    sendFile(res, outputPath, 'reordered.pdf');
  } catch (err) { next(err); }
};

exports.getMetadata = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const metadata = await pdfService.getMetadata(req.file.path);
    sendJson(res, { metadata });
  } catch (err) { next(err); }
};

exports.editMetadata = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const { title, author, subject, keywords } = req.body;
    const outputPath = await pdfService.editMetadata(req.file.path, { title, author, subject, keywords });
    sendFile(res, outputPath, 'metadata-edited.pdf');
  } catch (err) { next(err); }
};

exports.flatten = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const outputPath = await pdfService.flattenPDF(req.file.path);
    sendFile(res, outputPath, 'flattened.pdf');
  } catch (err) { next(err); }
};

exports.grayscale = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const outputPath = await pdfService.grayscalePDF(req.file.path);
    sendFile(res, outputPath, 'grayscale.pdf');
  } catch (err) { next(err); }
};

exports.sign = async (req, res, next) => {
  try {
    if (!req.files || !req.files.file || !req.files.signature) {
      return res.status(400).json({ error: 'PDF file and signature image required' });
    }
    const { page, x, y, width, height } = req.body;
    const outputPath = await pdfService.signPDF(
      req.files.file[0].path,
      req.files.signature[0].path,
      { page: parseInt(page) || 1, x: parseInt(x) || 100, y: parseInt(y) || 100, width: parseInt(width) || 200, height: parseInt(height) || 80 }
    );
    sendFile(res, outputPath, 'signed.pdf');
  } catch (err) { next(err); }
};

exports.repair = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const outputPath = await pdfService.repairPDF(req.file.path);
    sendFile(res, outputPath, 'repaired.pdf');
  } catch (err) { next(err); }
};
