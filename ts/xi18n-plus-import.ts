#!/usr/bin/env node
import program from 'commander';
import { App } from './app/app';

program
  .arguments('<source-files...>')
  .option('-i, --input <file>', 'csv file to be imported')
  .option('-n, --new', 'import only new translation keys')
  .parse(process.argv);

if (!program.input) {
  console.error('Input file should be provided');
  process.exit(0);
}
const app = new App(program.args);
app.importTranslationUnits(program.input, !program.new).then((count) => {
  app.saveChanges();
  console.log(`${count} translations imported successfully`);
}).catch(err => {
  console.error(`Couldn't import translations.`, err);
});