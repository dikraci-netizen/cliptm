/**
 * Wedding Planner Template
 * Includes: timeline, budget, vendor list, guest list, seating chart space
 */

export function generateWedding(engine, options = {}) {
  const theme = engine.theme;

  // Page 1: Wedding Overview
  let y = engine.drawHeader('Wedding Planner', 'Our Special Day');

  // Wedding Details
  engine.writeSectionHeader('WEDDING DETAILS', y);
  y += 20;
  const details = ['Couple Names:', 'Wedding Date:', 'Venue:', 'Theme/Style:', 'Color Palette:', 'Number of Guests:'];
  details.forEach((d) => {
    engine.writeText(d, engine.margin, y, { size: 9, color: theme.secondary });
    engine.drawLine(engine.margin + 120, y + 10, engine.margin + engine.contentWidth, y + 10, theme.lineColor);
    y += 24;
  });

  y += 15;

  // Timeline Overview
  engine.writeSectionHeader('PLANNING TIMELINE', y);
  y += 18;
  const timeline = [
    '12 months before', '9 months before', '6 months before',
    '3 months before', '1 month before', '1 week before', 'Day of'
  ];
  timeline.forEach((time, i) => {
    engine.drawCircle(engine.margin + 8, y + (i * 30) + 8, 5, { fill: theme.primary });
    if (i < timeline.length - 1) {
      engine.drawLine(engine.margin + 8, y + (i * 30) + 13, engine.margin + 8, y + ((i + 1) * 30) + 3, theme.lineColor);
    }
    engine.writeText(time, engine.margin + 22, y + (i * 30) + 3, { size: 8, font: theme.headerFont, color: theme.text });
    engine.drawLine(engine.margin + 130, y + (i * 30) + 10, engine.margin + engine.contentWidth, y + (i * 30) + 10, theme.lineColor);
  });

  // Page 2: Budget
  engine.addPage();
  y = engine.drawHeader('Wedding Budget', 'Financial Overview');

  engine.writeText('Total Budget: $', engine.margin, y, { size: 12, font: theme.headerFont, color: theme.primary });
  engine.drawLine(engine.margin + 120, y + 12, engine.margin + 250, y + 12, theme.border);
  y += 35;

  const budgetCats = [
    'Venue & Catering', 'Photography/Video', 'Flowers & Decor',
    'Music/DJ', 'Wedding Attire', 'Rings', 'Invitations/Stationery',
    'Hair & Makeup', 'Transportation', 'Cake/Dessert',
    'Favors', 'Officiant', 'Honeymoon', 'Miscellaneous'
  ];

  const budgetHeaders = ['Category', 'Estimated', 'Actual', 'Paid', 'Balance'];
  const budgetWidths = [engine.contentWidth * 0.3, engine.contentWidth * 0.17, engine.contentWidth * 0.17, engine.contentWidth * 0.18, engine.contentWidth * 0.18];

  let xPos = engine.margin;
  budgetHeaders.forEach((h, i) => {
    engine.writeText(h, xPos, y, { size: 8, font: theme.headerFont, color: theme.secondary });
    xPos += budgetWidths[i];
  });
  y += 14;
  engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.border, 1);
  y += 5;

  budgetCats.forEach((cat) => {
    engine.writeText(cat, engine.margin, y + 2, { size: 8, color: theme.text });
    xPos = engine.margin + budgetWidths[0];
    for (let c = 1; c < budgetWidths.length; c++) {
      engine.drawLine(xPos, y + 12, xPos + budgetWidths[c] - 10, y + 12, theme.lineColor);
      xPos += budgetWidths[c];
    }
    y += 20;
  });

  // Total row
  engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.border, 1);
  engine.writeText('TOTAL', engine.margin, y + 5, { size: 9, font: theme.headerFont, color: theme.primary });

  // Page 3: Vendor List
  engine.addPage();
  y = engine.drawHeader('Vendor Directory', 'Contact Information');

  const vendors = [
    'Venue', 'Caterer', 'Photographer', 'Videographer', 'Florist',
    'DJ/Band', 'Cake Baker', 'Hair Stylist', 'Makeup Artist', 'Officiant'
  ];

  vendors.forEach((vendor) => {
    engine.writeText(vendor, engine.margin, y, { size: 9, font: theme.headerFont, color: theme.primary });
    y += 14;
    engine.writeText('Contact:', engine.margin + 10, y, { size: 8, color: theme.lightText });
    engine.drawLine(engine.margin + 55, y + 8, engine.margin + 250, y + 8, theme.lineColor);
    engine.writeText('Phone:', engine.margin + 260, y, { size: 8, color: theme.lightText });
    engine.drawLine(engine.margin + 295, y + 8, engine.margin + engine.contentWidth, y + 8, theme.lineColor);
    y += 16;
    engine.writeText('Cost:', engine.margin + 10, y, { size: 8, color: theme.lightText });
    engine.drawLine(engine.margin + 40, y + 8, engine.margin + 150, y + 8, theme.lineColor);
    engine.writeText('Deposit:', engine.margin + 160, y, { size: 8, color: theme.lightText });
    engine.drawLine(engine.margin + 200, y + 8, engine.margin + 300, y + 8, theme.lineColor);
    engine.writeText('Paid:', engine.margin + 310, y, { size: 8, color: theme.lightText });
    engine.drawCheckbox(engine.margin + 340, y, 10);
    y += 22;
    engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.lineColor, 0.3);
    y += 10;
  });

  // Page 4: Guest List
  engine.addPage();
  y = engine.drawHeader('Guest List', 'Invitations & RSVPs');

  const guestHeaders = ['#', 'Name', 'Party Size', 'RSVP', 'Meal', 'Table'];
  const guestWidths = [25, engine.contentWidth * 0.3, 60, 50, 60, 50];

  xPos = engine.margin;
  guestHeaders.forEach((h, i) => {
    engine.writeText(h, xPos, y, { size: 8, font: theme.headerFont, color: theme.secondary });
    xPos += guestWidths[i];
  });
  y += 14;
  engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.border, 1);
  y += 5;

  for (let g = 0; g < 25; g++) {
    engine.writeText(String(g + 1), engine.margin + 5, y + 2, { size: 7, color: theme.lightText });
    xPos = engine.margin + guestWidths[0];
    for (let c = 1; c < guestWidths.length; c++) {
      engine.drawLine(xPos, y + 12, xPos + guestWidths[c] - 8, y + 12, theme.lineColor);
      xPos += guestWidths[c];
    }
    y += 18;
  }

  // Page 5: Day-of Schedule
  engine.addPage();
  y = engine.drawHeader('Day-of Timeline', 'Wedding Day Schedule');

  engine.writeSectionHeader('MORNING', y);
  y += 18;
  for (let t = 0; t < 6; t++) {
    engine.writeText('Time:', engine.margin, y, { size: 8, color: theme.lightText });
    engine.drawLine(engine.margin + 35, y + 8, engine.margin + 100, y + 8, theme.lineColor);
    engine.writeText('Task:', engine.margin + 110, y, { size: 8, color: theme.lightText });
    engine.drawLine(engine.margin + 140, y + 8, engine.margin + engine.contentWidth, y + 8, theme.lineColor);
    y += 22;
  }

  y += 10;
  engine.writeSectionHeader('CEREMONY', y);
  y += 18;
  for (let t = 0; t < 4; t++) {
    engine.writeText('Time:', engine.margin, y, { size: 8, color: theme.lightText });
    engine.drawLine(engine.margin + 35, y + 8, engine.margin + 100, y + 8, theme.lineColor);
    engine.writeText('Task:', engine.margin + 110, y, { size: 8, color: theme.lightText });
    engine.drawLine(engine.margin + 140, y + 8, engine.margin + engine.contentWidth, y + 8, theme.lineColor);
    y += 22;
  }

  y += 10;
  engine.writeSectionHeader('RECEPTION', y);
  y += 18;
  for (let t = 0; t < 8; t++) {
    engine.writeText('Time:', engine.margin, y, { size: 8, color: theme.lightText });
    engine.drawLine(engine.margin + 35, y + 8, engine.margin + 100, y + 8, theme.lineColor);
    engine.writeText('Task:', engine.margin + 110, y, { size: 8, color: theme.lightText });
    engine.drawLine(engine.margin + 140, y + 8, engine.margin + engine.contentWidth, y + 8, theme.lineColor);
    y += 22;
  }

  y += 15;
  engine.writeSectionHeader('EMERGENCY CONTACTS', y);
  y += 18;
  for (let c = 0; c < 4; c++) {
    engine.writeText('Name:', engine.margin, y, { size: 8, color: theme.lightText });
    engine.drawLine(engine.margin + 35, y + 8, engine.margin + 180, y + 8, theme.lineColor);
    engine.writeText('Phone:', engine.margin + 190, y, { size: 8, color: theme.lightText });
    engine.drawLine(engine.margin + 225, y + 8, engine.margin + engine.contentWidth, y + 8, theme.lineColor);
    y += 20;
  }
}

export const weddingMeta = {
  name: 'Wedding Planner',
  description: 'Complete wedding planning with budget, vendor directory, guest list, and day-of timeline',
  defaultPages: 5,
  category: 'event'
};
