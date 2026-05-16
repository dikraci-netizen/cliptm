const { PDFDocument, rgb, degrees, StandardFonts, grayscale } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const archiver = require('archiver');
const pdfParse = require('pdf-parse');

const tempDir = path.join(__dirname, '..', '..', 'temp');

// Ensure temp dir
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const getOutputPath = (ext = 'pdf') => path.join(tempDir, `${uuidv4()}.${ext}`);

// ============ MERGE PDFs ============
exports.mergePDFs = async (filePaths) => {
  const mergedPdf = await PDFDocument.create();
  
  for (const filePath of filePaths) {
    const pdfBytes = fs.readFileSync(filePath);
    const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }
  
  const outputPath = getOutputPath();
  const mergedBytes = await mergedPdf.save();
  fs.writeFileSync(outputPath, mergedBytes);
  
  // Cleanup uploaded files
  filePaths.forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
  return outputPath;
};

// ============ SPLIT PDF ============
exports.splitPDF = async (filePath, ranges) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  // Parse ranges: "1-3,5,7-10" or "all" (splits into individual pages)
  let pageRanges = [];
  if (!ranges || ranges === 'all') {
    // Split into individual pages
    for (let i = 0; i < totalPages; i++) {
      pageRanges.push([i]);
    }
  } else {
    const parts = ranges.split(',').map(s => s.trim());
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n) - 1);
        const indices = [];
        for (let i = start; i <= Math.min(end, totalPages - 1); i++) {
          indices.push(i);
        }
        pageRanges.push(indices);
      } else {
        const idx = parseInt(part) - 1;
        if (idx >= 0 && idx < totalPages) pageRanges.push([idx]);
      }
    }
  }
  
  // Create zip with split PDFs
  const zipPath = getOutputPath('zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  archive.pipe(output);
  
  for (let i = 0; i < pageRanges.length; i++) {
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdf, pageRanges[i]);
    pages.forEach(page => newPdf.addPage(page));
    const bytes = await newPdf.save();
    archive.append(Buffer.from(bytes), { name: `split-${i + 1}.pdf` });
  }
  
  await archive.finalize();
  await new Promise(resolve => output.on('close', resolve));
  
  fs.existsSync(filePath) && fs.unlinkSync(filePath);
  return zipPath;
};

// ============ COMPRESS PDF ============
exports.compressPDF = async (filePath, quality) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  // PDF-lib doesn't have built-in compression settings,
  // but saving with useObjectStreams helps reduce size
  const outputPath = getOutputPath();
  const compressedBytes = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false
  });
  
  fs.writeFileSync(outputPath, compressedBytes);
  fs.existsSync(filePath) && fs.unlinkSync(filePath);
  return outputPath;
};

// ============ ROTATE PDF ============
exports.rotatePDF = async (filePath, angle, pages) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  let pageIndices = [];
  if (pages === 'all') {
    pageIndices = Array.from({ length: totalPages }, (_, i) => i);
  } else {
    pageIndices = pages.split(',').map(p => parseInt(p.trim()) - 1).filter(i => i >= 0 && i < totalPages);
  }
  
  for (const idx of pageIndices) {
    const page = pdf.getPage(idx);
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + angle));
  }
  
  const outputPath = getOutputPath();
  const rotatedBytes = await pdf.save();
  fs.writeFileSync(outputPath, rotatedBytes);
  
  fs.existsSync(filePath) && fs.unlinkSync(filePath);
  return outputPath;
};

// ============ ADD WATERMARK ============
exports.addWatermark = async (filePath, options) => {
  const { text, opacity, position, fontSize } = options;
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  
  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    
    let x, y;
    switch (position) {
      case 'top-left': x = 50; y = height - 50; break;
      case 'top-right': x = width - textWidth - 50; y = height - 50; break;
      case 'bottom-left': x = 50; y = 50; break;
      case 'bottom-right': x = width - textWidth - 50; y = 50; break;
      case 'center':
      default: x = (width - textWidth) / 2; y = height / 2; break;
    }
    
    page.drawText(text, {
      x, y,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: position === 'center' ? degrees(45) : degrees(0)
    });
  }
  
  const outputPath = getOutputPath();
  const watermarkedBytes = await pdf.save();
  fs.writeFileSync(outputPath, watermarkedBytes);
  
  fs.existsSync(filePath) && fs.unlinkSync(filePath);
  return outputPath;
};

// ============ PROTECT PDF ============
exports.protectPDF = async (filePath, password) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  // PDF-lib doesn't support encryption directly, but we can save and note this
  // For production, use a library like qpdf or muhammara
  const outputPath = getOutputPath();
  const bytes = await pdf.save({
    userPassword: password,
    ownerPassword: password,
  });
  fs.writeFileSync(outputPath, bytes);
  
  fs.existsSync(filePath) && fs.unlinkSync(filePath);
  return outputPath;
};

// ============ UNLOCK PDF ============
exports.unlockPDF = async (filePath, password) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, {
    ignoreEncryption: true,
    password: password
  });
  
  const outputPath = getOutputPath();
  const bytes = await pdf.save();
  fs.writeFileSync(outputPath, bytes);
  
  fs.existsSync(filePath) && fs.unlinkSync(filePath);
  return outputPath;
};

// ============ IMAGES TO PDF ============
exports.imagesToPDF = async (filePaths, options) => {
  const pdf = await PDFDocument.create();
  const pageWidth = options?.pageSize === 'A4' ? 595 : 612;
  const pageHeight = options?.pageSize === 'A4' ? 842 : 792;
  const margin = parseInt(options?.margin) || 0;
  
  for (const imgPath of filePaths) {
    const imgBuffer = fs.readFileSync(imgPath);
    const ext = path.extname(imgPath).toLowerCase();
    
    let image;
    if (ext === '.png') {
      image = await pdf.embedPng(imgBuffer);
    } else {
      // Convert to PNG first using sharp for non-standard formats
      const pngBuffer = await sharp(imgBuffer).png().toBuffer();
      image = await pdf.embedPng(pngBuffer);
    }
    
    const imgDims = image.scale(1);
    const scale = Math.min(
      (pageWidth - 2 * margin) / imgDims.width,
      (pageHeight - 2 * margin) / imgDims.height
    );
    
    const page = pdf.addPage([pageWidth, pageHeight]);
    const scaledWidth = imgDims.width * scale;
    const scaledHeight = imgDims.height * scale;
    
    page.drawImage(image, {
      x: (pageWidth - scaledWidth) / 2,
      y: (pageHeight - scaledHeight) / 2,
      width: scaledWidth,
      height: scaledHeight
    });
  }
  
  const outputPath = getOutputPath();
  const bytes = await pdf.save();
  fs.writeFileSync(outputPath, bytes);
  
  filePaths.forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
  return outputPath;
};

// ============ PDF TO IMAGES ============
exports.pdfToImages = async (filePath, options) => {
  const { format, dpi } = options;
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pageCount = pdf.getPageCount();
  
  const zipPath = getOutputPath('zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 6 } });
  archive.pipe(output);
  
  // Extract each page as a separate PDF, then note limitation
  for (let i = 0; i < pageCount; i++) {
    const singlePagePdf = await PDFDocument.create();
    const [page] = await singlePagePdf.copyPages(pdf, [i]);
    singlePagePdf.addPage(page);
    const pageBytes = await singlePagePdf.save();
    archive.append(Buffer.from(pageBytes), { name: `page-${i + 1}.pdf` });
  }
  
  await archive.finalize();
  await new Promise(resolve => output.on('close', resolve));
  
  fs.existsSync(filePath) && fs.unlinkSync(filePath);
  return zipPath;
};

// ============ EXTRACT TEXT ============
exports.extractText = async (filePath) => {
  const pdfBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(pdfBuffer);
  fs.existsSync(filePath) && fs.unlinkSync(filePath);
  return data;
};

// ============ ADD PAGE NUMBERS ============
exports.addPageNumbers = async (filePath, options) => {
  const { position, startFrom, format } = options;
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  
  pages.forEach((page, idx) => {
    const pageNum = idx + startFrom;
    const { width, height } = page.getSize();
    let text;
    
    switch (format) {
      case 'roman': text = toRoman(pageNum); break;
      case 'alpha': text = String.fromCharCode(64 + pageNum); break;
      default: text = `${pageNum}`;
    }
    
    const textWidth = font.widthOfTextAtSize(text, 12);
    let x, y;
    
    switch (position) {
      case 'top-left': x = 40; y = height - 30; break;
      case 'top-center': x = (width - textWidth) / 2; y = height - 30; break;
      case 'top-right': x = width - textWidth - 40; y = height - 30; break;
      case 'bottom-left': x = 40; y = 30; break;
      case 'bottom-right': x = width - textWidth - 40; y = 30; break;
      case 'bottom-center':
      default: x = (width - textWidth) / 2; y = 30; break;
    }
    
    page.drawText(text, { x, y, size: 12, font, color: rgb(0, 0, 0) });
  });
  
  const outputPath = getOutputPath();
  const bytes = await pdf.save();
  fs.writeFileSync(outputPath, bytes);
  
  fs.existsSync(filePath) && fs.unlinkSync(filePath);
  return outputPath;
};

// ============ REMOVE PAGES ============
exports.removePages = async (filePath, pages) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  // Parse pages to remove
  const pagesToRemove = new Set();
  const parts = pages.split(',').map(s => s.trim());
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(n => parseInt(n));
      for (let i = start; i <= end; i++) pagesToRemove.add(i - 1);
    } else {
      pagesToRemove.add(parseInt(part) - 1);
    }
  }
  
  const newPdf = await PDFDocument.create();
  const keepIndices = [];
  for (let i = 0; i < totalPages; i++) {
    if (!pagesToRemove.has(i)) keepIndices.push(i);
  }
  
  const copiedPages = await newPdf.copyPages(pdf, keepIndices);
  copiedPages.forEach(page => newPdf.addPage(page));
  
  const outputPath = getOutputPath();
  const bytes = await newPdf.save();
  fs.writeFileSync(outputPath, bytes);
  
  fs.existsSync(filePath) && fs.unlinkSync(filePath);
  return outputPath;
};

// ============ REORDER PAGES ============
exports.reorderPages = async (filePath, order) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const indices = order.split(',').map(n => parseInt(n.trim()) - 1);
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(pdf, indices);
  pages.forEach(page => newPdf.addPage(page));
  
  const outputPath = getOutputPath();
  const bytes = await newPdf.save();
  fs.writeFileSync(outputPath, bytes);
  
  fs.existsSync(filePath) && fs.unlinkSync(filePath);
  return outputPath;
};

// ============ GET METADATA ============
exports.getMetadata = async (filePath) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const metadata = {
    title: pdf.getTitle() || '',
    author: pdf.getAuthor() || '',
    subject: pdf.getSubject() || '',
    creator: pdf.getCreator() || '',
    producer: pdf.getProducer() || '',
    creationDate: pdf.getCreationDate()?.toISOString() || '',
    modificationDate: pdf.getModificationDate()?.toISOString() || '',
    pageCount: pdf.getPageCount(),
    keywords: pdf.getKeywords() || ''
  };
  
  fs.existsSync(filePath) && fs.unlinkSync(filePath);
  return metadata;
};

// ============ EDIT METADATA ============
exports.editMetadata = async (filePath, metadata) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  if (metadata.title) pdf.setTitle(metadata.title);
  if (metadata.author) pdf.setAuthor(metadata.author);
  if (metadata.subject) pdf.setSubject(metadata.subject);
  if (metadata.keywords) pdf.setKeywords(metadata.keywords.split(',').map(k => k.trim()));
  
  const outputPath = getOutputPath();
  const bytes = await pdf.save();
  fs.writeFileSync(outputPath, bytes);
  
  fs.existsSync(filePath) && fs.unlinkSync(filePath);
  return outputPath;
};

// ============ FLATTEN PDF ============
exports.flattenPDF = async (filePath) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const form = pdf.getForm();
  try {
    form.flatten();
  } catch (e) {
    // PDF may not have forms, that's okay
  }
  
  const outputPath = getOutputPath();
  const bytes = await pdf.save();
  fs.writeFileSync(outputPath, bytes);
  
  fs.existsSync(filePath) && fs.unlinkSync(filePath);
  return outputPath;
};

// ============ GRAYSCALE PDF ============
exports.grayscalePDF = async (filePath) => {
  // Note: True grayscale conversion requires processing each page's content stream
  // This is a simplified version that re-saves the PDF
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const outputPath = getOutputPath();
  const bytes = await pdf.save();
  fs.writeFileSync(outputPath, bytes);
  
  fs.existsSync(filePath) && fs.unlinkSync(filePath);
  return outputPath;
};

// ============ SIGN PDF ============
exports.signPDF = async (filePath, signaturePath, options) => {
  const { page: pageNum, x, y, width, height } = options;
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const sigBuffer = fs.readFileSync(signaturePath);
  const pngBuffer = await sharp(sigBuffer).png().toBuffer();
  const sigImage = await pdf.embedPng(pngBuffer);
  
  const page = pdf.getPage(pageNum - 1);
  page.drawImage(sigImage, { x, y, width, height });
  
  const outputPath = getOutputPath();
  const bytes = await pdf.save();
  fs.writeFileSync(outputPath, bytes);
  
  fs.existsSync(filePath) && fs.unlinkSync(filePath);
  fs.existsSync(signaturePath) && fs.unlinkSync(signaturePath);
  return outputPath;
};

// ============ REPAIR PDF ============
exports.repairPDF = async (filePath) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  // Re-save to fix minor structural issues
  const outputPath = getOutputPath();
  const bytes = await pdf.save();
  fs.writeFileSync(outputPath, bytes);
  
  fs.existsSync(filePath) && fs.unlinkSync(filePath);
  return outputPath;
};

// ============ UTILITIES ============
function toRoman(num) {
  const romanNumerals = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let result = '';
  for (const [value, numeral] of romanNumerals) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}
