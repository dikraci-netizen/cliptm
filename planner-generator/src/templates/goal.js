/**
 * Goal Setting Planner Template
 * Includes: SMART goals, action plans, milestone tracker, vision board layout
 */

export function generateGoal(engine, options = {}) {
  const { pages = 10 } = options;
  const theme = engine.theme;

  for (let goal = 0; goal < pages; goal++) {
    if (goal > 0) engine.addPage();

    let y = engine.drawHeader('Goal Planner', `Goal ${goal + 1}`);

    // SMART Goal Framework
    engine.writeSectionHeader('SMART GOAL DEFINITION', y);
    y += 20;

    // Goal statement
    engine.writeText('My Goal:', engine.margin, y, { size: 10, font: theme.headerFont, color: theme.primary });
    y += 16;
    engine.drawRect(engine.margin, y, engine.contentWidth, 40, { stroke: theme.border, radius: 4 });
    y += 55;

    // SMART breakdown
    const smart = [
      { letter: 'S', label: 'Specific', prompt: 'What exactly do I want to accomplish?' },
      { letter: 'M', label: 'Measurable', prompt: 'How will I measure progress?' },
      { letter: 'A', label: 'Achievable', prompt: 'Is this realistic? What resources do I need?' },
      { letter: 'R', label: 'Relevant', prompt: 'Why is this important to me?' },
      { letter: 'T', label: 'Time-bound', prompt: 'What is my deadline?' }
    ];

    smart.forEach((item) => {
      // Letter circle
      engine.drawCircle(engine.margin + 12, y + 8, 10, { fill: theme.primary });
      engine.writeText(item.letter, engine.margin + 8, y + 3, { size: 10, font: theme.headerFont, color: '#FFFFFF' });
      
      // Label and prompt
      engine.writeText(item.label, engine.margin + 30, y, { size: 10, font: theme.headerFont, color: theme.text });
      engine.writeText(item.prompt, engine.margin + 30, y + 14, { size: 8, color: theme.lightText });
      engine.drawLine(engine.margin + 30, y + 30, engine.margin + engine.contentWidth, y + 30, theme.lineColor);
      y += 42;
    });

    // Deadline
    y += 10;
    engine.writeText('Start Date:', engine.margin, y, { size: 9, color: theme.secondary });
    engine.drawLine(engine.margin + 70, y + 10, engine.margin + 180, y + 10, theme.lineColor);
    engine.writeText('Target Date:', engine.margin + 200, y, { size: 9, color: theme.secondary });
    engine.drawLine(engine.margin + 270, y + 10, engine.margin + 380, y + 10, theme.lineColor);

    // Page 2: Action Plan
    engine.addPage();
    y = engine.drawHeader('Action Plan', `Goal ${goal + 1}`);

    // Milestones
    engine.writeSectionHeader('MILESTONES', y);
    y += 20;
    for (let m = 0; m < 5; m++) {
      const milestoneY = y + (m * 35);
      engine.drawCircle(engine.margin + 8, milestoneY + 8, 6, { stroke: theme.primary });
      engine.writeText(`Milestone ${m + 1}:`, engine.margin + 22, milestoneY, { size: 8, color: theme.lightText });
      engine.drawLine(engine.margin + 85, milestoneY + 8, engine.margin + engine.contentWidth * 0.6, milestoneY + 8, theme.lineColor);
      engine.writeText('By:', engine.margin + engine.contentWidth * 0.65, milestoneY, { size: 8, color: theme.lightText });
      engine.drawLine(engine.margin + engine.contentWidth * 0.7, milestoneY + 8, engine.margin + engine.contentWidth, milestoneY + 8, theme.lineColor);
      // Connection line between milestones
      if (m < 4) {
        engine.drawLine(engine.margin + 8, milestoneY + 14, engine.margin + 8, milestoneY + 35, theme.lineColor, 0.5);
      }
    }

    y += 195;

    // Action Steps
    engine.writeSectionHeader('ACTION STEPS', y);
    y += 20;
    for (let s = 0; s < 10; s++) {
      engine.drawCheckbox(engine.margin, y + (s * 22), 10);
      engine.drawLine(engine.margin + 16, y + (s * 22) + 10, engine.margin + engine.contentWidth * 0.65, y + (s * 22) + 10, theme.lineColor);
      engine.writeText('Due:', engine.margin + engine.contentWidth * 0.7, y + (s * 22) + 2, { size: 7, color: theme.lightText });
      engine.drawLine(engine.margin + engine.contentWidth * 0.76, y + (s * 22) + 10, engine.margin + engine.contentWidth, y + (s * 22) + 10, theme.lineColor);
    }

    y += 235;

    // Obstacles & Solutions
    engine.writeSectionHeader('POTENTIAL OBSTACLES & SOLUTIONS', y);
    y += 18;
    for (let o = 0; o < 3; o++) {
      engine.writeText('Obstacle:', engine.margin, y + (o * 35), { size: 8, color: theme.lightText });
      engine.drawLine(engine.margin + 55, y + (o * 35) + 8, engine.margin + engine.contentWidth, y + (o * 35) + 8, theme.lineColor);
      engine.writeText('Solution:', engine.margin, y + (o * 35) + 16, { size: 8, color: theme.lightText });
      engine.drawLine(engine.margin + 55, y + (o * 35) + 24, engine.margin + engine.contentWidth, y + (o * 35) + 24, theme.lineColor);
    }
  }
}

export const goalMeta = {
  name: 'Goal Setting Planner',
  description: 'SMART goal framework with action plans, milestones, and obstacle planning',
  defaultPages: 10,
  category: 'productivity'
};
