/**
 * Self-Care Planner Template
 * Includes: mood tracker, self-care routines, gratitude journal, affirmations, wellness goals
 */

export function generateSelfcare(engine, options = {}) {
  const { pages = 12 } = options;
  const theme = engine.theme;

  for (let month = 0; month < pages; month++) {
    if (month > 0) engine.addPage();

    let y = engine.drawHeader('Self-Care Planner', `Month ${month + 1}`);

    // Mood Tracker (Monthly Grid)
    engine.writeSectionHeader('MOOD TRACKER', y);
    y += 18;
    engine.writeText('Color in each day based on your mood:', engine.margin, y, { size: 8, color: theme.lightText });
    y += 14;

    // Mood legend
    const moods = ['Amazing', 'Good', 'Okay', 'Low', 'Difficult'];
    moods.forEach((mood, i) => {
      engine.drawCircle(engine.margin + (i * 80) + 6, y + 5, 5, { stroke: theme.border });
      engine.writeText(mood, engine.margin + (i * 80) + 14, y + 1, { size: 7, color: theme.lightText });
    });
    y += 20;

    // Day circles
    for (let d = 0; d < 31; d++) {
      const col = d % 10;
      const row = Math.floor(d / 10);
      engine.drawCircle(engine.margin + (col * 30) + 12, y + (row * 30) + 12, 10, { stroke: theme.border });
      engine.writeText(String(d + 1), engine.margin + (col * 30) + 7, y + (row * 30) + 7, { size: 6, color: theme.lightText });
    }
    y += 110;

    // Self-Care Routines
    engine.writeSectionHeader('SELF-CARE ROUTINES', y);
    y += 18;

    const routines = ['Morning Routine', 'Evening Routine', 'Weekly Ritual'];
    const routineW = engine.contentWidth / 3 - 10;
    
    routines.forEach((routine, i) => {
      const x = engine.margin + i * (routineW + 15);
      engine.writeText(routine, x, y, { size: 8, font: theme.headerFont, color: theme.primary });
      for (let step = 0; step < 5; step++) {
        engine.drawCheckbox(x, y + 16 + (step * 18), 8);
        engine.drawLine(x + 14, y + 16 + (step * 18) + 8, x + routineW - 5, y + 16 + (step * 18) + 8, theme.lineColor);
      }
    });

    y += 120;

    // Wellness Goals
    engine.writeSectionHeader('WELLNESS GOALS THIS MONTH', y);
    y += 18;
    const wellnessAreas = ['Physical:', 'Mental:', 'Emotional:', 'Social:', 'Spiritual:'];
    wellnessAreas.forEach((area) => {
      engine.writeText(area, engine.margin, y, { size: 9, color: theme.secondary });
      engine.drawLine(engine.margin + 65, y + 10, engine.margin + engine.contentWidth, y + 10, theme.lineColor);
      y += 24;
    });

    // Page 2: Gratitude & Affirmations
    engine.addPage();
    y = engine.drawHeader('Gratitude & Affirmations', `Month ${month + 1}`);

    // Daily Gratitude
    engine.writeSectionHeader('DAILY GRATITUDE', y);
    y += 18;
    for (let d = 0; d < 10; d++) {
      engine.writeText(`Day ${d + 1}:`, engine.margin, y, { size: 8, color: theme.lightText });
      engine.drawLine(engine.margin + 40, y + 8, engine.margin + engine.contentWidth, y + 8, theme.lineColor);
      y += 20;
    }

    y += 15;

    // Affirmations
    engine.writeSectionHeader('POSITIVE AFFIRMATIONS', y);
    y += 18;
    engine.writeText('Write affirmations that resonate with you:', engine.margin, y, { size: 8, color: theme.lightText });
    y += 14;
    for (let a = 0; a < 5; a++) {
      engine.writeText('❝', engine.margin, y + (a * 25), { size: 10, color: theme.accent });
      engine.drawLine(engine.margin + 15, y + (a * 25) + 10, engine.margin + engine.contentWidth - 15, y + (a * 25) + 10, theme.lineColor);
    }

    y += 145;

    // Self-Care Check-In
    engine.writeSectionHeader('MONTHLY CHECK-IN', y);
    y += 18;
    const checkIns = [
      'How am I feeling physically?',
      'How am I feeling emotionally?',
      'What brought me joy this month?',
      'What boundaries do I need to set?',
      'What do I need more/less of?'
    ];
    checkIns.forEach((q) => {
      engine.writeText(q, engine.margin, y, { size: 9, color: theme.secondary });
      y += 14;
      engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.lineColor);
      y += 20;
    });
  }
}

export const selfcareMeta = {
  name: 'Self-Care Planner',
  description: 'Mood tracking, self-care routines, gratitude journal, affirmations, and wellness goals',
  defaultPages: 12,
  category: 'wellness'
};
