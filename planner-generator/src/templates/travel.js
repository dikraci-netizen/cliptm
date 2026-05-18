/**
 * Travel Planner Template
 * Includes: trip overview, itinerary, packing list, budget, memories
 */

export function generateTravel(engine, options = {}) {
  const { pages = 6 } = options;
  const theme = engine.theme;

  for (let trip = 0; trip < pages; trip++) {
    if (trip > 0) engine.addPage();

    let y = engine.drawHeader('Travel Planner', `Trip ${trip + 1}`);

    // Trip Overview
    engine.writeSectionHeader('TRIP DETAILS', y);
    y += 20;
    const details = [
      ['Destination:', 'Travel Dates:'],
      ['Accommodation:', 'Confirmation #:'],
      ['Flight/Transport:', 'Booking Ref:'],
      ['Travel Insurance:', 'Policy #:']
    ];

    details.forEach((row) => {
      row.forEach((field, col) => {
        const x = col === 0 ? engine.margin : engine.margin + engine.contentWidth * 0.52;
        engine.writeText(field, x, y, { size: 8, color: theme.lightText });
        engine.drawLine(x + 90, y + 8, x + engine.contentWidth * 0.44, y + 8, theme.lineColor);
      });
      y += 22;
    });

    y += 15;

    // Daily Itinerary
    engine.writeSectionHeader('ITINERARY', y);
    y += 18;
    for (let day = 0; day < 5; day++) {
      engine.writeText(`Day ${day + 1}`, engine.margin, y, { size: 9, font: theme.headerFont, color: theme.primary });
      engine.writeText('Date:', engine.margin + 50, y, { size: 8, color: theme.lightText });
      engine.drawLine(engine.margin + 75, y + 8, engine.margin + 160, y + 8, theme.lineColor);
      y += 16;
      
      // Activities
      for (let a = 0; a < 3; a++) {
        engine.writeText('•', engine.margin + 10, y, { size: 8, color: theme.primary });
        engine.drawLine(engine.margin + 20, y + 8, engine.margin + engine.contentWidth * 0.6, y + 8, theme.lineColor);
        engine.writeText('Time:', engine.margin + engine.contentWidth * 0.65, y, { size: 7, color: theme.lightText });
        engine.drawLine(engine.margin + engine.contentWidth * 0.72, y + 8, engine.margin + engine.contentWidth, y + 8, theme.lineColor);
        y += 16;
      }
      y += 8;
    }

    // Page 2: Packing & Budget
    engine.addPage();
    y = engine.drawHeader('Packing & Budget', `Trip ${trip + 1}`);

    // Packing List
    engine.writeSectionHeader('PACKING LIST', y);
    y += 18;
    const packCategories = ['Clothing', 'Toiletries', 'Electronics', 'Documents', 'Miscellaneous'];
    const packColW = engine.contentWidth / 3 - 8;

    packCategories.forEach((cat, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = engine.margin + col * (packColW + 12);
      const catY = y + row * 130;

      engine.writeText(cat, x, catY, { size: 8, font: theme.headerFont, color: theme.primary });
      for (let item = 0; item < 6; item++) {
        engine.drawCheckbox(x, catY + 14 + (item * 16), 8);
        engine.drawLine(x + 14, catY + 14 + (item * 16) + 8, x + packColW - 5, catY + 14 + (item * 16) + 8, theme.lineColor);
      }
    });

    y += 280;

    // Travel Budget
    engine.writeSectionHeader('TRIP BUDGET', y);
    y += 18;
    const budgetItems = ['Flights/Transport', 'Accommodation', 'Food & Dining', 'Activities', 'Shopping', 'Emergency Fund'];
    const budgetHeaders = ['Category', 'Budget', 'Actual', 'Remaining'];
    const bWidths = [engine.contentWidth * 0.3, engine.contentWidth * 0.23, engine.contentWidth * 0.23, engine.contentWidth * 0.24];

    let xPos = engine.margin;
    budgetHeaders.forEach((h, i) => {
      engine.writeText(h, xPos, y, { size: 8, font: theme.headerFont, color: theme.secondary });
      xPos += bWidths[i];
    });
    y += 14;
    engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.border, 1);
    y += 5;

    budgetItems.forEach((item) => {
      engine.writeText(item, engine.margin, y + 2, { size: 8, color: theme.text });
      xPos = engine.margin + bWidths[0];
      for (let c = 1; c < bWidths.length; c++) {
        engine.drawLine(xPos, y + 12, xPos + bWidths[c] - 10, y + 12, theme.lineColor);
        xPos += bWidths[c];
      }
      y += 20;
    });

    // Total
    engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.border, 1);
    engine.writeText('TOTAL', engine.margin, y + 5, { size: 9, font: theme.headerFont, color: theme.primary });
  }
}

export const travelMeta = {
  name: 'Travel Planner',
  description: 'Trip planning with itinerary, packing lists, travel budget, and booking details',
  defaultPages: 6,
  category: 'lifestyle'
};
