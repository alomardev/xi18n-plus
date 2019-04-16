#!/usr/bin/env node
import program from 'commander';
import { App } from './app/app';
import { ask } from './app/utils';

program.version('0.1.8', '-v, --version')

// Serve Command
program.command('serve')
.description('serve a web page to manage translations')
.action((args, cmd) => {
  console.log('Not implemented!');
});

// Export Command
program.command('export <files...>')
.description('export translation units to csv file')
.option('-o, --output <file>', 'output file')
.action((args, cmd) => {
  const app = new App(args);
  app.exportTranslationUnits(cmd.output).then(count => {
    console.log(`${count} translations exported successfully to ${cmd.output}`);
  }).catch((err) => {
    console.error(`Couldn't export translations.`, err);
  });
});

// Import Command
program.command('import <files...>')
.description('import translation units from csv file')
.option('-i, --input <file>', 'csv file to be imported')
.option('-n, --new', 'import only new translation keys')
.action((args, cmd) => {
  if (!cmd.input) {
    console.error('Input file should be provided');
    process.exit(0);
  }
  const app = new App(args);
  app.importTranslationUnits(cmd.input, !cmd.new).then((count) => {
    app.saveChanges();
    console.log(`${count} translations imported successfully`);
  }).catch(err => {
    console.error(`Couldn't import translations.`, err);
  });
});

// Add Command
program.command('add <files...>')
.description('add a translation unit')
.action((args) => {
  const app = new App(args);

  ask(['id: ', ...app.langs.map(lang => `${lang}: `)]).then(answers => {
    const id = answers[0];
    const enIndex = app.langs.findIndex(item => item === 'en');
    const source = answers[enIndex >= 0 ? enIndex + 1 : 1];
    const translations: { [key: string]: string } = {};
    for (let i = 0; i < app.langs.length; i++) {
      translations[app.langs[i]] = answers[i + 1];
    }
    app.add(id, source, translations);
    app.saveChanges();
  });

});

program.parse(process.argv);