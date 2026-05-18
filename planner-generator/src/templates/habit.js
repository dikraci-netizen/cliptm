/**
 * Habit Tracker Template
 * Includes: 30-day tracker grids, streak counter, habit stacking, reflection
 */

export function generateHabit(engine, options = {}) {
  const { pages = 12 } = options;
  const theme = engine.theme;

  for (let month = 0; month < pages; month++) {
    if (month > 0) engine.addPage();

    let y = engine.drawHeader('Habit Tracker', `Month ${month + 1}`);

    // Habits to Track
    engine.writeSectionHeader('HABITS TO TRACK', y);
    y += 20;

    const habits = 10;
    const daysInMonth = 31;
    const cellSize = 14;
    const habitNameWidth = 120;
    const dayColWidth = (engine.contentWidth - habitNameWidth) / daysInMonth;

    // Day numbers header
    engine.writeText('Habit', engine.margin, y, { size: 7, font: theme.headerFont, color: theme.secondary });
    for (let d = 1; d <= daysInMonth; d++) {
      engine.writeText(String(d), engine.margin + habitNameWidth + ((d - 1) * dayColWidth), y, {
        size: 5, color: theme.lightText
      });
    }
    y += 12;
    engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.border, 1);
    y += 4;

    // Habit rows with checkboxes
    for (let h = 0; h < habits; h++) {
      // Habit name line
      engine.drawLine(engine.margin, y + 10, engine.margin + habitNameWidth - 10, y + 10, theme.lineColor, 0.3);
      // Day checkboxes
      for (let d = 0; d < daysInMonth; d++) {
        const cellX = engine.margin + habitNameWidth + (d * dayColWidth);
        engine.drawRect(cellX, y, dayColWidth - 1, cellSize, { stroke: theme.lineColor });
      }
      y += cellSize + 4;
    }

    y += 20;

    // Habit Stacking Section
    engine.writeSectionHeader('HABIT STACKING', y);
    y += 18;
    engine.writeText('After I _______________, I will _______________', engine.margin, y, {
      size: 9, color: theme.lightText
    });
    y += 20;
    for (let i = 0; i < 4; i++) {
      engine.writeText(`${i + 1}.`, engine.margin, y + (i * 30), { size: 9, color: theme.primary });
      engine.writeText('After:', engine.margin + 15, y + (i * 30), { size: 8, color: theme.lightText });
      engine.drawLine(engine.margin + 45, y + (i * 30) + 8, engine.margin + 220, y + (i * 30) + 8, theme.lineColor);
      engine.writeText('I will:', engine.margin + 230, y + (i * 30), { size: 8, color: theme.lightText });
      engine.drawLine(engine.margin + 260, y + (i * 30) + 8, engine.margin + engine.contentWidth, y + (i * 30) + 8, theme.lineColor);
    }

    // Page 2: Streaks & Reflection
    engine.addPage();
    y = engine.drawHeader('Habit Review', `Month ${month + 1}`);

    // Streak Counter
    engine.writeSectionHeader('STREAK COUNTER', y);
    y += 20;
    for (let i = 0; i < 5; i++) {
      const streakY = y + (i * 35);
      engine.writeText('Habit:', engine.margin, streakY, { size: 8, color: theme.lightText });
      engine.drawLine(engine.margin + 40, streakY + 8, engine.margin + 180, streakY + 8, theme.lineColor);
      engine.writeText('Current Streak:', engine.margin + 190, streakY, { size: 8, color: theme.lightText });
      engine.drawLine(engine.margin + 270, streakY + 8, engine.margin + 320, streakY + 8, theme.lineColor);
      engine.writeText('Best Streak:', engine.margin + 330, streakY, { size: 8, color: theme.lightText });
      engine.drawLine(engine.margin + 400, streakY + 8, engine.margin + 450, streakY + 8, theme.lineColor);
      // Progress bar
      engine.drawProgressBar(engine.margin, streakY + 16, engine.contentWidth * 0.6);
    }

    y += 195;

    // Monthly Reflection
    engine.writeSectionHeader('MONTHLY REFLECTION', y);
    y += 20;
    const questions = [
      'Which habits did I maintain consistently?',
      'Which habits were most challenging? Why?',
      'What triggers helped me stay on track?',
      'What changes will I make next month?'
    ];
    questions.forEach((q) => {
      engine.writeText(q, engine.margin, y, { size: 9, color: theme.secondary });
      y += 14;
      y = engine.drawLinedArea(engine.margin, y, engine.contentWidth, 3, 18);
      y += 10;
    });

    // Win of the Month
    y += 5;
    engine.writeSectionHeader('WIN OF THE MONTH', y);
    y += 18;
    engine.drawRect(engine.margin, y, engine.contentWidth, 50, { stroke: theme.accent, radius: 4 });
  }
}

export const habitMeta = {
  name: 'Habit Tracker',
  description: 'Monthly habit tracking grid with streaks, habit stacking, and reflection prompts',
  defaultPages: 12,
  category: 'productivity'
};
