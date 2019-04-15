#!/usr/bin/env node
import program from 'commander';

program
  .version('0.1.2', '-v, --version')
  .command('serve', 'serve a web page to manage translations', {isDefault: true})
  .command('export', 'export translation units to csv file')
  .command('import', 'import translation units from csv file')
  .command('add', 'add a translation unit')
  .command('update', 'update a translation unit')
  .command('delete', 'delete a translation unit')
  .parse(process.argv);
