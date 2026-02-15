/**
 * Module registry -- imports all example modules and exports them as an ordered array.
 * Used by the interactive launcher (run.ts) and available for programmatic use.
 */

import type { ExampleModule } from './types.js';

import core from '../core/index.js';
import helloWorld from '../hello-world/index.js';
import planning from '../planning/index.js';
import requirementGatherer from '../requirement-gatherer/index.js';
import dataModeler from '../data-modeler/index.js';
import dbDesigner from '../db-designer/index.js';
import apiDesigner from '../api-designer/index.js';
import authDesigner from '../auth-designer/index.js';
import backendArchitect from '../backend-architect/index.js';
import expressBuilder from '../express-builder/index.js';
import apolloBuilder from '../apollo-builder/index.js';
import frontendArchitect from '../frontend-architect/index.js';
import reactBuilder from '../react-builder/index.js';
import nextjsBuilder from '../nextjs-builder/index.js';
import executionPlanner from '../execution-planner/index.js';

/** All example modules in recommended order. */
export const modules: ExampleModule[] = [
  core,
  helloWorld,
  planning,
  requirementGatherer,
  dataModeler,
  dbDesigner,
  apiDesigner,
  authDesigner,
  backendArchitect,
  expressBuilder,
  apolloBuilder,
  frontendArchitect,
  reactBuilder,
  nextjsBuilder,
  executionPlanner,
];
