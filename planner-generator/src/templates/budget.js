/**
 * Budget Planner Template
 * Includes: income tracking, expense categories, savings goals, debt tracker
 */

export function generateBudget(engine, options = {}) {
  const { pages = 12 } = options;
  const theme = engine.theme;
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  for (let month = 0; month < pages; month++) {
    if (month > 0) engine.addPage();

    const monthName = months[month % 12];
    let y = engine.drawHeader('Budget Planner', monthName);

    // Income Section
    engine.writeSectionHeader('INCOME', y);
    y += 18;
    const incomeHeaders = ['Source', 'Expected', 'Actual', 'Difference'];
    const incColWidths = [engine.contentWidth * 0.4, engine.contentWidth * 0.2, engine.contentWidth * 0.2, engine.contentWidth * 0.2];
    let xPos = engine.margin;
    
    incomeHeaders.forEach((h, i) => {
      engine.writeText(h, xPos, y, { size: 8, font: theme.headerFont, color: theme.secondary });
      xPos += incColWidths[i];
    });
    y += 14;
    engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.border, 1);
    y += 5;

    for (let i = 0; i < 4; i++) {
      xPos = engine.margin;
      incColWidths.forEach((w) => {
        engine.drawLine(xPos, y + 14, xPos + w - 10, y + 14, theme.lineColor);
        xPos += w;
      });
      y += 20;
    }
    
    // Total row
    engine.writeText('TOTAL:', engine.margin, y + 5, { size: 9, font: theme.headerFont, color: theme.primary });
    engine.drawLine(engine.margin + engine.contentWidth * 0.4, y + 14, engine.margin + engine.contentWidth, y + 14, theme.border, 1);
    y += 30;

    // Fixed Expenses
    engine.writeSectionHeader('FIXED EXPENSES', y);
    y += 18;
    const fixedExpenses = ['Rent/Mortgage', 'Utilities', 'Insurance', 'Subscriptions', 'Phone/Internet', 'Loan Payments', 'Other'];
    fixedExpenses.forEach((exp) => {
      engine.writeText(exp, engine.margin, y, { size: 8, color: theme.text });
      engine.drawLine(engine.margin + 130, y + 8, engine.margin + 220, y + 8, theme.lineColor);
      engine.writeText('$', engine.margin + 125, y, { size: 8, color: theme.lightText });
      y += 18;
    });
    engine.writeText('Total Fixed:', engine.margin, y, { size: 9, font: theme.headerFont, color: theme.primary });
    engine.drawLine(engine.margin + 130, y + 8, engine.margin + 220, y + 8, theme.border);
    y += 30;

    // Variable Expenses
    engine.writeSectionHeader('VARIABLE EXPENSES', y);
    y += 18;
    const varExpenses = ['Groceries', 'Dining Out', 'Transportation', 'Entertainment', 'Shopping', 'Health/Beauty', 'Gifts', 'Miscellaneous'];
    
    const halfLen = Math.ceil(varExpenses.length / 2);
    const rightColX = engine.margin + engine.contentWidth * 0.5;
    
    varExpenses.forEach((exp, i) => {
      const col = i < halfLen ? 0 : 1;
      const row = i < halfLen ? i : i - halfLen;
      const x = col === 0 ? engine.margin : rightColX;
      const expY = y + (row * 18);
      
      engine.writeText(exp, x, expY, { size: 8, color: theme.text });
      engine.writeText('$', x + 110, expY, { size: 8, color: theme.lightText });
      engine.drawLine(x + 115, expY + 8, x + 200, expY + 8, theme.lineColor);
    });

    // Page 2: Savings & Summary
    engine.addPage();
    y = engine.drawHeader('Monthly Summary', monthName);

    // Savings Goals
    engine.writeSectionHeader('SAVINGS GOALS', y);
    y += 20;
    for (let i = 0; i < 3; i++) {
      const goalY = y + (i * 60);
      engine.writeText(`Goal ${i + 1}:`, engine.margin, goalY, { size: 8, color: theme.lightText });
      engine.drawLine(engine.margin + 45, goalY + 8, engine.margin + 200, goalY + 8, theme.lineColor);
      engine.writeText('Target:', engine.margin, goalY + 20, { size: 8, color: theme.lightText });
      engine.drawLine(engine.margin + 45, goalY + 28, engine.margin + 120, goalY + 28, theme.lineColor);
      engine.writeText('Saved:', engine.margin + 130, goalY + 20, { size: 8, color: theme.lightText });
      engine.drawLine(engine.margin + 170, goalY + 28, engine.margin + 250, goalY + 28, theme.lineColor);
      // Progress bar
      engine.drawProgressBar(engine.margin, goalY + 40, 250);
    }

    y += 200;

    // Monthly Summary Box
    engine.writeSectionHeader('MONTHLY SUMMARY', y);
    y += 20;
    engine.drawRect(engine.margin, y, engine.contentWidth, 160, { stroke: theme.border, radius: 4 });
    
    const summaryItems = [
      'Total Income:', 'Total Fixed Expenses:', 'Total Variable Expenses:',
      'Total Savings:', 'Net Balance:'
    ];
    summaryItems.forEach((item, i) => {
      const itemY = y + 15 + (i * 28);
      engine.writeText(item, engine.margin + 15, itemY, { size: 10, color: theme.text });
      engine.writeText('$', engine.margin + 200, itemY, { size: 10, color: theme.lightText });
      engine.drawLine(engine.margin + 210, itemY + 12, engine.margin + engine.contentWidth - 20, itemY + 12, theme.lineColor);
    });

    y += 180;

    // Notes
    engine.writeSectionHeader('FINANCIAL NOTES', y);
    y += 18;
    engine.drawLinedArea(engine.margin, y, engine.contentWidth, 6, 20);
  }
}

export const budgetMeta = {
  name: 'Budget Planner',
  description: 'Complete financial planning with income tracking, expenses, savings goals, and monthly summaries',
  defaultPages: 12,
  category: 'finance'
};
