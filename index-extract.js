#!/usr/bin/env node
var program = require('commander');
var app = require('./app');

program
  .allowUnknownOption()
  .parse(process.argv);
var filePath = app.getOutputFile(program.rawArgs);
if (!filePath) {
  console.error('--outFile should be provided');
  process.exit(1);
}

app.backupFile(filePath);

var originalXmlElement = app.parseFile(filePath);
var translations;
if (originalXmlElement) {
  translations = app.extractTranslations(originalXmlElement);
}

app.xi18n(process.argv.slice(2).join(' '), () => {
  if(!translations) {
    console.warn('Appending old translations is skipped');
    return;
  }

  var outputElement = app.appendTranslations(translations, app.parseFile(filePath));

  app.saveFile(filePath, outputElement);

  console.log('Translations appended successfully');
});