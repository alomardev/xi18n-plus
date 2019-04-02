#!/usr/bin/env node
import program from 'commander';
import { App } from './app/app';

program
  .arguments('<source-files...>')
  .option('-o, --output <file>', 'output file')
  //.option('-c, --config <target>', 'named build target, as specified in angular.json')
  .parse(process.argv);

const app = new App(program.args);
app.exportTranslationUnits(program.output)