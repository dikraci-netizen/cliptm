/**
 * Meal Planner Template
 * Includes: weekly meal plan, grocery list, recipe cards, nutrition tracker
 */

export function generateMeal(engine, options = {}) {
  const { pages = 12 } = options;
  const theme = engine.theme;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (let week = 0; week < pages; week++) {
    if (week > 0) engine.addPage();

    let y = engine.drawHeader('Meal Planner', `Week ${week + 1}`);

    // Meal Plan Grid
    engine.writeSectionHeader('WEEKLY MEAL PLAN', y);
    y += 20;

    const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
    const dayColW = (engine.contentWidth - 80) / 7;
    
    // Column headers (days)
    engine.writeText('', engine.margin, y, { size: 7 });
    days.forEach((day, i) => {
      engine.writeText(day.substring(0, 3), engine.margin + 80 + (i * dayColW), y, {
        size: 7, font: theme.headerFont, color: theme.primary
      });
    });
    y += 14;
    engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.border, 1);
    y += 3;

    // Meal rows
    meals.forEach((meal) => {
      engine.writeText(meal, engine.margin, y + 8, { size: 8, font: theme.headerFont, color: theme.secondary });
      days.forEach((_, i) => {
        engine.drawRect(engine.margin + 80 + (i * dayColW), y, dayColW - 4, 40, {
          stroke: theme.lineColor, radius: 2
        });
      });
      y += 48;
    });

    y += 15;

    // Grocery List
    engine.writeSectionHeader('GROCERY LIST', y);
    y += 20;
    const categories = ['Produce', 'Protein', 'Dairy', 'Grains', 'Pantry', 'Other'];
    const catColW = engine.contentWidth / 3 - 10;

    categories.forEach((cat, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = engine.margin + col * (catColW + 15);
      const catY = y + row * 140;

      engine.writeText(cat, x, catY, { size: 8, font: theme.headerFont, color: theme.primary });
      for (let item = 0; item < 6; item++) {
        engine.drawCheckbox(x, catY + 16 + (item * 18), 8);
        engine.drawLine(x + 14, catY + 16 + (item * 18) + 8, x + catColW - 5, catY + 16 + (item * 18) + 8, theme.lineColor);
      }
    });

    // Page 2: Nutrition & Recipes
    engine.addPage();
    y = engine.drawHeader('Nutrition Tracker', `Week ${week + 1}`);

    // Daily Nutrition Log
    engine.writeSectionHeader('DAILY NUTRITION', y);
    y += 20;
    const nutriHeaders = ['Day', 'Calories', 'Protein', 'Carbs', 'Fat', 'Water'];
    const nutriWidths = [50, 70, 70, 70, 70, 70];

    let xPos = engine.margin;
    nutriHeaders.forEach((h, i) => {
      engine.writeText(h, xPos, y, { size: 8, font: theme.headerFont, color: theme.secondary });
      xPos += nutriWidths[i];
    });
    y += 14;
    engine.drawLine(engine.margin, y, engine.margin + engine.contentWidth, y, theme.border, 1);
    y += 5;

    days.forEach((day) => {
      engine.writeText(day.substring(0, 3), engine.margin + 5, y + 3, { size: 8, color: theme.text });
      xPos = engine.margin + nutriWidths[0];
      for (let c = 1; c < nutriWidths.length; c++) {
        engine.drawLine(xPos, y + 14, xPos + nutriWidths[c] - 10, y + 14, theme.lineColor);
        xPos += nutriWidths[c];
      }
      y += 22;
    });

    y += 25;

    // Recipe Cards
    engine.writeSectionHeader('RECIPE IDEAS', y);
    y += 20;
    for (let r = 0; r < 2; r++) {
      const recipeY = y + (r * 155);
      engine.drawRect(engine.margin, recipeY, engine.contentWidth, 140, { stroke: theme.border, radius: 4 });
      engine.writeText('Recipe Name:', engine.margin + 10, recipeY + 10, { size: 8, color: theme.lightText });
      engine.drawLine(engine.margin + 80, recipeY + 18, engine.margin + 300, recipeY + 18, theme.lineColor);
      engine.writeText('Prep Time:', engine.margin + 10, recipeY + 30, { size: 8, color: theme.lightText });
      engine.drawLine(engine.margin + 70, recipeY + 38, engine.margin + 150, recipeY + 38, theme.lineColor);
      engine.writeText('Cook Time:', engine.margin + 160, recipeY + 30, { size: 8, color: theme.lightText });
      engine.drawLine(engine.margin + 220, recipeY + 38, engine.margin + 300, recipeY + 38, theme.lineColor);
      engine.writeText('Ingredients:', engine.margin + 10, recipeY + 55, { size: 8, font: theme.headerFont, color: theme.secondary });
      engine.writeText('Instructions:', engine.margin + engine.contentWidth * 0.4, recipeY + 55, { size: 8, font: theme.headerFont, color: theme.secondary });
      // Lines for ingredients
      for (let l = 0; l < 4; l++) {
        engine.drawLine(engine.margin + 10, recipeY + 72 + (l * 16), engine.margin + engine.contentWidth * 0.35, recipeY + 72 + (l * 16), theme.lineColor);
      }
      // Lines for instructions
      for (let l = 0; l < 4; l++) {
        engine.drawLine(engine.margin + engine.contentWidth * 0.4, recipeY + 72 + (l * 16), engine.margin + engine.contentWidth - 10, recipeY + 72 + (l * 16), theme.lineColor);
      }
    }
  }
}

export const mealMeta = {
  name: 'Meal Planner',
  description: 'Weekly meal planning with grocery lists, nutrition tracking, and recipe cards',
  defaultPages: 12,
  category: 'health'
};
