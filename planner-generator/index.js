#!/usr/bin/env node

/**
 * Pro Planner Generator v2.0 - ZERO DEPENDENCY CLI Tool
 * Generate professional printable PDF planners for Etsy & Gumroad
 * Uses only Node.js built-in modules
 */

import { parseArgs } from 'node:util';
import { PlannerGenerator } from './src/generator.js';
import { themes, paperSizes } from './src/themes.js';

// ==================== CLI COLORS (no chalk needed) ====================
const c = {
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  magenta: (s) => `\x1b[35m${s}\x1b[0m`,
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
  white: (s) => `\x1b[37m${s}\x1b[0m`,
};

// ==================== PARSE CLI ARGS ====================
const { values: opts } = parseArgs({
  options: {
    type: { type: 'string', short: 't' },
    theme: { type: 'string', short: 'T', default: 'minimalist' },
    size: { type: 'string', short: 's', default: 'letter' },
    pages: { type: 'string', short: 'p' },
    output: { type: 'string', short: 'o', default: './output' },
    year: { type: 'string', short: 'y' },
    'all-themes': { type: 'boolean', default: false },
    'all-sizes': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
    list: { type: 'boolean', short: 'l', default: false },
  },
  strict: false
});

// ==================== MAIN ====================

console.log(c.bold(c.magenta('\n  +==========================================+')));
console.log(c.bold(c.magenta('  |   PRO PLANNER GENERATOR v2.0             |')));
console.log(c.bold(c.magenta('  |   Zero-Dependency | Etsy & Gumroad Ready |')));
console.log(c.bold(c.magenta('  +==========================================+\n')));

if (opts.help) {
  printHelp();
  process.exit(0);
}

if (opts.list) {
  printAvailable();
  process.exit(0);
}

if (!opts.type) {
  console.log(c.yellow('  No planner type specified. Use --type <type> or --list to see options.\n'));
  printAvailable();
  console.log(c.gray('\n  Example: node index.js --type daily --theme elegant --size a4'));
  console.log(c.gray('  Example: node index.js --type all --all-themes\n'));
  process.exit(0);
}

// Run generation
const config = {
  type: opts.type,
  theme: opts.theme,
  pageSize: opts.size,
  pages: opts.pages ? parseInt(opts.pages) : undefined,
  outputDir: opts.output,
  year: opts.year ? parseInt(opts.year) : new Date().getFullYear()
};

const available = PlannerGenerator.listAvailable();
const validTypes = available.map(t => t.key);

if (config.type === 'all') {
  await generateAll(config);
} else if (!validTypes.includes(config.type)) {
  console.log(c.red(`\n  Error: Unknown type "${config.type}"\n`));
  printAvailable();
  process.exit(1);
} else if (opts['all-themes']) {
  await generateAllThemes(config);
} else if (opts['all-sizes']) {
  await generateAllSizes(config);
} else {
  await generateSingle(config);
}

// ==================== GENERATION FUNCTIONS ====================

async function generateSingle(config) {
  console.log(c.cyan(`  Generating ${config.type} planner...`));

  try {
    const generator = new PlannerGenerator({
      theme: config.theme,
      pageSize: config.pageSize,
      outputDir: config.outputDir
    });

    const result = await generator.generate(config.type, {
      pages: config.pages,
      year: config.year
    });

    console.log(c.green(`  ✓ Generated: ${result.path}`));
    printSummary([result]);
  } catch (error) {
    console.log(c.red(`  ✗ Error: ${error.message}`));
    process.exit(1);
  }
}

async function generateAll(config) {
  console.log(c.cyan('  Generating ALL planners...\n'));

  try {
    const generator = new PlannerGenerator({
      theme: config.theme,
      pageSize: config.pageSize,
      outputDir: config.outputDir
    });

    const results = await generator.generateAll({
      year: config.year,
      pages: config.pages
    });

    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);

    console.log(c.green(`\n  ✓ Generated ${successful.length} planners!`));
    if (failed.length > 0) {
      console.log(c.yellow(`  ⚠ ${failed.length} failed:`));
      failed.forEach(f => console.log(c.red(`    - ${f.type}: ${f.error}`)));
    }
    printSummary(successful);
  } catch (error) {
    console.log(c.red(`  ✗ Error: ${error.message}`));
    process.exit(1);
  }
}

async function generateAllThemes(config) {
  console.log(c.cyan('  Generating in all themes...\n'));
  const results = [];

  for (const [themeName] of Object.entries(themes)) {
    const generator = new PlannerGenerator({
      theme: themeName,
      pageSize: config.pageSize,
      outputDir: config.outputDir
    });

    try {
      const result = await generator.generate(config.type, {
        pages: config.pages,
        year: config.year,
        filename: `${config.type}-planner-${themeName}-${config.pageSize}.pdf`
      });
      results.push(result);
      console.log(c.green(`  ✓ ${themeName}`));
    } catch (error) {
      console.log(c.red(`  ✗ ${themeName}: ${error.message}`));
    }
  }

  printSummary(results);
}

async function generateAllSizes(config) {
  console.log(c.cyan('  Generating in all paper sizes...\n'));
  const results = [];

  for (const [sizeName] of Object.entries(paperSizes)) {
    const generator = new PlannerGenerator({
      theme: config.theme,
      pageSize: sizeName,
      outputDir: config.outputDir
    });

    try {
      const result = await generator.generate(config.type, {
        pages: config.pages,
        year: config.year,
        filename: `${config.type}-planner-${config.theme}-${sizeName}.pdf`
      });
      results.push(result);
      console.log(c.green(`  ✓ ${sizeName}`));
    } catch (error) {
      console.log(c.red(`  ✗ ${sizeName}: ${error.message}`));
    }
  }

  printSummary(results);
}

// ==================== OUTPUT HELPERS ====================

function printSummary(results) {
  console.log(c.bold('\n  ────────────────────────────────────────────'));
  console.log(c.bold('  GENERATED FILES:\n'));
  results.forEach(r => {
    console.log(c.cyan(`    ${r.path}`));
    console.log(c.gray(`       Theme: ${r.theme} | Size: ${r.pageSize} | Pages: ${r.pages}`));
  });
  console.log(c.bold('\n  ────────────────────────────────────────────'));
  console.log(c.green(c.bold('\n  ✓ Ready to upload to Etsy & Gumroad!\n')));
  console.log(c.yellow('  Tips for selling:'));
  console.log(c.gray('     • Use --all-themes to create theme bundles'));
  console.log(c.gray('     • Use --all-sizes for multi-size packs'));
  console.log(c.gray('     • Combine types for "Ultimate Planner Bundle"'));
  console.log(c.gray('     • Price individual planners $3-8, bundles $15-30\n'));
}

function printAvailable() {
  const available = PlannerGenerator.listAvailable();
  console.log(c.bold('  Available Planner Types:\n'));
  
  const categories = {};
  available.forEach(t => {
    if (!categories[t.category]) categories[t.category] = [];
    categories[t.category].push(t);
  });

  for (const [cat, items] of Object.entries(categories)) {
    console.log(c.bold(`  [${cat.toUpperCase()}]`));
    items.forEach(t => {
      console.log(`    ${c.cyan(t.key.padEnd(12))} ${c.gray(t.description)}`);
    });
    console.log('');
  }

  console.log(c.bold('  Available Themes:'));
  console.log(`    ${c.cyan(Object.keys(themes).join(', '))}\n`);
  console.log(c.bold('  Available Paper Sizes:'));
  console.log(`    ${c.cyan(Object.keys(paperSizes).join(', '))}\n`);
}

function printHelp() {
  console.log(c.bold('  USAGE:'));
  console.log(c.gray('    node index.js [options]\n'));
  console.log(c.bold('  OPTIONS:'));
  console.log(`    ${c.cyan('-t, --type <type>')}     Planner type (or "all")`);
  console.log(`    ${c.cyan('-T, --theme <theme>')}   Design theme (default: minimalist)`);
  console.log(`    ${c.cyan('-s, --size <size>')}     Paper size (default: letter)`);
  console.log(`    ${c.cyan('-p, --pages <n>')}       Override default page count`);
  console.log(`    ${c.cyan('-o, --output <dir>')}    Output directory (default: ./output)`);
  console.log(`    ${c.cyan('-y, --year <year>')}     Year for dated planners`);
  console.log(`    ${c.cyan('--all-themes')}          Generate in all themes`);
  console.log(`    ${c.cyan('--all-sizes')}           Generate in all paper sizes`);
  console.log(`    ${c.cyan('-l, --list')}            List available types/themes/sizes`);
  console.log(`    ${c.cyan('-h, --help')}            Show this help\n`);
  console.log(c.bold('  EXAMPLES:'));
  console.log(c.gray('    node index.js --type daily'));
  console.log(c.gray('    node index.js --type weekly --theme elegant --size a4'));
  console.log(c.gray('    node index.js --type all --all-themes'));
  console.log(c.gray('    node index.js --type budget --all-sizes --year 2026\n'));
}
