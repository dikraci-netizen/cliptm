/**
 * Project Planner Template
 * Includes: project overview, timeline, task breakdown, meeting notes, risk register
 */

export function generateProject(engine, options = {}) {
  const { pages = 8 } = options;
  const theme = engine.theme;

  for (let proj = 0; proj < pages; proj++) {
    if (proj > 0) engine.addPage();

    let y = engine.drawHeader('Project Planner', `Project ${proj + 1}`);

    // Project Overview
    engine.writeSectionHeader('PROJECT OVERVIEW', y);
    y += 18;

    const fields = ['Project Name:', 'Client/Owner:', 'Start Date:', 'Deadline:', 'Budget:', 'Status:'];
    const fieldWidths = engine.contentWidth * 0.45;

    fields.forEach((field, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = col === 0 ? engine.margin : engine.margin + engine.contentWidth * 0.52;
      const fieldY = y + (row * 24);

      engine.writeText(field, x, fieldY, { size: 9, color: theme.secondary });
      engine.drawLine(x + 80, fieldY + 10, x + fieldWidths - 20, fieldY + 10, theme.lineColor);
    });

    y += 85;

    // Project Description
    engine.writeText('Description:', engine.margin, y, { size: 9, color: theme.secondary });
    y += 14;
    engine.drawRect(engine.margin, y, engine.contentWidth, 50, { stroke: theme.border, radius: 4 });
    y += 65;

    // Key Deliverables
    engine.writeSectionHeader('KEY DELIVERABLES', y);
    y += 18;
    for (let d = 0; d < 6; d++) {
      engine.drawCheckbox(engine.margin, y + (d * 22), 10);
      engine.drawLine(engine.margin + 16, y + (d * 22) + 10, engine.margin + engine.contentWidth * 0.6, y + (d * 22) + 10, theme.lineColor);
      engine.writeText('Due:', engine.margin + engine.contentWidth * 0.65, y + (d * 22) + 2, { size: 7, color: theme.lightText });
      engine.drawLine(engine.margin + engine.contentWidth * 0.72, y + (d * 22) + 10, engine.margin + engine.contentWidth, y + (d * 22) + 10, theme.lineColor);
    }

    y += 150;

    // Team Members
    engine.writeSectionHeader('TEAM & STAKEHOLDERS', y);
    y += 18;
    const teamHeaders = ['Name', 'Role', 'Contact', 'Responsibilities'];
    const teamWidths = [engine.contentWidth * 0.2, engine.contentWidth * 0.2, engine.contentWidth * 0.25, engine.contentWidth * 0.35];
    
    let xPos = engine.margin;
    teamHeaders.forEach((h, i) => {
      engine.writeText(h, xPos, y, { size: 8, font: theme.headerFont, color: theme.secondary });
      xPos += teamWidths[i];
    });
    y += 14;
    engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.border, 1);
    y += 5;

    for (let t = 0; t < 5; t++) {
      xPos = engine.margin;
      teamWidths.forEach((w) => {
        engine.drawLine(xPos, y + 14, xPos + w - 10, y + 14, theme.lineColor);
        xPos += w;
      });
      y += 20;
    }

    // Page 2: Timeline & Tasks
    engine.addPage();
    y = engine.drawHeader('Project Timeline', `Project ${proj + 1}`);

    // Gantt-style timeline
    engine.writeSectionHeader('TIMELINE (WEEKS)', y);
    y += 20;
    const weeks = 12;
    const taskNameW = 120;
    const weekColW = (engine.contentWidth - taskNameW) / weeks;

    // Week headers
    for (let w = 1; w <= weeks; w++) {
      engine.writeText(`W${w}`, engine.margin + taskNameW + ((w - 1) * weekColW), y, {
        size: 6, color: theme.lightText
      });
    }
    y += 12;
    engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.border, 1);
    y += 5;

    // Task rows
    for (let t = 0; t < 10; t++) {
      engine.writeText(`Task ${t + 1}:`, engine.margin, y + 2, { size: 7, color: theme.lightText });
      engine.drawLine(engine.margin + 30, y + 8, engine.margin + taskNameW - 5, y + 8, theme.lineColor, 0.3);
      for (let w = 0; w < weeks; w++) {
        engine.drawRect(engine.margin + taskNameW + (w * weekColW), y, weekColW - 1, 12, { stroke: theme.lineColor });
      }
      y += 18;
    }

    y += 25;

    // Risk Register
    engine.writeSectionHeader('RISK REGISTER', y);
    y += 18;
    const riskHeaders = ['Risk', 'Impact', 'Likelihood', 'Mitigation'];
    const riskWidths = [engine.contentWidth * 0.3, engine.contentWidth * 0.15, engine.contentWidth * 0.15, engine.contentWidth * 0.4];

    xPos = engine.margin;
    riskHeaders.forEach((h, i) => {
      engine.writeText(h, xPos, y, { size: 8, font: theme.headerFont, color: theme.secondary });
      xPos += riskWidths[i];
    });
    y += 14;
    engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.border, 1);
    y += 5;

    for (let r = 0; r < 5; r++) {
      xPos = engine.margin;
      riskWidths.forEach((w) => {
        engine.drawLine(xPos, y + 14, xPos + w - 10, y + 14, theme.lineColor);
        xPos += w;
      });
      y += 22;
    }

    y += 25;

    // Meeting Notes Space
    engine.writeSectionHeader('MEETING NOTES', y);
    y += 18;
    engine.writeText('Date:', engine.margin, y, { size: 8, color: theme.lightText });
    engine.drawLine(engine.margin + 30, y + 8, engine.margin + 120, y + 8, theme.lineColor);
    engine.writeText('Attendees:', engine.margin + 130, y, { size: 8, color: theme.lightText });
    engine.drawLine(engine.margin + 180, y + 8, engine.margin + engine.contentWidth, y + 8, theme.lineColor);
    y += 20;
    engine.drawLinedArea(engine.margin, y, engine.contentWidth, 5, 18);
  }
}

export const projectMeta = {
  name: 'Project Planner',
  description: 'Project management with timeline, deliverables, team roster, risk register, and meeting notes',
  defaultPages: 8,
  category: 'business'
};
