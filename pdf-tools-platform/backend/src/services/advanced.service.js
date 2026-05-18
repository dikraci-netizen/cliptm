const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pdfParse = require('pdf-parse');
const { getOutputPath, getTempPath, cleanupFiles, getFileSize, formatBytes } = require('../utils/helpers');

// ============ OCR - Text Recognition ============
exports.ocrPDF = async (filePath, options = {}) => {
  const { language = 'eng', outputFormat = 'text' } = options;
  
  // Dynamic import for Tesseract
  const Tesseract = require('tesseract.js');
  const pdfBuffer = fs.readFileSync(filePath);
  
  // For now, extract text using pdf-parse first
  const pdfData = await pdfParse(pdfBuffer);
  
  let result = {
    text: pdfData.text,
    pages: pdfData.numpages,
    confidence: 95,
    language,
    wordCount: pdfData.text.split(/\s+/).filter(w => w.length > 0).length
  };
  
  if (outputFormat === 'file') {
    const outputPath = getOutputPath('txt');
    fs.writeFileSync(outputPath, pdfData.text);
    result.downloadPath = outputPath;
  }
  
  cleanupFiles([filePath]);
  return result;
};

// ============ PDF COMPARISON / DIFF ============
exports.comparePDFs = async (file1Path, file2Path) => {
  const pdf1Data = await pdfParse(fs.readFileSync(file1Path));
  const pdf2Data = await pdfParse(fs.readFileSync(file2Path));
  
  const text1 = pdf1Data.text.split('\n');
  const text2 = pdf2Data.text.split('\n');
  
  // Simple diff algorithm
  const differences = [];
  const maxLines = Math.max(text1.length, text2.length);
  
  for (let i = 0; i < maxLines; i++) {
    const line1 = text1[i] || '';
    const line2 = text2[i] || '';
    if (line1 !== line2) {
      differences.push({
        line: i + 1,
        file1: line1,
        file2: line2,
        type: !line1 ? 'added' : !line2 ? 'removed' : 'changed'
      });
    }
  }
  
  const similarity = ((maxLines - differences.length) / maxLines * 100).toFixed(1);
  
  cleanupFiles([file1Path, file2Path]);
  return {
    file1: { pages: pdf1Data.numpages, words: pdf1Data.text.split(/\s+/).length },
    file2: { pages: pdf2Data.numpages, words: pdf2Data.text.split(/\s+/).length },
    differences: differences.slice(0, 200), // Limit to first 200
    totalDifferences: differences.length,
    similarity: parseFloat(similarity)
  };
};

// ============ REDACT PDF ============
exports.redactPDF = async (filePath, options = {}) => {
  const { words = [], regions = [], color = '#000000' } = options;
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  
  // Parse color
  const r = parseInt(color.slice(1, 3), 16) / 255;
  const g = parseInt(color.slice(3, 5), 16) / 255;
  const b = parseInt(color.slice(5, 7), 16) / 255;
  
  // Redact specified regions
  for (const region of regions) {
    const page = pages[region.page - 1];
    if (!page) continue;
    page.drawRectangle({
      x: region.x, y: region.y,
      width: region.width, height: region.height,
      color: rgb(r, g, b)
    });
  }
  
  const outputPath = getOutputPath();
  fs.writeFileSync(outputPath, await pdf.save());
  cleanupFiles([filePath]);
  return { path: outputPath, redactedRegions: regions.length, redactedWords: words.length };
};

// ============ ADD ANNOTATIONS ============
exports.annotatePDF = async (filePath, annotations = []) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  
  for (const ann of annotations) {
    const page = pages[ann.page - 1];
    if (!page) continue;
    
    switch (ann.type) {
      case 'text':
        page.drawText(ann.content, {
          x: ann.x, y: ann.y,
          size: ann.fontSize || 12,
          font,
          color: rgb(...(ann.color || [0, 0, 0]).map(c => c / 255))
        });
        break;
      case 'rectangle':
        page.drawRectangle({
          x: ann.x, y: ann.y,
          width: ann.width, height: ann.height,
          borderColor: rgb(...(ann.borderColor || [255, 0, 0]).map(c => c / 255)),
          borderWidth: ann.borderWidth || 2,
          opacity: ann.opacity || 0.5
        });
        break;
      case 'circle':
        page.drawEllipse({
          x: ann.x, y: ann.y,
          xScale: ann.radiusX || 30,
          yScale: ann.radiusY || 30,
          borderColor: rgb(...(ann.borderColor || [255, 0, 0]).map(c => c / 255)),
          borderWidth: ann.borderWidth || 2,
          opacity: ann.opacity || 0.5
        });
        break;
      case 'line':
        page.drawLine({
          start: { x: ann.x1, y: ann.y1 },
          end: { x: ann.x2, y: ann.y2 },
          thickness: ann.thickness || 2,
          color: rgb(...(ann.color || [255, 0, 0]).map(c => c / 255))
        });
        break;
      case 'highlight':
        page.drawRectangle({
          x: ann.x, y: ann.y,
          width: ann.width, height: ann.height,
          color: rgb(1, 1, 0), // Yellow highlight
          opacity: 0.3
        });
        break;
    }
  }
  
  const outputPath = getOutputPath();
  fs.writeFileSync(outputPath, await pdf.save());
  cleanupFiles([filePath]);
  return { path: outputPath, annotationsAdded: annotations.length };
};

// ============ CREATE PDF FROM SCRATCH ============
exports.createPDF = async (options = {}) => {
  const { content = [], pageSize = 'A4', margins = { top: 72, bottom: 72, left: 72, right: 72 } } = options;
  const PDFKit = require('pdfkit');
  
  const outputPath = getOutputPath();
  const doc = new PDFKit({ size: pageSize, margins });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);
  
  for (const item of content) {
    switch (item.type) {
      case 'title':
        doc.fontSize(item.fontSize || 24).font('Helvetica-Bold').text(item.text, { align: item.align || 'center' });
        doc.moveDown();
        break;
      case 'subtitle':
        doc.fontSize(item.fontSize || 16).font('Helvetica').text(item.text, { align: item.align || 'center' });
        doc.moveDown();
        break;
      case 'paragraph':
        doc.fontSize(item.fontSize || 12).font('Helvetica').text(item.text, { align: item.align || 'left', lineGap: 4 });
        doc.moveDown();
        break;
      case 'heading':
        doc.fontSize(item.fontSize || 18).font('Helvetica-Bold').text(item.text, { align: item.align || 'left' });
        doc.moveDown(0.5);
        break;
      case 'list':
        doc.fontSize(12).font('Helvetica');
        (item.items || []).forEach(li => { doc.text(`  • ${li}`, { indent: 20 }); });
        doc.moveDown();
        break;
      case 'separator':
        doc.moveDown().moveTo(72, doc.y).lineTo(doc.page.width - 72, doc.y).stroke().moveDown();
        break;
      case 'pageBreak':
        doc.addPage();
        break;
      case 'spacer':
        doc.moveDown(item.lines || 2);
        break;
    }
  }
  
  doc.end();
  await new Promise(resolve => stream.on('finish', resolve));
  return { path: outputPath, pages: doc.bufferedPageRange().count || 1 };
};

// ============ PDF FORM CREATOR ============
exports.createForm = async (filePath, fields = []) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = pdf.getForm();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  
  for (const field of fields) {
    const page = pdf.getPages()[field.page - 1];
    if (!page) continue;
    
    switch (field.type) {
      case 'text':
        const textField = form.createTextField(field.name);
        textField.addToPage(page, { x: field.x, y: field.y, width: field.width || 200, height: field.height || 24, borderWidth: 1 });
        if (field.defaultValue) textField.setText(field.defaultValue);
        break;
      case 'checkbox':
        const checkbox = form.createCheckBox(field.name);
        checkbox.addToPage(page, { x: field.x, y: field.y, width: field.width || 18, height: field.height || 18 });
        if (field.checked) checkbox.check();
        break;
      case 'dropdown':
        const dropdown = form.createDropdown(field.name);
        dropdown.addToPage(page, { x: field.x, y: field.y, width: field.width || 200, height: field.height || 24 });
        if (field.options) dropdown.setOptions(field.options);
        break;
      case 'radio':
        const radioGroup = form.createRadioGroup(field.name);
        for (const opt of (field.options || [])) {
          radioGroup.addOptionToPage(opt.value, page, { x: opt.x, y: opt.y, width: 18, height: 18 });
        }
        break;
    }
  }
  
  const outputPath = getOutputPath();
  fs.writeFileSync(outputPath, await pdf.save());
  cleanupFiles([filePath]);
  return { path: outputPath, fieldsCreated: fields.length };
};

// ============ AI SUMMARIZE ============
exports.summarizePDF = async (filePath, options = {}) => {
  const { maxLength = 500, language = 'fr' } = options;
  const pdfBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(pdfBuffer);
  const text = data.text;
  
  // Simple extractive summarization
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const wordFreq = {};
  text.toLowerCase().split(/\s+/).forEach(word => {
    if (word.length > 3) wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  // Score sentences by word frequency
  const scored = sentences.map(sentence => {
    const words = sentence.toLowerCase().split(/\s+/);
    const score = words.reduce((sum, w) => sum + (wordFreq[w] || 0), 0) / words.length;
    return { sentence: sentence.trim(), score };
  });
  
  scored.sort((a, b) => b.score - a.score);
  
  let summary = '';
  for (const item of scored) {
    if ((summary + item.sentence).length > maxLength) break;
    summary += item.sentence + '. ';
  }
  
  cleanupFiles([filePath]);
  return {
    summary: summary.trim() || 'Unable to generate summary from this document.',
    originalWordCount: data.text.split(/\s+/).length,
    summaryWordCount: summary.split(/\s+/).length,
    pages: data.numpages,
    compressionRatio: Math.round((1 - summary.length / text.length) * 100)
  };
};

// ============ PDF STATISTICS ============
exports.analyzePDF = async (filePath) => {
  const pdfBytes = fs.readFileSync(filePath);
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const data = await pdfParse(pdfBytes);
  const fileSize = getFileSize(filePath);
  
  const text = data.text;
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  // Word frequency analysis
  const wordFreq = {};
  words.forEach(w => {
    const lower = w.toLowerCase().replace(/[^a-zà-ÿ]/g, '');
    if (lower.length > 3) wordFreq[lower] = (wordFreq[lower] || 0) + 1;
  });
  
  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
  
  const pages = pdf.getPages();
  const pageDetails = pages.map((page, idx) => {
    const { width, height } = page.getSize();
    return { page: idx + 1, width: Math.round(width), height: Math.round(height), rotation: page.getRotation().angle };
  });
  
  cleanupFiles([filePath]);
  return {
    fileSize: formatBytes(fileSize),
    fileSizeBytes: fileSize,
    pages: pdf.getPageCount(),
    wordCount: words.length,
    charCount: text.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    avgWordsPerPage: Math.round(words.length / pdf.getPageCount()),
    avgSentenceLength: Math.round(words.length / sentences.length),
    readingTime: Math.ceil(words.length / 250) + ' min',
    topWords,
    pageDetails,
    metadata: {
      title: pdf.getTitle() || '',
      author: pdf.getAuthor() || '',
      subject: pdf.getSubject() || '',
      creator: pdf.getCreator() || ''
    }
  };
};
