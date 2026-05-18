/**
 * Yearly Planner Template
 * Includes: year at a glance, quarterly goals, vision board space, milestones
 */

export function generateYearly(engine, options = {}) {
  const { year = new Date().getFullYear() } = options;
  const theme = engine.theme;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const quarters = ['Q1 (Jan-Mar)', 'Q2 (Apr-Jun)', 'Q3 (Jul-Sep)', 'Q4 (Oct-Dec)'];

  // Page 1: Year at a Glance
  let y = engine.drawHeader('Yearly Planner', String(year));

  engine.writeSectionHeader('YEAR AT A GLANCE', y);
  y += 20;

  // Mini calendars grid (4x3)
  const miniCalWidth = engine.contentWidth / 4 - 8;
  const miniCalHeight = 120;

  for (let m = 0; m < 12; m++) {
    const col = m % 4;
    const row = Math.floor(m / 4);
    const x = engine.margin + col * (miniCalWidth + 10);
    const calY = y + row * (miniCalHeight + 15);

    // Month header
    engine.drawRect(x, calY, miniCalWidth, 14, { fill: theme.lightBg, radius: 2 });
    engine.writeText(months[m], x + miniCalWidth / 2 - 8, calY + 3, {
      size: 7, font: theme.headerFont, color: theme.primary
    });

    // Day headers
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const dayCellW = miniCalWidth / 7;
    days.forEach((d, i) => {
      engine.writeText(d, x + (i * dayCellW) + 2, calY + 17, {
        size: 5, color: theme.lightText
      });
    });

    // Day numbers
    const firstDay = new Date(year, m, 1).getDay();
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    for (let d = 1; d <= daysInMonth; d++) {
      const pos = d + startOffset - 1;
      const dCol = pos % 7;
      const dRow = Math.floor(pos / 7);
      engine.writeText(String(d), x + (dCol * dayCellW) + 1, calY + 28 + (dRow * 14), {
        size: 5, color: theme.text
      });
    }
  }

  // Page 2: Quarterly Goals
  engine.addPage();
  y = engine.drawHeader('Quarterly Goals', String(year));

  quarters.forEach((quarter, qi) => {
    const qY = y + qi * 150;
    
    engine.drawRect(engine.margin, qY, engine.contentWidth, 140, {
      stroke: theme.border, radius: 4
    });
    
    engine.drawRect(engine.margin, qY, engine.contentWidth, 20, {
      fill: theme.primary, radius: 0
    });
    engine.writeText(quarter, engine.margin + 10, qY + 5, {
      font: theme.headerFont, size: 10, color: '#FFFFFF'
    });

    // Goals
    for (let g = 0; g < 4; g++) {
      const goalY = qY + 28 + (g * 26);
      engine.drawCheckbox(engine.margin + 10, goalY, 10);
      engine.drawLine(
        engine.margin + 26, goalY + 10,
        engine.margin + engine.contentWidth - 20, goalY + 10,
        theme.lineColor
      );
    }
  });

  // Page 3: Annual Vision & Milestones
  engine.addPage();
  y = engine.drawHeader('Vision & Milestones', String(year));

  // Vision areas
  const visionAreas = ['Career / Business', 'Health & Fitness', 'Relationships', 'Finance', 'Personal Growth', 'Fun & Recreation'];
  const colW = engine.contentWidth / 2 - 10;

  visionAreas.forEach((area, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = engine.margin + col * (colW + 20);
    const areaY = y + row * 130;

    engine.writeText(area.toUpperCase(), x, areaY, {
      font: theme.headerFont, size: 9, color: theme.primary
    });
    engine.drawRect(x, areaY + 14, colW, 100, {
      stroke: theme.border, radius: 4
    });
    // Goal line
    engine.writeText('Goal:', x + 8, areaY + 22, { size: 7, color: theme.lightText });
    engine.drawLine(x + 35, areaY + 32, x + colW - 10, areaY + 32, theme.lineColor);
    // Action steps
    engine.writeText('Steps:', x + 8, areaY + 40, { size: 7, color: theme.lightText });
    for (let s = 0; s < 3; s++) {
      engine.drawLine(x + 38, areaY + 52 + (s * 16), x + colW - 10, areaY + 52 + (s * 16), theme.lineColor);
    }
    // Deadline
    engine.writeText('Deadline:', x + 8, areaY + 98, { size: 7, color: theme.lightText });
    engine.drawLine(x + 50, areaY + 108, x + colW - 10, areaY + 108, theme.lineColor);
  });

  // Page 4: Important Dates & Birthdays
  engine.addPage();
  y = engine.drawHeader('Important Dates', String(year));

  const leftColW = engine.contentWidth * 0.48;
  const rightColW = engine.contentWidth * 0.48;
  const rightX = engine.margin + engine.contentWidth * 0.52;

  // Birthdays
  engine.writeSectionHeader('BIRTHDAYS', y);
  let leftY = y + 18;
  for (let i = 0; i < 15; i++) {
    engine.writeText('Date:', engine.margin, leftY + (i * 20), { size: 7, color: theme.lightText });
    engine.drawLine(engine.margin + 30, leftY + (i * 20) + 8, engine.margin + 80, leftY + (i * 20) + 8, theme.lineColor);
    engine.writeText('Name:', engine.margin + 85, leftY + (i * 20), { size: 7, color: theme.lightText });
    engine.drawLine(engine.margin + 115, leftY + (i * 20) + 8, engine.margin + leftColW, leftY + (i * 20) + 8, theme.lineColor);
  }

  // Anniversaries & Events
  engine.writeText('ANNIVERSARIES & EVENTS', rightX, y, {
    font: theme.headerFont, size: 10, color: theme.primary
  });
  let rightY = y + 18;
  for (let i = 0; i < 15; i++) {
    engine.writeText('Date:', rightX, rightY + (i * 20), { size: 7, color: theme.lightText });
    engine.drawLine(rightX + 30, rightY + (i * 20) + 8, rightX + 80, rightY + (i * 20) + 8, theme.lineColor);
    engine.writeText('Event:', rightX + 85, rightY + (i * 20), { size: 7, color: theme.lightText });
    engine.drawLine(rightX + 115, rightY + (i * 20) + 8, rightX + rightColW, rightY + (i * 20) + 8, theme.lineColor);
  }
}

export const yearlyMeta = {
  name: 'Yearly Planner',
  description: 'Complete yearly planning with calendar overview, quarterly goals, vision areas, and important dates',
  defaultPages: 4,
  category: 'productivity'
};
