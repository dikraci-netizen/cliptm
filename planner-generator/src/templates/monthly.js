/**
 * Monthly Planner Template
 * Includes: calendar view, goals, budget overview, important dates
 */

export function generateMonthly(engine, options = {}) {
  const { pages = 12, year = new Date().getFullYear() } = options;
  const theme = engine.theme;
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  for (let month = 0; month < pages; month++) {
    if (month > 0) engine.addPage();

    const monthName = months[month % 12];
    let y = engine.drawHeader('Monthly Planner', `${monthName} ${year}`);

    // Monthly Goals
    engine.writeSectionHeader('MONTHLY GOALS', y);
    y += 18;
    for (let i = 0; i < 5; i++) {
      engine.drawCheckbox(engine.margin, y + (i * 20), 10);
      engine.drawLine(
        engine.margin + 16, y + (i * 20) + 10,
        engine.margin + engine.contentWidth * 0.55, y + (i * 20) + 10,
        theme.lineColor
      );
    }

    // Focus / Theme for the month
    const focusX = engine.margin + engine.contentWidth * 0.6;
    engine.writeText('MONTH THEME', focusX, y - 18, {
      font: theme.headerFont, size: 10, color: theme.primary
    });
    engine.drawRect(focusX, y, engine.contentWidth * 0.38, 40, {
      stroke: theme.border, radius: 4
    });

    // Key dates
    engine.writeText('KEY DATES', focusX, y + 50, {
      font: theme.headerFont, size: 10, color: theme.primary
    });
    for (let i = 0; i < 4; i++) {
      engine.drawLine(focusX, y + 68 + (i * 18), focusX + engine.contentWidth * 0.38, y + 68 + (i * 18), theme.lineColor);
    }

    y += 120;

    // Calendar Grid
    engine.writeSectionHeader('CALENDAR', y);
    y += 20;

    const cellWidth = engine.contentWidth / 7;
    const cellHeight = 55;
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Day headers
    daysOfWeek.forEach((day, i) => {
      engine.drawRect(engine.margin + (i * cellWidth), y, cellWidth, 18, {
        fill: theme.lightBg
      });
      engine.writeText(day, engine.margin + (i * cellWidth) + cellWidth / 2 - 10, y + 4, {
        size: 8, font: theme.headerFont, color: theme.primary
      });
    });
    y += 18;

    // Calendar cells (6 rows)
    const firstDay = new Date(year, month % 12, 1).getDay();
    const daysInMonth = new Date(year, (month % 12) + 1, 0).getDate();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 7; col++) {
        const dayNum = row * 7 + col - startOffset + 1;
        const cellX = engine.margin + (col * cellWidth);
        const cellY = y + (row * cellHeight);

        engine.drawRect(cellX, cellY, cellWidth, cellHeight, {
          stroke: theme.lineColor
        });

        if (dayNum >= 1 && dayNum <= daysInMonth) {
          engine.writeText(String(dayNum), cellX + 4, cellY + 3, {
            size: 8, font: theme.headerFont, color: theme.text
          });
          // Lined area for notes
          for (let line = 0; line < 2; line++) {
            engine.drawLine(
              cellX + 4, cellY + 22 + (line * 14),
              cellX + cellWidth - 4, cellY + 22 + (line * 14),
              theme.lineColor, 0.3
            );
          }
        }
      }
    }

    // Second page - Monthly Overview
    engine.addPage();
    y = engine.drawHeader('Monthly Overview', `${monthName} ${year}`);

    // Projects / Tasks
    engine.writeSectionHeader('PROJECTS & TASKS', y);
    y += 20;
    for (let i = 0; i < 10; i++) {
      engine.drawCheckbox(engine.margin, y + (i * 22), 10);
      engine.drawLine(
        engine.margin + 16, y + (i * 22) + 10,
        engine.margin + engine.contentWidth * 0.6, y + (i * 22) + 10,
        theme.lineColor
      );
      // Deadline space
      engine.writeText('Due:', engine.margin + engine.contentWidth * 0.65, y + (i * 22) + 2, {
        size: 7, color: theme.lightText
      });
      engine.drawLine(
        engine.margin + engine.contentWidth * 0.72, y + (i * 22) + 10,
        engine.margin + engine.contentWidth, y + (i * 22) + 10,
        theme.lineColor
      );
    }

    y += 240;

    // Budget Overview
    engine.writeSectionHeader('BUDGET SNAPSHOT', y);
    y += 20;
    const budgetItems = ['Income:', 'Fixed Expenses:', 'Variable Expenses:', 'Savings Goal:', 'Remaining:'];
    budgetItems.forEach((item, i) => {
      engine.writeText(item, engine.margin, y + (i * 22), {
        size: 9, color: theme.secondary
      });
      engine.drawLine(
        engine.margin + 120, y + (i * 22) + 10,
        engine.margin + engine.contentWidth * 0.45, y + (i * 22) + 10,
        theme.lineColor
      );
    });

    // Notes
    const notesX = engine.margin + engine.contentWidth * 0.55;
    engine.writeText('NOTES', notesX, y - 20, {
      font: theme.headerFont, size: 10, color: theme.primary
    });
    engine.drawLinedArea(notesX, y, engine.contentWidth * 0.43, 8, 18);
  }
}

export const monthlyMeta = {
  name: 'Monthly Planner',
  description: 'Monthly calendar with goals, budget snapshot, projects tracking, and key dates',
  defaultPages: 12,
  category: 'productivity'
};
