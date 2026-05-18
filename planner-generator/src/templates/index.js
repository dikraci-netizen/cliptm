/**
 * Template Registry
 * Central index for all available planner templates
 */

import { generateDaily, dailyMeta } from './daily.js';
import { generateWeekly, weeklyMeta } from './weekly.js';
import { generateMonthly, monthlyMeta } from './monthly.js';
import { generateYearly, yearlyMeta } from './yearly.js';
import { generateBudget, budgetMeta } from './budget.js';
import { generateFitness, fitnessMeta } from './fitness.js';
import { generateMeal, mealMeta } from './meal.js';
import { generateProject, projectMeta } from './project.js';
import { generateHabit, habitMeta } from './habit.js';
import { generateGoal, goalMeta } from './goal.js';
import { generateStudent, studentMeta } from './student.js';
import { generateWedding, weddingMeta } from './wedding.js';
import { generateTravel, travelMeta } from './travel.js';
import { generateBusiness, businessMeta } from './business.js';
import { generateSelfcare, selfcareMeta } from './selfcare.js';

export const templates = {
  daily: { generate: generateDaily, meta: dailyMeta },
  weekly: { generate: generateWeekly, meta: weeklyMeta },
  monthly: { generate: generateMonthly, meta: monthlyMeta },
  yearly: { generate: generateYearly, meta: yearlyMeta },
  budget: { generate: generateBudget, meta: budgetMeta },
  fitness: { generate: generateFitness, meta: fitnessMeta },
  meal: { generate: generateMeal, meta: mealMeta },
  project: { generate: generateProject, meta: projectMeta },
  habit: { generate: generateHabit, meta: habitMeta },
  goal: { generate: generateGoal, meta: goalMeta },
  student: { generate: generateStudent, meta: studentMeta },
  wedding: { generate: generateWedding, meta: weddingMeta },
  travel: { generate: generateTravel, meta: travelMeta },
  business: { generate: generateBusiness, meta: businessMeta },
  selfcare: { generate: generateSelfcare, meta: selfcareMeta }
};

export function getTemplate(name) {
  return templates[name] || null;
}

export function listTemplates() {
  return Object.entries(templates).map(([key, { meta }]) => ({
    key,
    ...meta
  }));
}
