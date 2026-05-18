/**
 * Weekly Planner Template
 * Includes: week overview, daily blocks, goals, habit tracker, meal plan
 */

export function generateWeekly(engine, options = {}) {
  const { pages = 52 } = options;
  const theme = engine.theme;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (let week = 0; week < pages; week++) {
    if (week > 0) engine.addPage();

    let y = engine.drawHeader('Weekly Planner', `Week ${week + 1}`);

    // Weekly Goals
    engine.writeSectionHeader('WEEKLY GOALS', y);
    y += 18;
    for (let i = 0; i < 3; i++) {
      engine.drawCheckbox(engine.margin, y + (i * 20), 10);
      engine.drawLine(
        engine.margin + 16, y + (i * 20) + 10,
        engine.margin + engine.contentWidth * 0.45, y + (i * 20) + 10,
        theme.lineColor
      );
    }

    // Focus of the week
    const focusX = engine.margin + engine.contentWidth * 0.5;
    engine.writeText('FOCUS THIS WEEK', focusX, y - 18, {
      font: theme.headerFont,
      size: 10,
      color: theme.primary
    });
    engine.drawRect(focusX, y, engine.contentWidth * 0.48, 50, {
      stroke: theme.border,
      radius: 4
    });

    y += 75;

    // Day blocks - left column (Mon-Thu) and right column (Fri-Sun)
    const colWidth = engine.contentWidth * 0.48;
    const leftX = engine.margin;
    const rightX = engine.margin + engine.contentWidth * 0.52;
    const dayBlockHeight = 80;

    for (let i = 0; i < 7; i++) {
      const col = i < 4 ? 0 : 1;
      const row = i < 4 ? i : i - 4;
      const x = col === 0 ? leftX : rightX;
      const dayY = y + (row * (dayBlockHeight + 10));

      // Day header
      engine.drawRect(x, dayY, colWidth, 18, {
        fill: theme.lightBg,
        radius: 2
      });
      engine.writeText(days[i], x + 8, dayY + 4, {
        font: theme.headerFont,
        size: 9,
        color: theme.primary
      });

      // Day content area
      engine.drawRect(x, dayY + 18, colWidth, dayBlockHeight - 18, {
        stroke: theme.border
      });

      // Task lines inside
      for (let line = 0; line < 3; line++) {
        const lineY = dayY + 30 + (line * 18);
        engine.drawCheckbox(x + 5, lineY, 8);
        engine.drawLine(x + 18, lineY + 8, x + colWidth - 8, lineY + 8, theme.lineColor);
      }
    }

    // Second page - Habit Tracker & Notes
    engine.addPage();
    y = engine.drawHeader('Weekly Review', `Week ${week + 1}`);

    // Habit Tracker
    engine.writeSectionHeader('HABIT TRACKER', y);
    y += 20;
    
    // Header row
    engine.writeText('Habit', engine.margin, y, { size: 8, font: theme.headerFont, color: theme.secondary });
    days.forEach((day, i) => {
      engine.writeText(day.substring(0, 3), engine.margin + 120 + (i * 50), y, {
        size: 8, font: theme.headerFont, color: theme.secondary
      });
    });
    y += 15;

    for (let habit = 0; habit < 8; habit++) {
      engine.drawLine(engine.margin, y + 18, engine.margin + engine.contentWidth, y + 18, theme.lineColor);
      // Habit name line
      engine.drawLine(engine.margin, y + 14, engine.margin + 110, y + 14, theme.lineColor, 0.3);
      // Checkboxes for each day
      days.forEach((_, i) => {
        engine.drawCheckbox(engine.margin + 125 + (i * 50), y + 3, 10);
      });
      y += 22;
    }

    y += 20;

    // Weekly Reflection
    engine.writeSectionHeader('WEEKLY REFLECTION', y);
    y += 20;

    const reflections = ['What went well this week?', 'What could be improved?', 'What am I grateful for?'];
    reflections.forEach((question) => {
      engine.writeText(question, engine.margin, y, {
        size: 9, color: theme.secondary, font: theme.bodyFont
      });
      y += 15;
      y = engine.drawLinedArea(engine.margin, y, engine.contentWidth, 3, 18);
      y += 10;
    });

    // Next Week Prep
    engine.writeSectionHeader('NEXT WEEK PRIORITIES', y);
    y += 18;
    for (let i = 0; i < 5; i++) {
      engine.drawCheckbox(engine.margin, y + (i * 22), 10);
      engine.drawLine(
        engine.margin + 16, y + (i * 22) + 10,
        engine.margin + engine.contentWidth, y + (i * 22) + 10,
        theme.lineColor
      );
    }
  }
}

export const weeklyMeta = {
  name: 'Weekly Planner',
  description: 'Complete weekly planning with day blocks, habit tracker, reflection, and goal setting',
  defaultPages: 52,
  category: 'productivity'
};
