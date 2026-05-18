/**
 * Fitness Planner Template
 * Includes: workout tracker, body measurements, progress, cardio log
 */

export function generateFitness(engine, options = {}) {
  const { pages = 12 } = options;
  const theme = engine.theme;

  for (let week = 0; week < pages; week++) {
    if (week > 0) engine.addPage();

    let y = engine.drawHeader('Fitness Planner', `Week ${week + 1}`);

    // Weekly Fitness Goals
    engine.writeSectionHeader('FITNESS GOALS THIS WEEK', y);
    y += 18;
    for (let i = 0; i < 3; i++) {
      engine.drawCheckbox(engine.margin, y + (i * 20), 10);
      engine.drawLine(engine.margin + 16, y + (i * 20) + 10, engine.margin + engine.contentWidth, y + (i * 20) + 10, theme.lineColor);
    }
    y += 75;

    // Workout Log
    engine.writeSectionHeader('WORKOUT LOG', y);
    y += 20;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const colHeaders = ['Day', 'Workout Type', 'Duration', 'Calories', 'Notes'];
    const colWidths = [40, 140, 70, 70, engine.contentWidth - 320];
    
    let xPos = engine.margin;
    colHeaders.forEach((h, i) => {
      engine.writeText(h, xPos, y, { size: 8, font: theme.headerFont, color: theme.secondary });
      xPos += colWidths[i];
    });
    y += 14;
    engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.border, 1);
    y += 5;

    days.forEach((day) => {
      engine.writeText(day, engine.margin + 5, y + 3, { size: 8, color: theme.text });
      xPos = engine.margin + colWidths[0];
      for (let c = 1; c < colWidths.length; c++) {
        engine.drawLine(xPos, y + 14, xPos + colWidths[c] - 10, y + 14, theme.lineColor);
        xPos += colWidths[c];
      }
      y += 22;
    });

    y += 20;

    // Exercise Breakdown
    engine.writeSectionHeader('EXERCISE DETAILS', y);
    y += 20;
    const exerciseHeaders = ['Exercise', 'Sets', 'Reps', 'Weight', 'Rest'];
    const exColWidths = [engine.contentWidth * 0.3, engine.contentWidth * 0.15, engine.contentWidth * 0.15, engine.contentWidth * 0.2, engine.contentWidth * 0.2];
    
    xPos = engine.margin;
    exerciseHeaders.forEach((h, i) => {
      engine.writeText(h, xPos, y, { size: 8, font: theme.headerFont, color: theme.secondary });
      xPos += exColWidths[i];
    });
    y += 14;
    engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.border, 1);
    y += 5;

    for (let i = 0; i < 8; i++) {
      xPos = engine.margin;
      exColWidths.forEach((w) => {
        engine.drawLine(xPos, y + 14, xPos + w - 10, y + 14, theme.lineColor);
        xPos += w;
      });
      y += 20;
    }

    // Page 2: Measurements & Progress
    engine.addPage();
    y = engine.drawHeader('Progress Tracker', `Week ${week + 1}`);

    // Body Measurements
    engine.writeSectionHeader('BODY MEASUREMENTS', y);
    y += 20;
    const measurements = ['Weight', 'Body Fat %', 'Chest', 'Waist', 'Hips', 'Arms', 'Thighs'];
    const leftCol = engine.margin;
    const midCol = engine.margin + engine.contentWidth * 0.35;

    measurements.forEach((m, i) => {
      const col = i < 4 ? leftCol : midCol;
      const row = i < 4 ? i : i - 4;
      const mY = y + (row * 25);
      engine.writeText(m + ':', col, mY, { size: 9, color: theme.text });
      engine.drawLine(col + 80, mY + 10, col + 160, mY + 10, theme.lineColor);
    });

    y += 120;

    // Cardio Log
    engine.writeSectionHeader('CARDIO LOG', y);
    y += 20;
    const cardioHeaders = ['Day', 'Activity', 'Distance', 'Time', 'Heart Rate'];
    const cardioWidths = [40, 130, 80, 80, 80];
    
    xPos = engine.margin;
    cardioHeaders.forEach((h, i) => {
      engine.writeText(h, xPos, y, { size: 8, font: theme.headerFont, color: theme.secondary });
      xPos += cardioWidths[i];
    });
    y += 14;
    engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.border, 1);
    y += 5;

    for (let i = 0; i < 7; i++) {
      xPos = engine.margin;
      cardioWidths.forEach((w) => {
        engine.drawLine(xPos, y + 14, xPos + w - 10, y + 14, theme.lineColor);
        xPos += w;
      });
      y += 20;
    }

    y += 25;

    // Energy & Mood
    engine.writeSectionHeader('ENERGY & MOOD', y);
    y += 18;
    engine.writeText('Energy Level:', engine.margin, y, { size: 9, color: theme.text });
    engine.drawRatingScale(engine.margin + 90, y - 2, 5);
    y += 25;
    engine.writeText('Sleep Quality:', engine.margin, y, { size: 9, color: theme.text });
    engine.drawRatingScale(engine.margin + 90, y - 2, 5);
    y += 25;
    engine.writeText('Motivation:', engine.margin, y, { size: 9, color: theme.text });
    engine.drawRatingScale(engine.margin + 90, y - 2, 5);

    y += 35;
    engine.writeSectionHeader('NOTES & OBSERVATIONS', y);
    y += 18;
    engine.drawLinedArea(engine.margin, y, engine.contentWidth, 5, 20);
  }
}

export const fitnessMeta = {
  name: 'Fitness Planner',
  description: 'Workout tracking, body measurements, cardio log, and progress monitoring',
  defaultPages: 12,
  category: 'health'
};
