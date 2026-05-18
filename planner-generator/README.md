# Pro Planner Generator

A professional PDF planner generator tool designed for creating high-quality, printable planners to sell on **Etsy** and **Gumroad**.

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

## Installation

```bash
cd planner-generator
npm install
```

## Usage

### Quick Generate
```bash
# Generate a specific planner
node index.js --type daily --theme minimalist --size letter

# Generate all planners at once
node index.js --type all

# Generate in all themes (great for bundles!)
node index.js --type weekly --all-themes

# Generate in all paper sizes
node index.js --type budget --all-sizes

# Interactive mode (guided setup)
node index.js --interactive
```

### CLI Options
```
-t, --type <type>       Planner type (see table above, or "all")
-T, --theme <theme>     Design theme (default: minimalist)
-s, --size <size>       Paper size (default: letter)
-p, --pages <number>    Override default page count
-o, --output <dir>      Output directory (default: ./output)
-y, --year <year>       Year for dated planners
-i, --interactive       Launch interactive selection mode
--all-themes            Generate in all 8 themes
--all-sizes             Generate in all 4 paper sizes
```

### NPM Scripts
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

## Output

Generated PDFs are saved in the `./output` directory with filenames like:
```
daily-planner-minimalist-1703001234567.pdf
weekly-planner-elegant-letter.pdf
```

## Customization

### Adding New Templates
1. Create a new file in `src/templates/`
2. Export a `generate` function and `meta` object
3. Register it in `src/templates/index.js`

### Adding New Themes
Add a new theme object in `src/themes.js` following the existing structure.

## License

MIT
