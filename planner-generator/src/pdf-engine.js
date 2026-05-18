/**
 * Pure PDF Generation Engine - ZERO DEPENDENCIES
 * Creates PDF files using only Node.js built-in modules
 * Implements PDF 1.4 specification directly
 */

import fs from 'fs';
import path from 'path';

// PDF coordinate system: origin at bottom-left, y increases upward
// We abstract this so users work in top-down coordinates

export class PDFEngine {
  constructor(options = {}) {
    this.theme = options.theme;
    this.pageSize = options.pageSize;
    this.margin = options.margin || 40;
    this.objects = [];
    this.pages = [];
    this.currentPage = null;
    this.currentPageContent = '';
    this.fonts = {};
    this.objectCount = 0;
    this._setupFonts();
  }

  _setupFonts() {
    // PDF base 14 fonts (always available, no embedding needed)
    this.fonts = {
      'Helvetica': 'Helvetica',
      'Helvetica-Bold': 'Helvetica-Bold',
      'Helvetica-Oblique': 'Helvetica-Oblique',
      'Times-Roman': 'Times-Roman',
      'Times-Bold': 'Times-Bold',
      'Courier': 'Courier',
      'Courier-Bold': 'Courier-Bold'
    };
  }

  _nextObjId() {
    return ++this.objectCount;
  }

  _pdfColor(hexColor) {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return { r, g, b };
  }

  _toY(y) {
    // Convert top-down y to PDF bottom-up y
    return this.pageSize.height - y;
  }

  // ==================== DOCUMENT MANAGEMENT ====================

  createDocument(outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.outputPath = outputPath;
    this._startPage();
  }

  _startPage() {
    if (this.currentPage !== null) {
      this.pages.push(this.currentPageContent);
    }
    this.currentPageContent = '';
    this.currentPage = this.pages.length;
  }

  addPage() {
    this._startPage();
  }

  finalize() {
    // Save current page
    if (this.currentPageContent) {
      this.pages.push(this.currentPageContent);
    }
    this._writePDF();
  }

  _writePDF() {
    let pdf = '';
    let offsets = [];
    let objNum = 0;

    // Header
    pdf += '%PDF-1.4\n%âãÏÓ\n';

    // Font objects
    const fontNames = ['Helvetica', 'Helvetica-Bold', 'Times-Roman', 'Times-Bold', 'Courier'];
    const fontObjStart = objNum + 1;
    
    for (let i = 0; i < fontNames.length; i++) {
      objNum++;
      offsets.push(pdf.length);
      pdf += `${objNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /${fontNames[i]} /Encoding /WinAnsiEncoding >>\nendobj\n`;
    }

    // Page content streams
    const contentObjIds = [];
    for (let i = 0; i < this.pages.length; i++) {
      objNum++;
      offsets.push(pdf.length);
      const stream = this.pages[i];
      pdf += `${objNum} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`;
      contentObjIds.push(objNum);
    }

    // Page objects
    const pageObjIds = [];
    const pagesObjId = objNum + this.pages.length + 1;

    for (let i = 0; i < this.pages.length; i++) {
      objNum++;
      offsets.push(pdf.length);
      pdf += `${objNum} 0 obj\n<< /Type /Page /Parent ${pagesObjId} 0 R /MediaBox [0 0 ${this.pageSize.width} ${this.pageSize.height}] /Contents ${contentObjIds[i]} 0 R /Resources << /Font << /F1 ${fontObjStart} 0 R /F2 ${fontObjStart + 1} 0 R /F3 ${fontObjStart + 2} 0 R /F4 ${fontObjStart + 3} 0 R /F5 ${fontObjStart + 4} 0 R >> >> >>\nendobj\n`;
      pageObjIds.push(objNum);
    }

    // Pages object
    objNum++;
    offsets.push(pdf.length);
    const kidsStr = pageObjIds.map(id => `${id} 0 R`).join(' ');
    pdf += `${objNum} 0 obj\n<< /Type /Pages /Kids [${kidsStr}] /Count ${this.pages.length} >>\nendobj\n`;
    const pagesObj = objNum;

    // Catalog
    objNum++;
    offsets.push(pdf.length);
    pdf += `${objNum} 0 obj\n<< /Type /Catalog /Pages ${pagesObj} 0 R >>\nendobj\n`;
    const catalogObj = objNum;

    // Info
    objNum++;
    offsets.push(pdf.length);
    pdf += `${objNum} 0 obj\n<< /Title (Professional Planner) /Author (Pro Planner Generator) /Creator (Pro Planner Generator v2.0) /Producer (Pro Planner Generator) >>\nendobj\n`;
    const infoObj = objNum;

    // Cross-reference table
    const xrefOffset = pdf.length;
    pdf += 'xref\n';
    pdf += `0 ${objNum + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let i = 0; i < offsets.length; i++) {
      pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }

    // Trailer
    pdf += 'trailer\n';
    pdf += `<< /Size ${objNum + 1} /Root ${catalogObj} 0 R /Info ${infoObj} 0 R >>\n`;
    pdf += 'startxref\n';
    pdf += `${xrefOffset}\n`;
    pdf += '%%EOF\n';

    fs.writeFileSync(this.outputPath, pdf, 'binary');
  }

  // ==================== FONT HELPERS ====================

  _fontRef(fontName) {
    const map = {
      'Helvetica': '/F1',
      'Helvetica-Bold': '/F2',
      'Times-Roman': '/F3',
      'Times-Bold': '/F4',
      'Courier': '/F5'
    };
    return map[fontName] || '/F1';
  }

  _escapeText(text) {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  // ==================== LAYOUT HELPERS ====================

  get contentWidth() {
    return this.pageSize.width - (this.margin * 2);
  }

  get contentHeight() {
    return this.pageSize.height - (this.margin * 2);
  }

  get centerX() {
    return this.pageSize.width / 2;
  }

  get centerY() {
    return this.pageSize.height / 2;
  }

  // ==================== DRAWING PRIMITIVES ====================

  drawLine(x1, y1, x2, y2, color = null, width = 0.5) {
    const c = this._pdfColor(color || this.theme.lineColor);
    this.currentPageContent += `${c.r.toFixed(3)} ${c.g.toFixed(3)} ${c.b.toFixed(3)} RG\n`;
    this.currentPageContent += `${width} w\n`;
    this.currentPageContent += `${x1.toFixed(2)} ${this._toY(y1).toFixed(2)} m ${x2.toFixed(2)} ${this._toY(y2).toFixed(2)} l S\n`;
  }

  drawRect(x, y, w, h, options = {}) {
    const { fill, stroke, radius } = options;

    if (fill) {
      const c = this._pdfColor(fill);
      this.currentPageContent += `${c.r.toFixed(3)} ${c.g.toFixed(3)} ${c.b.toFixed(3)} rg\n`;
    }
    if (stroke) {
      const c = this._pdfColor(stroke);
      this.currentPageContent += `${c.r.toFixed(3)} ${c.g.toFixed(3)} ${c.b.toFixed(3)} RG\n`;
      this.currentPageContent += `0.5 w\n`;
    }

    const pdfY = this._toY(y + h);

    if (radius && radius > 0) {
      // Rounded rectangle using cubic bezier curves
      const r = Math.min(radius, w / 2, h / 2);
      const k = 0.5523; // bezier approx for quarter circle
      this.currentPageContent += `${(x + r).toFixed(2)} ${pdfY.toFixed(2)} m\n`;
      this.currentPageContent += `${(x + w - r).toFixed(2)} ${pdfY.toFixed(2)} l\n`;
      this.currentPageContent += `${(x + w - r + r * k).toFixed(2)} ${pdfY.toFixed(2)} ${(x + w).toFixed(2)} ${(pdfY + r - r * k).toFixed(2)} ${(x + w).toFixed(2)} ${(pdfY + r).toFixed(2)} c\n`;
      this.currentPageContent += `${(x + w).toFixed(2)} ${(pdfY + h - r).toFixed(2)} l\n`;
      this.currentPageContent += `${(x + w).toFixed(2)} ${(pdfY + h - r + r * k).toFixed(2)} ${(x + w - r + r * k).toFixed(2)} ${(pdfY + h).toFixed(2)} ${(x + w - r).toFixed(2)} ${(pdfY + h).toFixed(2)} c\n`;
      this.currentPageContent += `${(x + r).toFixed(2)} ${(pdfY + h).toFixed(2)} l\n`;
      this.currentPageContent += `${(x + r - r * k).toFixed(2)} ${(pdfY + h).toFixed(2)} ${x.toFixed(2)} ${(pdfY + h - r + r * k).toFixed(2)} ${x.toFixed(2)} ${(pdfY + h - r).toFixed(2)} c\n`;
      this.currentPageContent += `${x.toFixed(2)} ${(pdfY + r).toFixed(2)} l\n`;
      this.currentPageContent += `${x.toFixed(2)} ${(pdfY + r - r * k).toFixed(2)} ${(x + r - r * k).toFixed(2)} ${pdfY.toFixed(2)} ${(x + r).toFixed(2)} ${pdfY.toFixed(2)} c\n`;
    } else {
      this.currentPageContent += `${x.toFixed(2)} ${pdfY.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re\n`;
    }

    if (fill && stroke) {
      this.currentPageContent += 'B\n';
    } else if (fill) {
      this.currentPageContent += 'f\n';
    } else if (stroke) {
      this.currentPageContent += 'S\n';
    }
  }

  drawCircle(x, y, r, options = {}) {
    const { fill, stroke } = options;
    const k = 0.5523 * r;
    const cy = this._toY(y);

    if (fill) {
      const c = this._pdfColor(fill);
      this.currentPageContent += `${c.r.toFixed(3)} ${c.g.toFixed(3)} ${c.b.toFixed(3)} rg\n`;
    }
    if (stroke) {
      const c = this._pdfColor(stroke);
      this.currentPageContent += `${c.r.toFixed(3)} ${c.g.toFixed(3)} ${c.b.toFixed(3)} RG\n`;
      this.currentPageContent += `0.5 w\n`;
    }

    // Draw circle using 4 bezier curves
    this.currentPageContent += `${(x + r).toFixed(2)} ${cy.toFixed(2)} m\n`;
    this.currentPageContent += `${(x + r).toFixed(2)} ${(cy + k).toFixed(2)} ${(x + k).toFixed(2)} ${(cy + r).toFixed(2)} ${x.toFixed(2)} ${(cy + r).toFixed(2)} c\n`;
    this.currentPageContent += `${(x - k).toFixed(2)} ${(cy + r).toFixed(2)} ${(x - r).toFixed(2)} ${(cy + k).toFixed(2)} ${(x - r).toFixed(2)} ${cy.toFixed(2)} c\n`;
    this.currentPageContent += `${(x - r).toFixed(2)} ${(cy - k).toFixed(2)} ${(x - k).toFixed(2)} ${(cy - r).toFixed(2)} ${x.toFixed(2)} ${(cy - r).toFixed(2)} c\n`;
    this.currentPageContent += `${(x + k).toFixed(2)} ${(cy - r).toFixed(2)} ${(x + r).toFixed(2)} ${(cy - k).toFixed(2)} ${(x + r).toFixed(2)} ${cy.toFixed(2)} c\n`;

    if (fill && stroke) {
      this.currentPageContent += 'B\n';
    } else if (fill) {
      this.currentPageContent += 'f\n';
    } else if (stroke) {
      this.currentPageContent += 'S\n';
    }
  }

  // ==================== TEXT HELPERS ====================

  writeText(text, x, y, options = {}) {
    const {
      font = this.theme.bodyFont,
      size = 10,
      color = this.theme.text,
      align = 'left',
      width = null
    } = options;

    const c = this._pdfColor(color);
    const fontRef = this._fontRef(font);

    let textX = x;
    if (align === 'center' && width) {
      // Approximate text width (rough: 0.5 * size per char for Helvetica)
      const approxWidth = text.length * size * 0.45;
      textX = x + (width - approxWidth) / 2;
    } else if (align === 'right' && width) {
      const approxWidth = text.length * size * 0.45;
      textX = x + width - approxWidth;
    }

    const pdfY = this._toY(y + size * 0.8);
    this.currentPageContent += `BT\n${fontRef} ${size} Tf\n${c.r.toFixed(3)} ${c.g.toFixed(3)} ${c.b.toFixed(3)} rg\n${textX.toFixed(2)} ${pdfY.toFixed(2)} Td\n(${this._escapeText(text)}) Tj\nET\n`;
  }

  writeTitle(text, y = null) {
    const yPos = y || this.margin;
    this.writeText(text, this.margin, yPos, {
      font: this.theme.headerFont,
      size: 24,
      color: this.theme.primary,
      align: 'center',
      width: this.contentWidth
    });
  }

  writeSubtitle(text, y) {
    this.writeText(text, this.margin, y, {
      font: this.theme.headerFont,
      size: 14,
      color: this.theme.secondary,
      align: 'center',
      width: this.contentWidth
    });
  }

  writeSectionHeader(text, y) {
    this.writeText(text, this.margin, y, {
      font: this.theme.headerFont,
      size: 12,
      color: this.theme.primary
    });
  }

  // ==================== PLANNER COMPONENTS ====================

  drawHeader(title, subtitle = '') {
    // Header background
    this.drawRect(0, 0, this.pageSize.width, 60, { fill: this.theme.primary });

    // Title
    this.writeText(title, this.margin, 15, {
      font: this.theme.headerFont,
      size: 18,
      color: '#FFFFFF',
      width: this.contentWidth
    });

    if (subtitle) {
      this.writeText(subtitle, this.margin, 38, {
        font: this.theme.bodyFont,
        size: 10,
        color: '#FFFFFF',
        width: this.contentWidth
      });
    }

    return 75;
  }

  drawCheckbox(x, y, size = 12) {
    this.drawRect(x, y, size, size, {
      stroke: this.theme.border,
      radius: 2
    });
  }

  drawLinedArea(x, y, width, lines, lineSpacing = 22) {
    for (let i = 0; i < lines; i++) {
      const lineY = y + (i * lineSpacing);
      this.drawLine(x, lineY, x + width, lineY, this.theme.lineColor);
    }
    return y + (lines * lineSpacing);
  }

  drawDottedArea(x, y, width, lines, dotSpacing = 8, lineSpacing = 22) {
    for (let i = 0; i < lines; i++) {
      const lineY = y + (i * lineSpacing);
      for (let dx = 0; dx <= width; dx += dotSpacing) {
        this.drawCircle(x + dx, lineY, 0.5, { fill: this.theme.lineColor });
      }
    }
    return y + (lines * lineSpacing);
  }

  drawGrid(x, y, cols, rows, cellWidth, cellHeight) {
    const totalWidth = cols * cellWidth;
    const totalHeight = rows * cellHeight;

    for (let i = 0; i <= rows; i++) {
      const lineY = y + (i * cellHeight);
      const weight = i === 0 ? 1 : 0.5;
      this.drawLine(x, lineY, x + totalWidth, lineY, this.theme.border, weight);
    }

    for (let i = 0; i <= cols; i++) {
      const lineX = x + (i * cellWidth);
      const weight = i === 0 ? 1 : 0.5;
      this.drawLine(lineX, y, lineX, y + totalHeight, this.theme.border, weight);
    }

    return { width: totalWidth, height: totalHeight };
  }

  drawTimeSlots(x, y, startHour, endHour, width, slotHeight = 20) {
    for (let hour = startHour; hour <= endHour; hour++) {
      const slotY = y + ((hour - startHour) * slotHeight);
      const timeStr = hour <= 12 ? `${hour}:00 ${hour < 12 ? 'AM' : 'PM'}` : `${hour - 12}:00 PM`;
      
      this.writeText(timeStr, x, slotY + 3, {
        size: 8,
        color: this.theme.lightText
      });
      
      this.drawLine(x + 50, slotY + slotHeight, x + width, slotY + slotHeight, this.theme.lineColor);
    }
    return y + ((endHour - startHour + 1) * slotHeight);
  }

  drawProgressBar(x, y, width, height = 12) {
    this.drawRect(x, y, width, height, {
      stroke: this.theme.border,
      radius: height / 2
    });
    const segments = 10;
    const segWidth = width / segments;
    for (let i = 1; i < segments; i++) {
      this.drawLine(x + (i * segWidth), y, x + (i * segWidth), y + height, this.theme.lineColor, 0.3);
    }
  }

  drawRatingScale(x, y, count = 5, size = 14) {
    for (let i = 0; i < count; i++) {
      this.drawCircle(x + (i * (size + 6)) + size / 2, y + size / 2, size / 2, {
        stroke: this.theme.border
      });
    }
  }

  drawPriorityMarker(x, y) {
    const labels = ['H', 'M', 'L'];
    labels.forEach((label, i) => {
      this.drawCircle(x + (i * 20), y + 6, 7, { stroke: this.theme.border });
      this.writeText(label, x + (i * 20) - 3, y + 2, {
        size: 7,
        color: this.theme.lightText
      });
    });
  }

  // ==================== COVER PAGE ====================

  drawCoverPage(title, subtitle, year = '') {
    // Full page background
    this.drawRect(0, 0, this.pageSize.width, this.pageSize.height, {
      fill: this.theme.primary
    });

    // Decorative border
    this.drawRect(this.margin, this.margin, this.contentWidth, this.contentHeight, {
      stroke: this.theme.accent
    });

    // Inner border
    this.drawRect(this.margin + 8, this.margin + 8, this.contentWidth - 16, this.contentHeight - 16, {
      stroke: this.theme.accent
    });

    // Title
    const titleY = this.centerY - 60;
    this.writeText(title, this.margin + 20, titleY, {
      font: this.theme.headerFont,
      size: 32,
      color: '#FFFFFF',
      align: 'center',
      width: this.contentWidth - 40
    });

    // Decorative line
    const lineY = titleY + 40;
    this.drawLine(this.centerX - 60, lineY, this.centerX + 60, lineY, this.theme.accent, 2);

    // Subtitle
    if (subtitle) {
      this.writeText(subtitle, this.margin + 20, titleY + 55, {
        font: this.theme.bodyFont,
        size: 14,
        color: this.theme.accent,
        align: 'center',
        width: this.contentWidth - 40
      });
    }

    // Year
    if (year) {
      this.writeText(year, this.margin + 20, titleY + 85, {
        font: this.theme.headerFont,
        size: 20,
        color: '#FFFFFF',
        align: 'center',
        width: this.contentWidth - 40
      });
    }
  }
}
