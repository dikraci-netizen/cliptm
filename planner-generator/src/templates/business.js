/**
 * Business Planner Template
 * Includes: business model canvas, marketing plan, revenue tracker, client management
 */

export function generateBusiness(engine, options = {}) {
  const { pages = 12 } = options;
  const theme = engine.theme;

  // Page 1: Business Model Canvas
  let y = engine.drawHeader('Business Planner', 'Strategic Overview');

  engine.writeSectionHeader('BUSINESS MODEL CANVAS', y);
  y += 20;

  const canvasW = engine.contentWidth;
  const canvasH = 350;
  const cellW = canvasW / 5;
  const halfH = canvasH / 2;

  // Top row (3 cells spanning full height on sides, 2 cells in middle split)
  engine.drawRect(engine.margin, y, cellW, canvasH, { stroke: theme.border });
  engine.writeText('Key Partners', engine.margin + 5, y + 5, { size: 7, font: theme.headerFont, color: theme.primary });

  engine.drawRect(engine.margin + cellW, y, cellW, halfH, { stroke: theme.border });
  engine.writeText('Key Activities', engine.margin + cellW + 5, y + 5, { size: 7, font: theme.headerFont, color: theme.primary });
  engine.drawRect(engine.margin + cellW, y + halfH, cellW, halfH, { stroke: theme.border });
  engine.writeText('Key Resources', engine.margin + cellW + 5, y + halfH + 5, { size: 7, font: theme.headerFont, color: theme.primary });

  engine.drawRect(engine.margin + cellW * 2, y, cellW, canvasH, { stroke: theme.border });
  engine.writeText('Value Proposition', engine.margin + cellW * 2 + 5, y + 5, { size: 7, font: theme.headerFont, color: theme.primary });

  engine.drawRect(engine.margin + cellW * 3, y, cellW, halfH, { stroke: theme.border });
  engine.writeText('Customer Relations', engine.margin + cellW * 3 + 5, y + 5, { size: 7, font: theme.headerFont, color: theme.primary });
  engine.drawRect(engine.margin + cellW * 3, y + halfH, cellW, halfH, { stroke: theme.border });
  engine.writeText('Channels', engine.margin + cellW * 3 + 5, y + halfH + 5, { size: 7, font: theme.headerFont, color: theme.primary });

  engine.drawRect(engine.margin + cellW * 4, y, cellW, canvasH, { stroke: theme.border });
  engine.writeText('Customer Segments', engine.margin + cellW * 4 + 5, y + 5, { size: 7, font: theme.headerFont, color: theme.primary });

  // Bottom row
  y += canvasH;
  engine.drawRect(engine.margin, y, canvasW / 2, 80, { stroke: theme.border });
  engine.writeText('Cost Structure', engine.margin + 5, y + 5, { size: 7, font: theme.headerFont, color: theme.primary });
  engine.drawRect(engine.margin + canvasW / 2, y, canvasW / 2, 80, { stroke: theme.border });
  engine.writeText('Revenue Streams', engine.margin + canvasW / 2 + 5, y + 5, { size: 7, font: theme.headerFont, color: theme.primary });

  // Monthly Pages
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  for (let m = 0; m < Math.min(pages - 1, 12); m++) {
    engine.addPage();
    y = engine.drawHeader('Monthly Business Review', months[m]);

    // Revenue & Sales
    engine.writeSectionHeader('REVENUE & SALES', y);
    y += 18;
    const revenueItems = ['Total Revenue:', 'New Customers:', 'Returning Customers:', 'Average Order:', 'Conversion Rate:'];
    revenueItems.forEach((item) => {
      engine.writeText(item, engine.margin, y, { size: 9, color: theme.text });
      engine.drawLine(engine.margin + 130, y + 10, engine.margin + 280, y + 10, theme.lineColor);
      y += 22;
    });

    y += 10;

    // Key Metrics
    engine.writeSectionHeader('KEY METRICS', y);
    y += 18;
    const metricW = engine.contentWidth / 3 - 10;
    const metrics = ['Website Visitors', 'Email Subscribers', 'Social Followers', 'Revenue Growth', 'Customer Satisfaction', 'Profit Margin'];
    metrics.forEach((metric, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = engine.margin + col * (metricW + 15);
      const mY = y + row * 45;
      
      engine.drawRect(x, mY, metricW, 35, { stroke: theme.border, radius: 4 });
      engine.writeText(metric, x + 5, mY + 5, { size: 7, color: theme.lightText });
      engine.drawLine(x + 5, mY + 25, x + metricW - 5, mY + 25, theme.lineColor);
    });

    y += 105;

    // Action Items
    engine.writeSectionHeader('ACTION ITEMS', y);
    y += 18;
    for (let a = 0; a < 8; a++) {
      engine.drawCheckbox(engine.margin, y + (a * 20), 10);
      engine.drawLine(engine.margin + 16, y + (a * 20) + 10, engine.margin + engine.contentWidth * 0.7, y + (a * 20) + 10, theme.lineColor);
      engine.drawPriorityMarker(engine.margin + engine.contentWidth * 0.75, y + (a * 20));
    }

    y += 180;

    // Notes
    engine.writeSectionHeader('NOTES & IDEAS', y);
    y += 18;
    engine.drawLinedArea(engine.margin, y, engine.contentWidth, 5, 20);
  }
}

export const businessMeta = {
  name: 'Business Planner',
  description: 'Business model canvas, monthly revenue tracking, key metrics, and action plans',
  defaultPages: 12,
  category: 'business'
};
