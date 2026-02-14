/**
 * Builder pattern: step-by-step construction of complex objects.
 */

export interface Builder<TProduct> {
  /** Build and return the product. May reset builder state. */
  build(): TProduct;
}

/** Fluent builder returns this for chaining */
export interface FluentBuilder<TProduct> extends Builder<TProduct> {
  reset(): this;
}
