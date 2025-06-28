#!/usr/bin/env node

import { transpile } from './transpiler';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import { z } from 'zod';

function showHelp(): void {
  console.log(`
ZMK Keymap Transpiler

Usage: keymap-transpiler <input-file> [output-file]

Arguments:
  input-file   Path to the keymap configuration module (JS/TS)
  output-file  Path to write the devicetree output (optional)
               If not specified, outputs to stdout

Options:
  -h, --help   Show this help message

Example:
  keymap-transpiler keymap.js keymap.dtsi
  keymap-transpiler keymap.ts > keymap.dtsi

The keymap file should export a default object with the keymap configuration.
`);
}

function parseArgs(args: string[]): { inputFile?: string; outputFile?: string; help: boolean } {
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    return { help: true };
  }
  
  return {
    inputFile: args[0],
    outputFile: args[1],
    help: false
  };
}

// Schema for ES module with default export
const ModuleSchema = z.object({
  default: z.unknown()
});

async function loadDefaultExport(filePath: string): Promise<unknown> {
  const absolutePath = resolve(filePath);
  const fileUrl = pathToFileURL(absolutePath).href;
  
  // Dynamic import
  const module: unknown = await import(fileUrl);
  
  // Try to parse as ES module with default export
  const moduleResult = ModuleSchema.safeParse(module);
  if (moduleResult.success) {
    return moduleResult.data.default;
  }
  
  // Otherwise return the module itself (could be CommonJS or direct export)
  return module;
}

function formatError(error: { path?: string[]; message: string }): string {
  const path = error.path ? error.path.join('.') : '';
  return `  ${path ? `[${path}] ` : ''}${error.message}`;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  
  if (options.inputFile === undefined) {
    console.error('Error: Input file is required');
    process.exit(1);
  }
  
  try {
    const keymap = await loadDefaultExport(options.inputFile);
    const result = transpile(keymap);
    
    if (!result.success) {
      console.error('Transpilation failed:');
      result.errors.forEach(error => {
        console.error(formatError(error));
      });
      process.exit(1);
    }
    
    if (options.outputFile !== undefined) {
      writeFileSync(options.outputFile, result.output, 'utf-8');
      console.log(`Successfully wrote output to ${options.outputFile}`);
    } else {
      console.log(result.output);
    }
  } catch (error) {
    console.error(`Failed to load file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});