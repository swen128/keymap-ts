#!/usr/bin/env node

import {Result, ok, err, ResultAsync} from 'neverthrow';
import {transpile} from './transpiler.js';
import {writeFileSync} from 'fs';
import {resolve} from 'path';
import {pathToFileURL} from 'url';
import {z} from 'zod/v4';
import {safeParse} from './utils/safeParse.js';

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

type BuildCommand = { command: 'build'; inputFile: string; outputFile?: string };
type HelpCommand = { command: 'help' };
type ParsedArgs = BuildCommand | HelpCommand;

function parseArgs(args: string[]): Result<ParsedArgs, string> {
  if (args.includes('--help') || args.includes('-h')) {
    return ok({command: 'help'});
  }

  if (args.length === 0) {
    return err('No command specified\nRun with --help for usage information');
  }

  const command = args[0];

  if (command === 'build') {
    const inputFile = args[1];
    if (inputFile === undefined) {
      return err('Input file is required for build command');
    }
    return ok({
      command: 'build',
      inputFile,
      outputFile: args[2]
    });
  }

  return err(`Unknown command '${command}'\nRun with --help for usage information`);
}

const ModuleSchema = z.object({
  default: z.unknown()
});

function loadDefaultExport(filePath: string): ResultAsync<unknown, string> {
  const absolutePath = resolve(filePath);
  const fileUrl = pathToFileURL(absolutePath).href;

  return ResultAsync.fromPromise(
    import(fileUrl),
    (error) => `Failed to load file: ${error instanceof Error ? error.message : 'Unknown error'}`
  ).map((module: unknown) => {
    // Try to parse as ES module with default export
    const moduleResult = safeParse(ModuleSchema)(module);
    if (moduleResult.isOk()) {
      return moduleResult.value.default;
    }
    // Otherwise return the module itself (could be CommonJS or direct export)
    return module;
  });
}

function formatError(error: { path?: string[]; message: string }): string {
  const path = error.path ? error.path.join('.') : '';
  return `  ${path ? `[${path}] ` : ''}${error.message}`;
}

function writeOutput(content: string, outputFile?: string): Result<void, string> {
  if (outputFile !== undefined) {
    try {
      writeFileSync(outputFile, content, 'utf-8');
      console.log(`Successfully wrote output to ${outputFile}`);
      return ok(undefined);
    } catch (error) {
      return err(`Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else {
    console.log(content);
    return ok(undefined);
  }
}

async function executeBuild(command: BuildCommand): Promise<Result<void, string>> {
  const loadResult = await loadDefaultExport(command.inputFile);
  
  if (loadResult.isErr()) {
    return err(loadResult.error);
  }
  
  const transpileResult = transpile(loadResult.value);
  
  if (transpileResult.isErr()) {
    console.error('Transpilation failed:');
    transpileResult.error.forEach(error => console.error(formatError(error)));
    return err('Transpilation failed');
  }
  
  return writeOutput(transpileResult.value, command.outputFile);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const parseResult = parseArgs(args);

  if (parseResult.isErr()) {
    console.error(`Error: ${parseResult.error}`);
    throw new Error('Invalid command');
  }

  const command = parseResult.value;

  switch (command.command) {
    case 'help':
      showHelp();
      return;

    case 'build': {
      const result = await executeBuild(command);
      if (result.isErr()) {
        console.error(result.error);
        throw new Error(result.error);
      }
      break;
    }
  }
}

main().catch(() => {
  // Error already logged, just exit with error code
  process.exit(1);
});