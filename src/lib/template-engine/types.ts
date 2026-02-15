/**
 * Template engine types for Handlebars-based project scaffolding
 */

/** Context data passed to Handlebars templates during compilation */
export interface TemplateContext {
  /** Application name */
  appName: string;
  /** Application description */
  description?: string;
  /** API endpoint URL */
  apiEndpoint?: string;
  /** Module definitions for iterating in templates */
  modules?: TemplateModule[];
  /** Auth configuration */
  auth?: TemplateAuth;
  /** Branding configuration */
  branding?: TemplateBranding;
  /** Arbitrary additional data for templates */
  [key: string]: unknown;
}

export interface TemplateModule {
  name: string;
  /** PascalCase name for class/component names */
  pascalName: string;
  /** camelCase name for variable names */
  camelName: string;
  fields?: TemplateField[];
  operations?: TemplateOperation[];
  /** Arbitrary additional data for templates */
  [key: string]: unknown;
}

export interface TemplateField {
  name: string;
  type: string;
  required: boolean;
  graphqlType?: string;
  /** Arbitrary additional data */
  [key: string]: unknown;
}

export interface TemplateOperation {
  name: string;
  type: string;
  queryString?: string;
  hookName?: string;
  /** Arbitrary additional data */
  [key: string]: unknown;
}

export interface TemplateAuth {
  strategy: string;
  providers?: string[];
  hasRoles: boolean;
  roles?: string[];
}

export interface TemplateBranding {
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
}

/** Configuration for scaffold_project tool */
export interface ScaffoldConfig {
  /** Absolute path to the template directory (e.g. .ref/templates/vite) */
  templateDir: string;
  /** Absolute path to the output directory */
  outputDir: string;
  /** Context data to compile templates with */
  context: TemplateContext;
  /** File patterns to skip (glob-style) */
  skipPatterns?: string[];
}

/** Result from scaffolding a project */
export interface ScaffoldResult {
  /** Total files generated */
  fileCount: number;
  /** List of generated file paths (relative to outputDir) */
  files: string[];
  /** Any files that failed to compile */
  errors: ScaffoldError[];
}

export interface ScaffoldError {
  file: string;
  message: string;
}
