#!/usr/bin/env node

import {transpile} from './transpiler.js';
import {writeFileSync} from 'fs';
import {resolve} from 'path';
import {pathToFileURL} from 'url';
import {z} from 'zod';

function showHelp(): void {
  console.log(`
keymap-ts - TypeScript DSL for ZMK Keymaps

Usage: 
  kts <command> [options]

Commands:
  build <input-file> [output-file]   Transpile a keymap file to ZMK devicetree format

Options:
  -h, --help   Show this help message

Examples:
  kts build keymap.ts keymap.keymap
  kts build keymap.ts > my-keyboard.keymap
  kts build keymap.ts

The keymap file should export a default object with the keymap configuration.
`);
}

type ParsedArgs =
  | { command: 'build'; inputFile?: string; outputFile?: string }
  | { command: 'help' }
  | { command: 'error'; message: string };

function parseArgs(args: string[]): ParsedArgs {
  if (args.includes('--help') || args.includes('-h')) {
    return {command: 'help'};
  }

  if (args.length === 0) {
    return {
      command: 'error',
      message: 'No command specified\nRun with --help for usage information'
    };
  }

  const command = args[0]

  if (command === 'build') {
    return {
      command: 'build',
      inputFile: args[1],
      outputFile: args[2]
    };
  }


  return {
    command: 'error',
    message: `Unknown command '${command}'\nRun with --help for usage information`
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

  switch (options.command) {
    case 'help':
      showHelp();
      return;

    case 'error':
      console.error(`Error: ${options.message}`);
      throw new Error('Invalid command');


    case 'build': {
      if (options.inputFile === undefined) {
        console.error('Error: Input file is required for build command');
        throw new Error('Missing input file');
      }

      try {
        const keymap = await loadDefaultExport(options.inputFile);
        const result = transpile(keymap);

        if (!result.success) {
          console.error('Transpilation failed:');
          result.errors.forEach(error => {
            console.error(formatError(error));
          });
          throw new Error('Transpilation failed');
        }

        if (options.outputFile !== undefined) {
          writeFileSync(options.outputFile, result.output, 'utf-8');
          console.log(`Successfully wrote output to ${options.outputFile}`);
        } else {
          console.log(result.output);
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'Transpilation failed') {
          throw error;
        }
        console.error(`Failed to load file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw new Error('Failed to load file');
      }
      break;
    }
  }
}

main().catch(() => {
  // Error already logged, just exit with error code
  process.exit(1);
});