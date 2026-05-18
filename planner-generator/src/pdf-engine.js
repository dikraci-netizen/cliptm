/**
 * PDF Generation Engine
 * Core rendering utilities for creating professional planner pages
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export class PDFEngine {
  constructor(options = {}) {
    this.theme = options.theme;
    this.pageSize = options.pageSize;
    this.margin = options.margin || 40;
    this.doc = null;
  }

  createDocument(outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.doc = new PDFDocument({
      size: [this.pageSize.width, this.pageSize.height],
      margins: {
        top: this.margin,
        bottom: this.margin,
        left: this.margin,
        right: this.margin
      },
      info: {
        Title: 'Professional Planner',
        Author: 'Pro Planner Generator',
        Creator: 'Pro Planner Generator v1.0'
      }
    });

    const stream = fs.createWriteStream(outputPath);
    this.doc.pipe(stream);

    return new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
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
    this.doc
      .strokeColor(color || this.theme.lineColor)
      .lineWidth(width)
      .moveTo(x1, y1)
      .lineTo(x2, y2)
      .stroke();
  }

  drawRect(x, y, w, h, options = {}) {
    const { fill, stroke, radius, opacity } = options;
    
    if (opacity) this.doc.opacity(opacity);
    
    let shape;
    if (radius) {
      shape = this.doc.roundedRect(x, y, w, h, radius);
    } else {
      shape = this.doc.rect(x, y, w, h);
    }

    if (fill && stroke) {
      shape.fillAndStroke(fill, stroke);
    } else if (fill) {
      shape.fill(fill);
    } else if (stroke) {
      shape.stroke(stroke);
    }

    if (opacity) this.doc.opacity(1);
  }

  drawCircle(x, y, r, options = {}) {
    const { fill, stroke } = options;
    const circle = this.doc.circle(x, y, r);
    
    if (fill && stroke) {
      circle.fillAndStroke(fill, stroke);
    } else if (fill) {
      circle.fill(fill);
    } else if (stroke) {
      circle.stroke(stroke);
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

    this.doc
      .font(font)
      .fontSize(size)
      .fillColor(color);

    const textOptions = { align };
    if (width) textOptions.width = width;

    this.doc.text(text, x, y, textOptions);
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
    this.drawRect(0, 0, this.pageSize.width, 60, {
      fill: this.theme.primary
    });

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
        width: this.contentWidth,
        opacity: 0.8
      });
    }

    return 75; // Return Y position after header
  }

  drawCheckbox(x, y, size = 12, checked = false) {
    this.drawRect(x, y, size, size, {
      stroke: this.theme.border,
      radius: 2
    });
    
    if (checked) {
      this.writeText('✓', x + 2, y - 1, {
        size: 10,
        color: this.theme.primary
      });
    }
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

  drawGrid(x, y, cols, rows, cellWidth, cellHeight, options = {}) {
    const { headerRow = false, headerCol = false } = options;
    const totalWidth = cols * cellWidth;
    const totalHeight = rows * cellHeight;

    // Draw horizontal lines
    for (let i = 0; i <= rows; i++) {
      const lineY = y + (i * cellHeight);
      const weight = (i === 0 || (headerRow && i === 1)) ? 1 : 0.5;
      this.drawLine(x, lineY, x + totalWidth, lineY, this.theme.border, weight);
    }

    // Draw vertical lines
    for (let i = 0; i <= cols; i++) {
      const lineX = x + (i * cellWidth);
      const weight = (i === 0 || (headerCol && i === 1)) ? 1 : 0.5;
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
    // Segments
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
    // Three circles for priority levels
    const labels = ['H', 'M', 'L'];
    labels.forEach((label, i) => {
      this.drawCircle(x + (i * 20), y + 6, 7, { stroke: this.theme.border });
      this.writeText(label, x + (i * 20) - 3, y + 2, {
        size: 7,
        color: this.theme.lightText
      });
    });
  }

  // ==================== PAGE MANAGEMENT ====================

  addPage() {
    this.doc.addPage();
  }

  finalize() {
    this.doc.end();
  }

  // ==================== COVER PAGE ====================

  drawCoverPage(title, subtitle, year = '') {
    // Full page background
    this.drawRect(0, 0, this.pageSize.width, this.pageSize.height, {
      fill: this.theme.primary
    });

    // Decorative elements
    this.drawRect(this.margin, this.margin, this.contentWidth, this.contentHeight, {
      stroke: this.theme.accent,
      radius: 4
    });

    // Inner border
    this.drawRect(this.margin + 8, this.margin + 8, this.contentWidth - 16, this.contentHeight - 16, {
      stroke: this.theme.accent,
      radius: 4
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

    // Subtitle
    if (subtitle) {
      this.writeText(subtitle, this.margin + 20, titleY + 50, {
        font: this.theme.bodyFont,
        size: 16,
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

    // Decorative line
    const lineY = titleY + 40;
    this.drawLine(
      this.centerX - 60, lineY,
      this.centerX + 60, lineY,
      this.theme.accent, 2
    );
  }
}
