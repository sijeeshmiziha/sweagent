/**
 * nextjs-builder tools
 */

import type { Model } from '../../../lib/types/model';
import { createToolSet } from '../../../lib/tools';
import { validateNextjsTool } from './validate-nextjs';
import { createGenerateNextjsTool } from './generate-nextjs';

export { validateNextjsTool } from './validate-nextjs';
export { createGenerateNextjsTool } from './generate-nextjs';

/**
 * Create all nextjs-builder tools. Pass the model for AI-backed tools.
 */
export function createNextjsBuilderTools(model: Model) {
  return createToolSet({
    validate_nextjs: validateNextjsTool,
    generate_nextjs: createGenerateNextjsTool(model),
  });
}
