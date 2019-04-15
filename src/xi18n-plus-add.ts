#!/usr/bin/env node
import program from 'commander';
import { App } from './app/app';
import { ask } from './app/utils';

program
  .arguments('<source-files...>')
  .parse(process.argv);

const app = new App(program.args);

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
