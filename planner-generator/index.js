#!/usr/bin/env node

/**
 * Pro Planner Generator - CLI Tool
 * Generate professional printable PDF planners for Etsy & Gumroad
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { PlannerGenerator } from './src/generator.js';
import { themes, paperSizes } from './src/themes.js';

const program = new Command();

program
  .name('planner-generator')
  .description('Professional Planner Generator - Create beautiful PDF planners for Etsy & Gumroad')
  .version('1.0.0');

program
  .option('-t, --type <type>', 'Planner type (daily, weekly, monthly, yearly, budget, fitness, meal, project, habit, goal, student, wedding, travel, business, selfcare, all)')
  .option('-T, --theme <theme>', 'Theme (minimalist, elegant, modern, nature, pastel, corporate, boho, monochrome)', 'minimalist')
  .option('-s, --size <size>', 'Paper size (letter, a4, a5, half_letter)', 'letter')
  .option('-p, --pages <number>', 'Number of pages', parseInt)
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('-y, --year <year>', 'Year for dated planners', parseInt)
  .option('-i, --interactive', 'Launch interactive mode')
  .option('--all-themes', 'Generate in all available themes')
  .option('--all-sizes', 'Generate in all available paper sizes')
  .action(async (opts) => {
    console.log(chalk.bold.magenta('\n  ╔══════════════════════════════════════════╗'));
    console.log(chalk.bold.magenta('  ║   🎯 PRO PLANNER GENERATOR v1.0        ║'));
    console.log(chalk.bold.magenta('  ║   Create & Sell on Etsy & Gumroad       ║'));
    console.log(chalk.bold.magenta('  ╚══════════════════════════════════════════╝\n'));

    let config = {
      type: opts.type,
      theme: opts.theme,
      pageSize: opts.size,
      pages: opts.pages,
      outputDir: opts.output,
      year: opts.year || new Date().getFullYear()
    };

    // Interactive Mode
    if (opts.interactive || !opts.type) {
      config = await interactiveMode(config);
    }

    // Validate type
    const available = PlannerGenerator.listAvailable();
    const validTypes = available.map(t => t.key);

    if (config.type === 'all') {
      await generateAll(config);
    } else if (!validTypes.includes(config.type)) {
      console.log(chalk.red(`\n  ✗ Unknown type: ${config.type}`));
      console.log(chalk.yellow(`\n  Available types:`));
      available.forEach(t => {
        console.log(chalk.cyan(`    • ${t.key.padEnd(12)} - ${t.description}`));
      });
      process.exit(1);
    } else if (opts.allThemes) {
      await generateAllThemes(config);
    } else if (opts.allSizes) {
      await generateAllSizes(config);
    } else {
      await generateSingle(config);
    }
  });

async function interactiveMode(defaults) {
  const available = PlannerGenerator.listAvailable();

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Select planner type:',
      choices: [
        { name: '📋 All Planners (complete bundle)', value: 'all' },
        new inquirer.Separator('─── Productivity ───'),
        ...available.filter(t => t.category === 'productivity').map(t => ({
          name: `${t.name} - ${t.description}`,
          value: t.key
        })),
        new inquirer.Separator('─── Health & Wellness ───'),
        ...available.filter(t => ['health', 'wellness'].includes(t.category)).map(t => ({
          name: `${t.name} - ${t.description}`,
          value: t.key
        })),
        new inquirer.Separator('─── Finance ───'),
        ...available.filter(t => t.category === 'finance').map(t => ({
          name: `${t.name} - ${t.description}`,
          value: t.key
        })),
        new inquirer.Separator('─── Business ───'),
        ...available.filter(t => t.category === 'business').map(t => ({
          name: `${t.name} - ${t.description}`,
          value: t.key
        })),
        new inquirer.Separator('─── Lifestyle ───'),
        ...available.filter(t => ['lifestyle', 'event', 'education'].includes(t.category)).map(t => ({
          name: `${t.name} - ${t.description}`,
          value: t.key
        }))
      ],
      default: defaults.type
    },
    {
      type: 'list',
      name: 'theme',
      message: 'Select design theme:',
      choices: Object.entries(themes).map(([key, t]) => ({
        name: `${t.name} (Primary: ${t.primary})`,
        value: key
      })),
      default: defaults.theme
    },
    {
      type: 'list',
      name: 'pageSize',
      message: 'Select paper size:',
      choices: Object.entries(paperSizes).map(([key, s]) => ({
        name: s.name,
        value: key
      })),
      default: defaults.pageSize
    },
    {
      type: 'input',
      name: 'year',
      message: 'Year for dated planners:',
      default: String(defaults.year || new Date().getFullYear()),
      filter: val => parseInt(val)
    },
    {
      type: 'confirm',
      name: 'allThemes',
      message: 'Generate in ALL themes? (great for Etsy bundles)',
      default: false
    }
  ]);

  return { ...defaults, ...answers };
}

async function generateSingle(config) {
  const spinner = ora(`Generating ${config.type} planner...`).start();

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

    spinner.succeed(chalk.green(`Generated: ${result.path}`));
    printSummary([result]);
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

async function generateAll(config) {
  const spinner = ora('Generating ALL planners...').start();

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

    spinner.succeed(chalk.green(`Generated ${successful.length} planners!`));
    if (failed.length > 0) {
      console.log(chalk.yellow(`  ⚠ ${failed.length} failed:`));
      failed.forEach(f => console.log(chalk.red(`    - ${f.type}: ${f.error}`)));
    }
    printSummary(successful);
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

async function generateAllThemes(config) {
  const spinner = ora('Generating in all themes...').start();
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
    } catch (error) {
      results.push({ type: config.type, theme: themeName, error: error.message });
    }
  }

  const successful = results.filter(r => !r.error);
  spinner.succeed(chalk.green(`Generated ${successful.length} theme variations!`));
  printSummary(successful);
}

async function generateAllSizes(config) {
  const spinner = ora('Generating in all paper sizes...').start();
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
    } catch (error) {
      results.push({ type: config.type, size: sizeName, error: error.message });
    }
  }

  const successful = results.filter(r => !r.error);
  spinner.succeed(chalk.green(`Generated ${successful.length} size variations!`));
  printSummary(successful);
}

function printSummary(results) {
  console.log(chalk.bold('\n  ────────────────────────────────────────'));
  console.log(chalk.bold('  📁 GENERATED FILES:\n'));
  results.forEach(r => {
    console.log(chalk.cyan(`    📄 ${r.path}`));
    console.log(chalk.gray(`       Theme: ${r.theme} | Size: ${r.pageSize} | Pages: ${r.pages}`));
  });
  console.log(chalk.bold('\n  ────────────────────────────────────────'));
  console.log(chalk.green.bold('\n  ✓ Ready to upload to Etsy & Gumroad!\n'));
  console.log(chalk.yellow('  💡 Tips for selling:'));
  console.log(chalk.gray('     • Use --all-themes to create theme bundles'));
  console.log(chalk.gray('     • Use --all-sizes for multi-size packs'));
  console.log(chalk.gray('     • Combine types for "Ultimate Planner Bundle"'));
  console.log(chalk.gray('     • Price individual planners $3-8, bundles $15-30\n'));
}

program.parse();
