/**
 * Main Planner Generator
 * Assembles planners by combining templates, themes, and PDF engine
 */

import { PDFEngine } from './pdf-engine.js';
import { getTheme, getPageSize } from './themes.js';
import { getTemplate, listTemplates, templates } from './templates/index.js';

export class PlannerGenerator {
  constructor(options = {}) {
    this.theme = getTheme(options.theme || 'minimalist');
    this.pageSize = getPageSize(options.pageSize || 'letter');
    this.outputDir = options.outputDir || './output';
  }

  async generate(type, options = {}) {
    const template = getTemplate(type);
    if (!template) {
      throw new Error(`Unknown template type: ${type}. Available: ${Object.keys(templates).join(', ')}`);
    }

    const engine = new PDFEngine({
      theme: this.theme,
      pageSize: this.pageSize,
      margin: options.margin || 40
    });

    const filename = options.filename || `${type}-planner-${this.theme.name.toLowerCase()}-${Date.now()}.pdf`;
    const outputPath = `${this.outputDir}/${filename}`;

    const streamPromise = engine.createDocument(outputPath);

    // Draw cover page
    engine.drawCoverPage(
      template.meta.name,
      template.meta.description,
      options.year ? String(options.year) : ''
    );

    // Add content pages
    engine.addPage();
    template.generate(engine, {
      pages: options.pages || template.meta.defaultPages,
      year: options.year || new Date().getFullYear(),
      ...options
    });

    // Finalize
    engine.finalize();
    await streamPromise;

    return {
      path: outputPath,
      type,
      theme: this.theme.name,
      pageSize: this.pageSize.name,
      pages: options.pages || template.meta.defaultPages
    };
  }

  async generateAll(options = {}) {
    const results = [];
    const templateList = listTemplates();

    for (const tmpl of templateList) {
      try {
        const result = await this.generate(tmpl.key, options);
        results.push(result);
      } catch (error) {
        results.push({ type: tmpl.key, error: error.message });
      }
    }

    return results;
  }

  async generateBundle(types, options = {}) {
    const results = [];

    for (const type of types) {
      try {
        const result = await this.generate(type, options);
        results.push(result);
      } catch (error) {
        results.push({ type, error: error.message });
      }
    }

    return results;
  }

  static listAvailable() {
    return listTemplates();
  }
}
