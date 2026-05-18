/**
 * Daily Planner Template
 * Includes: schedule, priorities, to-do list, notes, gratitude, water tracker
 */

export function generateDaily(engine, options = {}) {
  const { pages = 30, startDate = null } = options;
  const theme = engine.theme;

  for (let day = 0; day < pages; day++) {
    if (day > 0) engine.addPage();

    const date = startDate 
      ? new Date(new Date(startDate).getTime() + day * 86400000)
      : null;
    
    const dateStr = date 
      ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      : `Day ${day + 1}`;

    let y = engine.drawHeader('Daily Planner', dateStr);

    // Top Priorities Section
    engine.writeSectionHeader('TOP 3 PRIORITIES', y);
    y += 20;
    for (let i = 0; i < 3; i++) {
      engine.drawCheckbox(engine.margin, y + (i * 24));
      engine.drawLine(
        engine.margin + 20, y + (i * 24) + 12,
        engine.margin + engine.contentWidth * 0.55, y + (i * 24) + 12,
        theme.lineColor
      );
    }

    // Today's Focus
    const focusX = engine.margin + engine.contentWidth * 0.6;
    engine.writeSectionHeader("TODAY'S FOCUS", y - 20);
    engine.writeText("Today's Focus:", focusX, y - 20, {
      font: theme.headerFont,
      size: 10,
      color: theme.primary
    });
    engine.drawRect(focusX, y, engine.contentWidth * 0.38, 55, {
      stroke: theme.border,
      radius: 4
    });

    y += 85;

    // Schedule Section
    engine.writeSectionHeader('SCHEDULE', y);
    y += 20;
    const scheduleWidth = engine.contentWidth * 0.55;
    y = engine.drawTimeSlots(engine.margin, y, 6, 21, scheduleWidth, 22);

    // Right column - To Do List
    const rightX = engine.margin + engine.contentWidth * 0.6;
    let rightY = 175;

    engine.writeText('TO-DO LIST', rightX, rightY, {
      font: theme.headerFont,
      size: 10,
      color: theme.primary
    });
    rightY += 18;
    for (let i = 0; i < 10; i++) {
      engine.drawCheckbox(rightX, rightY + (i * 22), 10);
      engine.drawLine(
        rightX + 16, rightY + (i * 22) + 10,
        rightX + engine.contentWidth * 0.37, rightY + (i * 22) + 10,
        theme.lineColor
      );
    }

    // Water Tracker
    rightY += 235;
    engine.writeText('WATER INTAKE', rightX, rightY, {
      font: theme.headerFont,
      size: 10,
      color: theme.primary
    });
    rightY += 18;
    for (let i = 0; i < 8; i++) {
      engine.drawCircle(rightX + (i * 20) + 8, rightY + 8, 7, {
        stroke: theme.border
      });
    }

    // Gratitude & Notes at bottom
    rightY += 35;
    engine.writeText('GRATITUDE', rightX, rightY, {
      font: theme.headerFont,
      size: 10,
      color: theme.primary
    });
    rightY += 18;
    for (let i = 0; i < 3; i++) {
      engine.drawLine(
        rightX, rightY + (i * 20),
        rightX + engine.contentWidth * 0.37, rightY + (i * 20),
        theme.lineColor
      );
    }

    // Notes section at very bottom
    rightY += 70;
    engine.writeText('NOTES', rightX, rightY, {
      font: theme.headerFont,
      size: 10,
      color: theme.primary
    });
    rightY += 18;
    engine.drawLinedArea(rightX, rightY, engine.contentWidth * 0.37, 4, 18);
  }
}

export const dailyMeta = {
  name: 'Daily Planner',
  description: 'Complete daily planning with schedule, priorities, to-dos, water tracker, and gratitude section',
  defaultPages: 30,
  category: 'productivity'
};
