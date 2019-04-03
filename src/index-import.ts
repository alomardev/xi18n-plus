#!/usr/bin/env node
import program from 'commander';
import { App } from './app/app';

program
  .arguments('<source-files...>')
  .option('-i, --input <file>', 'csv file to be imported')
  .parse(process.argv);

const app = new App(program.args);
app.importTranslationUnits(program.input);