const fs = require('fs');

const constants = {
  input: './package.json',
  output: './dist/package.json',
  main: './src/xi18n-plus.js',
  bin: 'xi18n-plus',
}

const package = JSON.parse(fs.readFileSync(constants.input).toString());

delete package.scripts;
package.bin[constants.bin] = package.main = constants.main;

fs.writeFileSync(constants.output, JSON.stringify(package, null, '  '));
