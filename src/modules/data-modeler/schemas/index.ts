/**
 * data-modeler schemas (generic + MongoDB)
 */

export {
  entityFieldSchema,
  entityIndexSchema,
  entityRelationSchema,
  dataEntitySchema,
  dataModelDesignSchema,
  type TDataModelDesign,
} from './data-model.schema';

/* MongoDB-specific schemas (merged from db-designer) */
export { mongoFieldSchema, type TMongoFieldSchema } from './mongodb-field.schema';
export { mongoModuleSchema, type TMongoModuleSchema } from './mongodb-module.schema';
export { mongoProjectSchema, type TMongoProjectSchema } from './mongodb-project.schema';
