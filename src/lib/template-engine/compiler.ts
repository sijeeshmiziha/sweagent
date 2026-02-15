/**
 * Handlebars template compiler - reads .hbs files, compiles with context, writes output
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import Handlebars from 'handlebars';
import type { TemplateContext, ScaffoldConfig, ScaffoldResult, ScaffoldError } from './types';

/** Compile a single Handlebars template string with context */
export function compileTemplate(template: string, context: TemplateContext): string {
  const compiled = Handlebars.compile(template, { noEscape: true });
  return compiled(context);
}

/** Recursively find all .hbs files in a directory */
function findHbsFiles(dir: string, base: string = dir): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findHbsFiles(fullPath, base));
    } else if (entry.name.endsWith('.hbs')) {
      results.push(path.relative(base, fullPath));
    }
  }
  return results;
}

/** Convert a .hbs relative path to the output file path (strip .hbs extension) */
function toOutputPath(hbsRelPath: string): string {
  return hbsRelPath.replace(/\.hbs$/, '');
}

/** Check if a path matches any skip pattern (simple glob: * matches any segment) */
function shouldSkip(relativePath: string, skipPatterns: string[]): boolean {
  for (const pattern of skipPatterns) {
    const regex = new RegExp(
      '^' +
        pattern
          .replace(/\./g, '\\.')
          .replace(/\*\*/g, '<<GLOBSTAR>>')
          .replace(/\*/g, '[^/]*')
          .replace(/<<GLOBSTAR>>/g, '.*') +
        '$'
    );
    if (regex.test(relativePath)) return true;
  }
  return false;
}

/**
 * Scaffold a project: compile all .hbs templates in templateDir with context,
 * write results to outputDir, return summary.
 */
export async function scaffoldProject(config: ScaffoldConfig): Promise<ScaffoldResult> {
  const { templateDir, outputDir, context, skipPatterns = [] } = config;
  const hbsFiles = findHbsFiles(templateDir);
  const files: string[] = [];
  const errors: ScaffoldError[] = [];

  for (const hbsFile of hbsFiles) {
    if (shouldSkip(hbsFile, skipPatterns)) continue;

    const outputRelPath = toOutputPath(hbsFile);
    const inputPath = path.join(templateDir, hbsFile);
    const outputPath = path.join(outputDir, outputRelPath);

    try {
      const templateSource = fs.readFileSync(inputPath, 'utf-8');
      const compiled = compileTemplate(templateSource, context);

      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, compiled, 'utf-8');
      files.push(outputRelPath);
    } catch (err) {
      errors.push({
        file: hbsFile,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { fileCount: files.length, files, errors };
}

/** Register common Handlebars helpers */
export function registerHelpers(): void {
  Handlebars.registerHelper('eq', (a, b) => a === b);
  Handlebars.registerHelper('neq', (a, b) => a !== b);
  Handlebars.registerHelper('json', obj => JSON.stringify(obj, null, 2));
  Handlebars.registerHelper('uppercase', (str: string) =>
    typeof str === 'string' ? str.toUpperCase() : ''
  );
  Handlebars.registerHelper('lowercase', (str: string) =>
    typeof str === 'string' ? str.toLowerCase() : ''
  );
  Handlebars.registerHelper('capitalize', (str: string) =>
    typeof str === 'string' ? str.charAt(0).toUpperCase() + str.slice(1) : ''
  );
  Handlebars.registerHelper('camelCase', (str: string) => {
    if (typeof str !== 'string') return '';
    return str
      .replace(/[-_\s]+(.)?/g, (_, c: string) => (c ? c.toUpperCase() : ''))
      .replace(/^(.)/, c => c.toLowerCase());
  });
  Handlebars.registerHelper('pascalCase', (str: string) => {
    if (typeof str !== 'string') return '';
    return str
      .replace(/[-_\s]+(.)?/g, (_, c: string) => (c ? c.toUpperCase() : ''))
      .replace(/^(.)/, c => c.toUpperCase());
  });
}

// Register helpers on module load
registerHelpers();
