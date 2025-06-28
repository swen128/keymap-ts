# Development Guidelines

## Core Principle: Parse, Don't Validate

Based on [Parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/), our codebase follows these principles:

### What This Means

Instead of checking if data is valid and passing it along unchanged, we transform data into more precise types that make invalid states unrepresentable.

**Bad (Validation)**:
```typescript
function isComplexBinding(binding: Binding): boolean {
  // Just checks, doesn't transform
  return binding.behavior === 'bluetooth' || ...;
}

function process(binding: Binding) {
  if (isComplexBinding(binding)) {
    // binding is still just Binding type
    // TypeScript doesn't know it's complex
  }
}
```

**Good (Parsing)**:
```typescript
function parseBinding(binding: Binding): SimpleBinding | ComplexBinding {
  // Transforms into more precise types
  switch (binding.behavior) {
    case 'keyPress':
      return { type: 'simple', behavior: 'keyPress', ... };
    case 'bluetooth':
      return { type: 'complex', behavior: 'bluetooth', ... };
  }
}

function process(binding: SimpleBinding | ComplexBinding) {
  // Type system knows exactly what we have
  if (binding.type === 'complex') {
    // TypeScript knows this is ComplexBinding
  }
}
```

### Why This Matters

1. **Type Safety**: The type system enforces correctness, not runtime checks
2. **No Repeated Validation**: Parse once at the boundary, then trust the types
3. **Better Error Messages**: Errors happen at parse time with full context
4. **Cleaner Code**: No defensive programming or redundant checks

### In Our Codebase

- The `checker` transforms DSL types into Checked types
- During this transformation, we handle all conversions (like wrapping complex bindings in macros)
- After checking, we never need to validate again - the types guarantee correctness
- We avoid predicates like `isComplexBinding` in favor of discriminated unions

### Examples

**Instead of validation predicates**:
```typescript
// Bad
function isSimpleBinding(binding: Binding): boolean { ... }

// Good
type ParsedBinding = 
  | { kind: 'simple'; binding: SimpleBinding }
  | { kind: 'complex'; binding: ComplexBinding };
```

**Instead of runtime checks**:
```typescript
// Bad
if (binding.behavior === 'holdTap') {
  // Still need to check nested bindings
}

// Good - CheckedBinding type guarantees nested bindings are SimpleBinding
type CheckedHoldTap = {
  behavior: 'holdTap';
  holdBinding: SimpleBinding; // Type system enforces this
  tapBinding: SimpleBinding;
}
```