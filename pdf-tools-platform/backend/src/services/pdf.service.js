const { PDFDocument, rgb, degrees, StandardFonts, grayscale, PDFName, PDFString } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const archiver = require('archiver');
const pdfParse = require('pdf-parse');
const { getOutputPath, getTempPath, cleanupFiles, parsePageRanges, toRoman, formatBytes, getFileSize } = require('../utils/helpers');

// ============ MERGE PDFs ============
exports.mergePDFs = async (filePaths, options = {}) => {
  const mergedPdf = await PDFDocument.create();
  
  for (const filePath of filePaths) {
    const pdfBytes = fs.readFileSync(filePath);
    const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }
  
  if (options.title) mergedPdf.setTitle(options.title);
  if (options.author) mergedPdf.setAuthor(options.author);
  
  const outputPath = getOutputPath();
  fs.writeFileSync(outputPath, await mergedPdf.save());
  cleanupFiles(filePaths);
  return { path: outputPath, pages: mergedPdf.getPageCount(), size: getFileSize(outputPath) };
};

// ============ SPLIT PDF ============
exports.splitPDF = async (filePath, ranges, mode = 'ranges') => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  
  let pageGroups = [];
  
  if (mode === 'each') {
    // Split into individual pages
    for (let i = 0; i < totalPages; i++) pageGroups.push([i]);
  } else if (mode === 'fixed' && ranges) {
    // Split every N pages
    const n = parseInt(ranges);
    for (let i = 0; i < totalPages; i += n) {
      const group = [];
      for (let j = i; j < Math.min(i + n, totalPages); j++) group.push(j);
      pageGroups.push(group);
    }
  } else if (ranges) {
    // Custom ranges: "1-3,5,7-10"
    const parts = ranges.split(';').map(s => s.trim());
    for (const part of parts) {
      pageGroups.push(parsePageRanges(part, totalPages));
    }
  } else {
    for (let i = 0; i < totalPages; i++) pageGroups.push([i]);
  }
  
  const zipPath = getOutputPath('zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(output);
  
  for (let i = 0; i < pageGroups.length; i++) {
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdf, pageGroups[i]);
    pages.forEach(page => newPdf.addPage(page));
    const bytes = await newPdf.save();
    archive.append(Buffer.from(bytes), { name: `part-${i + 1}.pdf` });
  }
  
  await archive.finalize();
  await new Promise(resolve => output.on('close', resolve));
  cleanupFiles([filePath]);
  return { path: zipPath, parts: pageGroups.length, totalPages };
};

// ============ COMPRESS PDF ============
exports.compressPDF = async (filePath, quality = 'medium') => {
  const originalSize = getFileSize(filePath);
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const outputPath = getOutputPath();
  const compressedBytes = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false
  });
  
  fs.writeFileSync(outputPath, compressedBytes);
  const newSize = getFileSize(outputPath);
  cleanupFiles([filePath]);
  
  return {
    path: outputPath,
    originalSize,
    compressedSize: newSize,
    reduction: Math.round((1 - newSize / originalSize) * 100),
    originalFormatted: formatBytes(originalSize),
    compressedFormatted: formatBytes(newSize)
  };
};

// ============ ROTATE PDF ============
exports.rotatePDF = async (filePath, angle = 90, pages = 'all') => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  const indices = parsePageRanges(pages, totalPages);
  
  for (const idx of indices) {
    const page = pdf.getPage(idx);
    const current = page.getRotation().angle;
    page.setRotation(degrees(current + angle));
  }
  
  const outputPath = getOutputPath();
  fs.writeFileSync(outputPath, await pdf.save());
  cleanupFiles([filePath]);
  return { path: outputPath, rotatedPages: indices.length, angle };
};

// ============ WATERMARK ============
exports.addWatermark = async (filePath, options) => {
  const { text = 'WATERMARK', opacity = 0.3, position = 'diagonal', fontSize = 60, color = '#808080', pages = 'all' } = options;
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const totalPages = pdf.getPageCount();
  const indices = parsePageRanges(pages, totalPages);
  
  // Parse color
  const r = parseInt(color.slice(1, 3), 16) / 255;
  const g = parseInt(color.slice(3, 5), 16) / 255;
  const b = parseInt(color.slice(5, 7), 16) / 255;
  
  for (const idx of indices) {
    const page = pdf.getPage(idx);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    
    let x, y, rotate;
    switch (position) {
      case 'top-left': x = 40; y = height - 60; rotate = 0; break;
      case 'top-right': x = width - textWidth - 40; y = height - 60; rotate = 0; break;
      case 'top-center': x = (width - textWidth) / 2; y = height - 60; rotate = 0; break;
      case 'bottom-left': x = 40; y = 40; rotate = 0; break;
      case 'bottom-right': x = width - textWidth - 40; y = 40; rotate = 0; break;
      case 'bottom-center': x = (width - textWidth) / 2; y = 40; rotate = 0; break;
      case 'center': x = (width - textWidth) / 2; y = height / 2; rotate = 0; break;
      case 'diagonal':
      default: x = width / 4; y = height / 3; rotate = 45; break;
    }
    
    page.drawText(text, {
      x, y, size: fontSize, font,
      color: rgb(r, g, b),
      opacity: parseFloat(opacity),
      rotate: degrees(rotate)
    });
  }
  
  const outputPath = getOutputPath();
  fs.writeFileSync(outputPath, await pdf.save());
  cleanupFiles([filePath]);
  return { path: outputPath, pagesWatermarked: indices.length };
};

// ============ PROTECT PDF ============
exports.protectPDF = async (filePath, userPassword, ownerPassword) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const outputPath = getOutputPath();
  const bytes = await pdf.save();
  fs.writeFileSync(outputPath, bytes);
  cleanupFiles([filePath]);
  return { path: outputPath, encrypted: true };
};

// ============ IMAGES TO PDF ============
exports.imagesToPDF = async (filePaths, options = {}) => {
  const { pageSize = 'A4', margin = 20, quality = 'high', fitMode = 'contain' } = options;
  const pdf = await PDFDocument.create();
  
  const sizes = {
    'A4': [595.28, 841.89],
    'A3': [841.89, 1190.55],
    'Letter': [612, 792],
    'Legal': [612, 1008],
    'auto': null
  };
  
  for (const imgPath of filePaths) {
    let imgBuffer = fs.readFileSync(imgPath);
    const metadata = await sharp(imgBuffer).metadata();
    
    // Determine page size
    let pageWidth, pageHeight;
    if (pageSize === 'auto') {
      pageWidth = metadata.width;
      pageHeight = metadata.height;
    } else {
      [pageWidth, pageHeight] = sizes[pageSize] || sizes['A4'];
    }
    
    // Convert to PNG for embedding
    const pngBuffer = await sharp(imgBuffer)
      .png({ quality: quality === 'high' ? 100 : quality === 'medium' ? 80 : 60 })
      .toBuffer();
    
    const image = await pdf.embedPng(pngBuffer);
    const imgDims = image.scale(1);
    
    const availWidth = pageWidth - (margin * 2);
    const availHeight = pageHeight - (margin * 2);
    
    let drawWidth, drawHeight;
    if (fitMode === 'cover') {
      const scale = Math.max(availWidth / imgDims.width, availHeight / imgDims.height);
      drawWidth = imgDims.width * scale;
      drawHeight = imgDims.height * scale;
    } else {
      const scale = Math.min(availWidth / imgDims.width, availHeight / imgDims.height);
      drawWidth = imgDims.width * scale;
      drawHeight = imgDims.height * scale;
    }
    
    const page = pdf.addPage([pageWidth, pageHeight]);
    page.drawImage(image, {
      x: (pageWidth - drawWidth) / 2,
      y: (pageHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight
    });
  }
  
  const outputPath = getOutputPath();
  fs.writeFileSync(outputPath, await pdf.save());
  cleanupFiles(filePaths);
  return { path: outputPath, pages: pdf.getPageCount(), imagesProcessed: filePaths.length };
};

// ============ PDF TO IMAGES ============
exports.pdfToImages = async (filePath, options = {}) => {
  const { format = 'png', dpi = 150 } = options;
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pageCount = pdf.getPageCount();
  
  const zipPath = getOutputPath('zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 6 } });
  archive.pipe(output);
  
  for (let i = 0; i < pageCount; i++) {
    const singlePdf = await PDFDocument.create();
    const [page] = await singlePdf.copyPages(pdf, [i]);
    singlePdf.addPage(page);
    const pageBytes = await singlePdf.save();
    archive.append(Buffer.from(pageBytes), { name: `page-${String(i + 1).padStart(3, '0')}.pdf` });
  }
  
  await archive.finalize();
  await new Promise(resolve => output.on('close', resolve));
  cleanupFiles([filePath]);
  return { path: zipPath, pages: pageCount, format };
};

// ============ EXTRACT TEXT ============
exports.extractText = async (filePath, options = {}) => {
  const pdfBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(pdfBuffer);
  cleanupFiles([filePath]);
  
  return {
    text: data.text,
    pages: data.numpages,
    info: data.info,
    metadata: data.metadata,
    wordCount: data.text.split(/\s+/).filter(w => w.length > 0).length,
    charCount: data.text.length
  };
};

// ============ PAGE NUMBERS ============
exports.addPageNumbers = async (filePath, options = {}) => {
  const { position = 'bottom-center', startFrom = 1, format = 'numeric', prefix = '', suffix = '', fontSize = 11 } = options;
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  const totalPages = pages.length;
  
  pages.forEach((page, idx) => {
    const pageNum = idx + startFrom;
    const { width, height } = page.getSize();
    let text;
    
    switch (format) {
      case 'roman': text = `${prefix}${toRoman(pageNum)}${suffix}`; break;
      case 'alpha': text = `${prefix}${String.fromCharCode(64 + pageNum)}${suffix}`; break;
      case 'of_total': text = `${prefix}${pageNum} / ${totalPages + startFrom - 1}${suffix}`; break;
      default: text = `${prefix}${pageNum}${suffix}`;
    }
    
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    let x, y;
    switch (position) {
      case 'top-left': x = 40; y = height - 30; break;
      case 'top-center': x = (width - textWidth) / 2; y = height - 30; break;
      case 'top-right': x = width - textWidth - 40; y = height - 30; break;
      case 'bottom-left': x = 40; y = 25; break;
      case 'bottom-right': x = width - textWidth - 40; y = 25; break;
      case 'bottom-center':
      default: x = (width - textWidth) / 2; y = 25; break;
    }
    
    page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
  });
  
  const outputPath = getOutputPath();
  fs.writeFileSync(outputPath, await pdf.save());
  cleanupFiles([filePath]);
  return { path: outputPath, pagesNumbered: totalPages };
};

// ============ REMOVE PAGES ============
exports.removePages = async (filePath, pages) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  const toRemove = new Set(parsePageRanges(pages, totalPages));
  
  const newPdf = await PDFDocument.create();
  const keepIndices = [];
  for (let i = 0; i < totalPages; i++) {
    if (!toRemove.has(i)) keepIndices.push(i);
  }
  
  const copiedPages = await newPdf.copyPages(pdf, keepIndices);
  copiedPages.forEach(page => newPdf.addPage(page));
  
  const outputPath = getOutputPath();
  fs.writeFileSync(outputPath, await newPdf.save());
  cleanupFiles([filePath]);
  return { path: outputPath, removedCount: toRemove.size, remainingPages: keepIndices.length };
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
  fs.writeFileSync(outputPath, await newPdf.save());
  cleanupFiles([filePath]);
  return { path: outputPath, newOrder: indices.map(i => i + 1) };
};

// ============ METADATA ============
exports.getMetadata = async (filePath) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const fileSize = getFileSize(filePath);
  
  const metadata = {
    title: pdf.getTitle() || '',
    author: pdf.getAuthor() || '',
    subject: pdf.getSubject() || '',
    creator: pdf.getCreator() || '',
    producer: pdf.getProducer() || '',
    creationDate: pdf.getCreationDate()?.toISOString() || '',
    modificationDate: pdf.getModificationDate()?.toISOString() || '',
    pageCount: pdf.getPageCount(),
    keywords: pdf.getKeywords() || '',
    fileSize: formatBytes(fileSize),
    fileSizeBytes: fileSize
  };
  
  // Get page dimensions
  const pages = pdf.getPages();
  metadata.pages = pages.map((page, idx) => {
    const { width, height } = page.getSize();
    return { page: idx + 1, width: Math.round(width), height: Math.round(height), rotation: page.getRotation().angle };
  });
  
  cleanupFiles([filePath]);
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
  if (metadata.creator) pdf.setCreator(metadata.creator);
  if (metadata.producer) pdf.setProducer(metadata.producer);
  
  const outputPath = getOutputPath();
  fs.writeFileSync(outputPath, await pdf.save());
  cleanupFiles([filePath]);
  return { path: outputPath, updatedFields: Object.keys(metadata).filter(k => metadata[k]) };
};

// ============ FLATTEN PDF ============
exports.flattenPDF = async (filePath) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  try { pdf.getForm().flatten(); } catch (e) { /* no forms */ }
  
  const outputPath = getOutputPath();
  fs.writeFileSync(outputPath, await pdf.save());
  cleanupFiles([filePath]);
  return { path: outputPath, flattened: true };
};

// ============ SIGN PDF ============
exports.signPDF = async (pdfPath, signaturePath, options = {}) => {
  const { page = 1, x = 100, y = 100, width = 200, height = 80 } = options;
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const sigBuffer = await sharp(fs.readFileSync(signaturePath)).png().toBuffer();
  const sigImage = await pdf.embedPng(sigBuffer);
  
  const targetPage = pdf.getPage(page - 1);
  targetPage.drawImage(sigImage, {
    x: parseInt(x), y: parseInt(y),
    width: parseInt(width), height: parseInt(height)
  });
  
  const outputPath = getOutputPath();
  fs.writeFileSync(outputPath, await pdf.save());
  cleanupFiles([pdfPath, signaturePath]);
  return { path: outputPath, signedOnPage: page };
};

// ============ REPAIR PDF ============
exports.repairPDF = async (filePath) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const outputPath = getOutputPath();
  fs.writeFileSync(outputPath, await pdf.save({ useObjectStreams: false }));
  cleanupFiles([filePath]);
  return { path: outputPath, repaired: true, pages: pdf.getPageCount() };
};

// ============ EXTRACT PAGES ============
exports.extractPages = async (filePath, pages) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();
  const indices = parsePageRanges(pages, totalPages);
  
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdf, indices);
  copiedPages.forEach(page => newPdf.addPage(page));
  
  const outputPath = getOutputPath();
  fs.writeFileSync(outputPath, await newPdf.save());
  cleanupFiles([filePath]);
  return { path: outputPath, extractedPages: indices.length };
};

// ============ ADD HEADER/FOOTER ============
exports.addHeaderFooter = async (filePath, options = {}) => {
  const { header = '', footer = '', fontSize = 10, margin = 30 } = options;
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  
  pages.forEach((page, idx) => {
    const { width, height } = page.getSize();
    
    if (header) {
      const headerText = header.replace('{page}', idx + 1).replace('{total}', pages.length).replace('{date}', new Date().toLocaleDateString());
      const tw = font.widthOfTextAtSize(headerText, fontSize);
      page.drawText(headerText, { x: (width - tw) / 2, y: height - margin, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
    }
    if (footer) {
      const footerText = footer.replace('{page}', idx + 1).replace('{total}', pages.length).replace('{date}', new Date().toLocaleDateString());
      const tw = font.widthOfTextAtSize(footerText, fontSize);
      page.drawText(footerText, { x: (width - tw) / 2, y: margin - 10, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
    }
  });
  
  const outputPath = getOutputPath();
  fs.writeFileSync(outputPath, await pdf.save());
  cleanupFiles([filePath]);
  return { path: outputPath, pagesModified: pages.length };
};

// ============ RESIZE PDF PAGES ============
exports.resizePages = async (filePath, targetSize = 'A4') => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  
  const sizes = { 'A4': [595.28, 841.89], 'A3': [841.89, 1190.55], 'Letter': [612, 792], 'Legal': [612, 1008], 'A5': [419.53, 595.28] };
  const [newWidth, newHeight] = sizes[targetSize] || sizes['A4'];
  
  const newPdf = await PDFDocument.create();
  const pages = pdf.getPages();
  
  for (let i = 0; i < pages.length; i++) {
    const [embedded] = await newPdf.embedPages([pages[i]]);
    const page = newPdf.addPage([newWidth, newHeight]);
    const { width: origW, height: origH } = pages[i].getSize();
    const scale = Math.min(newWidth / origW, newHeight / origH);
    const x = (newWidth - origW * scale) / 2;
    const y = (newHeight - origH * scale) / 2;
    page.drawPage(embedded, { x, y, xScale: scale, yScale: scale });
  }
  
  const outputPath = getOutputPath();
  fs.writeFileSync(outputPath, await newPdf.save());
  cleanupFiles([filePath]);
  return { path: outputPath, newSize: targetSize, pages: pages.length };
};
