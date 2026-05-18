const pdfService = require('../services/pdf.service');
const { broadcastJobProgress } = require('../websocket/ws-handler');

const handleResult = (res, result, filename) => {
  if (result.path) return res.download(result.path, filename);
  return res.json({ success: true, ...result });
};

exports.merge = async (req, res, next) => {
  try {
    if (!req.files || req.files.length < 2) return res.status(400).json({ error: 'At least 2 PDF files required' });
    const result = await pdfService.mergePDFs(req.files.map(f => f.path), req.body);
    handleResult(res, result, 'merged.pdf');
  } catch (err) { next(err); }
};

exports.split = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const { ranges, mode } = req.body;
    const result = await pdfService.splitPDF(req.file.path, ranges, mode);
    handleResult(res, result, 'split.zip');
  } catch (err) { next(err); }
};

exports.compress = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const result = await pdfService.compressPDF(req.file.path, req.body.quality);
    handleResult(res, result, 'compressed.pdf');
  } catch (err) { next(err); }
};

exports.rotate = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const result = await pdfService.rotatePDF(req.file.path, parseInt(req.body.angle) || 90, req.body.pages || 'all');
    handleResult(res, result, 'rotated.pdf');
  } catch (err) { next(err); }
};

exports.watermark = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const result = await pdfService.addWatermark(req.file.path, req.body);
    handleResult(res, result, 'watermarked.pdf');
  } catch (err) { next(err); }
};

exports.protect = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    if (!req.body.password) return res.status(400).json({ error: 'Password required' });
    const result = await pdfService.protectPDF(req.file.path, req.body.password, req.body.ownerPassword);
    handleResult(res, result, 'protected.pdf');
  } catch (err) { next(err); }
};

exports.addPageNumbers = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const result = await pdfService.addPageNumbers(req.file.path, req.body);
    handleResult(res, result, 'numbered.pdf');
  } catch (err) { next(err); }
};

exports.removePages = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    if (!req.body.pages) return res.status(400).json({ error: 'Pages to remove required' });
    const result = await pdfService.removePages(req.file.path, req.body.pages);
    handleResult(res, result, 'pages-removed.pdf');
  } catch (err) { next(err); }
};

exports.reorderPages = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    if (!req.body.order) return res.status(400).json({ error: 'New order required' });
    const result = await pdfService.reorderPages(req.file.path, req.body.order);
    handleResult(res, result, 'reordered.pdf');
  } catch (err) { next(err); }
};

exports.extractPages = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    if (!req.body.pages) return res.status(400).json({ error: 'Pages to extract required' });
    const result = await pdfService.extractPages(req.file.path, req.body.pages);
    handleResult(res, result, 'extracted.pdf');
  } catch (err) { next(err); }
};

exports.extractText = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const result = await pdfService.extractText(req.file.path);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

exports.getMetadata = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const result = await pdfService.getMetadata(req.file.path);
    res.json({ success: true, metadata: result });
  } catch (err) { next(err); }
};

exports.editMetadata = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const result = await pdfService.editMetadata(req.file.path, req.body);
    handleResult(res, result, 'metadata-edited.pdf');
  } catch (err) { next(err); }
};

exports.flatten = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const result = await pdfService.flattenPDF(req.file.path);
    handleResult(res, result, 'flattened.pdf');
  } catch (err) { next(err); }
};

exports.repair = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const result = await pdfService.repairPDF(req.file.path);
    handleResult(res, result, 'repaired.pdf');
  } catch (err) { next(err); }
};

exports.sign = async (req, res, next) => {
  try {
    if (!req.files || !req.files.file || !req.files.signature) {
      return res.status(400).json({ error: 'PDF file and signature image required' });
    }
    const result = await pdfService.signPDF(req.files.file[0].path, req.files.signature[0].path, req.body);
    handleResult(res, result, 'signed.pdf');
  } catch (err) { next(err); }
};

exports.addHeaderFooter = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const result = await pdfService.addHeaderFooter(req.file.path, req.body);
    handleResult(res, result, 'header-footer.pdf');
  } catch (err) { next(err); }
};

exports.resizePages = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file required' });
    const result = await pdfService.resizePages(req.file.path, req.body.targetSize);
    handleResult(res, result, 'resized.pdf');
  } catch (err) { next(err); }
};
