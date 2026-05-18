/**
 * Student Planner Template
 * Includes: class schedule, assignment tracker, study planner, exam prep, GPA tracker
 */

export function generateStudent(engine, options = {}) {
  const { pages = 16 } = options;
  const theme = engine.theme;

  // Page 1: Semester Overview
  let y = engine.drawHeader('Student Planner', 'Semester Overview');

  // Class Schedule
  engine.writeSectionHeader('CLASS SCHEDULE', y);
  y += 20;
  const times = ['8:00', '9:00', '10:00', '11:00', '12:00', '1:00', '2:00', '3:00', '4:00', '5:00'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const schedColW = (engine.contentWidth - 45) / 5;

  // Day headers
  engine.writeText('Time', engine.margin, y, { size: 7, font: theme.headerFont, color: theme.secondary });
  days.forEach((day, i) => {
    engine.writeText(day, engine.margin + 45 + (i * schedColW), y, { size: 7, font: theme.headerFont, color: theme.primary });
  });
  y += 14;
  engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.border, 1);
  y += 3;

  times.forEach((time) => {
    engine.writeText(time, engine.margin, y + 4, { size: 7, color: theme.lightText });
    for (let d = 0; d < 5; d++) {
      engine.drawRect(engine.margin + 45 + (d * schedColW), y, schedColW - 3, 22, { stroke: theme.lineColor });
    }
    y += 24;
  });

  y += 20;

  // Course List
  engine.writeSectionHeader('COURSES', y);
  y += 18;
  const courseHeaders = ['Course', 'Professor', 'Room', 'Credits'];
  const courseWidths = [engine.contentWidth * 0.35, engine.contentWidth * 0.25, engine.contentWidth * 0.2, engine.contentWidth * 0.2];
  
  let xPos = engine.margin;
  courseHeaders.forEach((h, i) => {
    engine.writeText(h, xPos, y, { size: 8, font: theme.headerFont, color: theme.secondary });
    xPos += courseWidths[i];
  });
  y += 14;
  engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.border, 1);
  y += 5;
  for (let c = 0; c < 6; c++) {
    xPos = engine.margin;
    courseWidths.forEach((w) => {
      engine.drawLine(xPos, y + 14, xPos + w - 10, y + 14, theme.lineColor);
      xPos += w;
    });
    y += 20;
  }

  // Weekly Pages
  for (let week = 0; week < Math.min(pages - 1, 15); week++) {
    engine.addPage();
    y = engine.drawHeader('Weekly Study Plan', `Week ${week + 1}`);

    // Assignment Tracker
    engine.writeSectionHeader('ASSIGNMENTS DUE', y);
    y += 18;
    const assignHeaders = ['Assignment', 'Course', 'Due Date', 'Status'];
    const assignWidths = [engine.contentWidth * 0.35, engine.contentWidth * 0.2, engine.contentWidth * 0.2, engine.contentWidth * 0.25];
    
    xPos = engine.margin;
    assignHeaders.forEach((h, i) => {
      engine.writeText(h, xPos, y, { size: 8, font: theme.headerFont, color: theme.secondary });
      xPos += assignWidths[i];
    });
    y += 14;
    engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.border, 1);
    y += 5;
    for (let a = 0; a < 6; a++) {
      engine.drawCheckbox(engine.margin, y + 2, 8);
      xPos = engine.margin + 14;
      assignWidths.forEach((w, i) => {
        const lineW = i === 0 ? w - 14 : w;
        engine.drawLine(xPos, y + 12, xPos + lineW - 10, y + 12, theme.lineColor);
        xPos += (i === 0 ? w - 14 : w);
      });
      y += 20;
    }

    y += 15;

    // Study Schedule
    engine.writeSectionHeader('STUDY SCHEDULE', y);
    y += 18;
    const studyDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayBlockH = 35;
    const halfWidth = engine.contentWidth * 0.48;

    studyDays.forEach((day, i) => {
      const col = i < 4 ? 0 : 1;
      const row = i < 4 ? i : i - 4;
      const x = col === 0 ? engine.margin : engine.margin + engine.contentWidth * 0.52;
      const dayY = y + (row * (dayBlockH + 5));

      engine.writeText(day, x, dayY, { size: 8, font: theme.headerFont, color: theme.primary });
      engine.drawRect(x, dayY + 12, halfWidth, dayBlockH - 12, { stroke: theme.lineColor, radius: 2 });
    });

    y += (4 * (dayBlockH + 5)) + 15;

    // Exam Prep Section
    engine.writeSectionHeader('EXAM PREP', y);
    y += 18;
    engine.writeText('Subject:', engine.margin, y, { size: 8, color: theme.lightText });
    engine.drawLine(engine.margin + 50, y + 8, engine.margin + 200, y + 8, theme.lineColor);
    engine.writeText('Date:', engine.margin + 210, y, { size: 8, color: theme.lightText });
    engine.drawLine(engine.margin + 240, y + 8, engine.margin + 350, y + 8, theme.lineColor);
    y += 22;
    engine.writeText('Topics to Review:', engine.margin, y, { size: 8, color: theme.lightText });
    y += 14;
    for (let t = 0; t < 4; t++) {
      engine.drawCheckbox(engine.margin, y + (t * 18), 8);
      engine.drawLine(engine.margin + 14, y + (t * 18) + 8, engine.margin + engine.contentWidth, y + (t * 18) + 8, theme.lineColor);
    }
  }
}

export const studentMeta = {
  name: 'Student Planner',
  description: 'Academic planning with class schedule, assignments, study planner, and exam prep',
  defaultPages: 16,
  category: 'education'
};
