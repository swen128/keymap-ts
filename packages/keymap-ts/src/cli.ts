#!/usr/bin/env node

import {err, ok, Result, ResultAsync} from 'neverthrow';
import {transpile, type TranspileError} from './transpiler.js';
import {writeFileSync} from 'fs';
import {createJiti} from 'jiti';
import {resolve} from 'path';
import {pathToFileURL} from 'url';

function showHelp(): void {
  console.log(`
keymap-ts - TypeScript DSL for ZMK Keymaps

Usage: 
  kts <command> [options]

Commands:
  build <input-file> <output-file>   Transpile a keymap file to ZMK devicetree format

Options:
  -h, --help   Show this help message

Examples:
  kts build keymap.ts keymap.keymap
  kts build keymap.ts > my-keyboard.keymap
  kts build keymap.ts

The keymap file should export a default object with the keymap configuration.
`);
}

type BuildCommand = { command: 'build'; inputFile: string; outputFile: string };
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
    const [, inputFile, outputFile] = args;
    if (inputFile === undefined) {
      return err('Input file is required for build command');
    }
    if (outputFile === undefined) {
      return err('Output file is required for build command');
    }
    return ok({command: 'build', inputFile, outputFile});
  }

  return err(`Unknown command '${command}'\nRun with --help for usage information`);
}

const importFile = (filePath: string): ResultAsync<unknown, string> => {
  const absolutePath = resolve(filePath);
  const fileUrl = pathToFileURL(absolutePath).href;
  const jiti = createJiti(import.meta.url);

  return ResultAsync.fromPromise(
    Promise.resolve(jiti.import(fileUrl, {default: true})),
    (error) => `Failed to import file: ${error instanceof Error ? error.message : String(error)}`
  );
}

const formatError = (error: TranspileError): string => {
  const path = error.path !== undefined ? error.path.join('.') : '';
  return `  ${path ? `[${path}] ` : ''}${error.message}`;
}

const transpile_ = (keymap: unknown): Result<string, string> =>
  transpile(keymap).mapErr(errors => errors.map(formatError).join('\n\n'));

const build = async ({inputFile, outputFile}: { inputFile: string, outputFile: string }): Promise<void> => {
  const result = await importFile(inputFile).andThen(transpile_)

  if (result.isOk()) {
    writeFileSync(outputFile, result.value)
  } else {
    console.error(result.error);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const parseResult = parseArgs(args);

  if (parseResult.isErr()) {
    console.error(`Invalid command arguments: ${parseResult.error}`);
    process.exit(1);
  }

  const command = parseResult.value;

  switch (command.command) {
    case 'help':
      return showHelp();
    case 'build':
      return build(command);
  }
}

void main();
