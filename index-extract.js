#!/usr/bin/env node
var program = require('commander');
var app = require('./app');

program
  .allowUnknownOption()
  .option('--outFile', 'point to the messages file')
  .parse(process.argv);

var filePath = app.getOutputFile(program.rawArgs);
if (!filePath) {
  console.error('--outFile, --out-file, or -of should be provided');
  process.exit(1);
}

//app.backupFile(filePath);

var originalXml = app.loadFile(filePath);
var translations;
if (originalXml) {
  translations = app.extractTranslations(originalXml);
}

app.xi18n(process.argv.slice(2).join(' '), () => {
  if(!translations) {
    console.warn('Appending old translations is skipped');
    return;
  }
  var content = app.loadFile(filePath);
  var outputXml = app.appendTranslations(translations, content);
  app.saveFile(filePath, outputXml);

  console.log('Translations appended successfully');
});