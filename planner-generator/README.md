# Pro Planner Generator v2.0

A **zero-dependency** professional PDF planner generator tool designed for creating high-quality, printable planners to sell on **Etsy** and **Gumroad**.

> **No `npm install` needed!** This tool uses only Node.js built-in modules with a custom PDF generation engine.

## Quick Start

```bash
cd planner-generator

# Generate a daily planner
node index.js --type daily

# Generate ALL 15 planners at once
node index.js --type all

# See all available options
node index.js --help

# List all planner types, themes, and sizes
node index.js --list
```

## Features

### 15 Professional Planner Types
| Type | Description | Category |
|------|-------------|----------|
| `daily` | Schedule, priorities, to-dos, water tracker, gratitude | Productivity |
| `weekly` | Day blocks, habit tracker, reflection, goals | Productivity |
| `monthly` | Calendar, goals, budget snapshot, projects | Productivity |
| `yearly` | Year overview, quarterly goals, vision, milestones | Productivity |
| `budget` | Income, expenses, savings goals, monthly summary | Finance |
| `fitness` | Workout log, measurements, cardio, progress | Health |
| `meal` | Meal plan, grocery list, nutrition, recipes | Health |
| `habit` | 30-day grid, streaks, habit stacking, reflection | Productivity |
| `goal` | SMART goals, action plans, milestones, obstacles | Productivity |
| `project` | Timeline, deliverables, team, risk register | Business |
| `student` | Class schedule, assignments, study planner, exams | Education |
| `wedding` | Budget, vendors, guest list, day-of timeline | Events |
| `travel` | Itinerary, packing list, trip budget | Lifestyle |
| `business` | Business model canvas, revenue, metrics, actions | Business |
| `selfcare` | Mood tracker, routines, gratitude, affirmations | Wellness |

### 8 Professional Themes
- **Minimalist** - Clean, modern black/white
- **Elegant** - Gold accents, serif fonts
- **Modern** - Purple/pink gradients
- **Nature** - Earthy greens
- **Pastel** - Soft, calming colors
- **Corporate** - Professional blue
- **Boho** - Warm terracotta tones
- **Monochrome** - Pure black & white

### 4 Paper Sizes
- US Letter (8.5 x 11")
- A4
- A5
- Half Letter (5.5 x 8.5")

## Usage

### CLI Options
```
-t, --type <type>       Planner type (see table above, or "all")
-T, --theme <theme>     Design theme (default: minimalist)
-s, --size <size>       Paper size (default: letter)
-p, --pages <number>    Override default page count
-o, --output <dir>      Output directory (default: ./output)
-y, --year <year>       Year for dated planners
--all-themes            Generate in all 8 themes
--all-sizes             Generate in all 4 paper sizes
-l, --list              List all available options
-h, --help              Show help
```

### Examples

```bash
# Single planner with specific theme and size
node index.js --type weekly --theme elegant --size a4

# Generate a planner in ALL 8 themes (perfect for Etsy bundles!)
node index.js --type budget --all-themes

# Generate in ALL paper sizes
node index.js --type daily --all-sizes

# Set a specific year for dated planners
node index.js --type monthly --year 2026

# Custom page count
node index.js --type fitness --pages 52

# Generate everything in one go
node index.js --type all
```

### NPM Scripts (convenience)
```bash
npm run generate:daily
npm run generate:weekly
npm run generate:monthly
npm run generate:yearly
npm run generate:budget
npm run generate:fitness
npm run generate:meal
npm run generate:project
npm run generate:habit
npm run generate:goal
npm run generate:student
npm run generate:wedding
npm run generate:travel
npm run generate:business
npm run generate:selfcare
npm run generate:all
```

## Selling Strategy

### Etsy
- List individual planners at **$3-8** each
- Create theme bundles (all 8 themes) at **$15-25**
- Create category bundles (e.g., "Productivity Pack") at **$12-20**
- "Ultimate Bundle" with all planners + all themes at **$30-50**
- Offer different paper sizes as variations

### Gumroad
- Use tiered pricing: Basic ($5) / Pro ($15) / Ultimate ($35)
- Offer "pay what you want" with minimum
- Include all themes in premium tiers
- Add seasonal updates as upsells

### Bundle Ideas
1. **Productivity Bundle**: Daily + Weekly + Monthly + Yearly + Habit + Goal
2. **Health & Wellness Bundle**: Fitness + Meal + Self-Care
3. **Business Starter Pack**: Business + Project + Budget
4. **Life Events Bundle**: Wedding + Travel + Student
5. **Complete Collection**: All 15 planners in all themes

## Technical Details

### Zero Dependencies
This tool implements a custom **PDF 1.4** writer using only Node.js built-in modules:
- `fs` - File system operations
- `path` - Path handling
- `node:util` - CLI argument parsing

No npm packages required. No `node_modules` folder. Just clone and run.

### Architecture
```
planner-generator/
├── index.js              # CLI entry point
├── src/
│   ├── generator.js      # Main generator orchestrator
│   ├── pdf-engine.js     # Pure PDF 1.4 writer (zero dependencies)
│   ├── themes.js         # 8 professional color themes
│   └── templates/
│       ├── index.js      # Template registry
│       ├── daily.js      # Daily planner layout
│       ├── weekly.js     # Weekly planner layout
│       ├── monthly.js    # Monthly planner layout
│       ├── yearly.js     # Yearly planner layout
│       ├── budget.js     # Budget/finance layout
│       ├── fitness.js    # Fitness tracker layout
│       ├── meal.js       # Meal planner layout
│       ├── project.js    # Project management layout
│       ├── habit.js      # Habit tracker layout
│       ├── goal.js       # Goal setting layout
│       ├── student.js    # Student/academic layout
│       ├── wedding.js    # Wedding planner layout
│       ├── travel.js     # Travel planner layout
│       ├── business.js   # Business planner layout
│       └── selfcare.js   # Self-care/wellness layout
├── output/               # Generated PDFs (gitignored)
├── package.json
└── README.md
```

### Adding New Templates
1. Create a new file in `src/templates/`
2. Export a `generate(engine, options)` function and a `meta` object
3. Register it in `src/templates/index.js`

### Adding New Themes
Add a new theme object in `src/themes.js` following the existing structure.

## Requirements

- Node.js 18+ (uses `node:util` parseArgs)
- No other dependencies needed!

## License

MIT
