#!/usr/bin/env node
import program from 'commander';
import { App } from './app/app';

program
  .arguments('<source-files...>')
  .option('-o, --output <file>', 'output file')
  .parse(process.argv);

const app = new App(program.args);
app.exportTranslationUnits(program.output)