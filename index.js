#!/usr/bin/env node
var program = require('commander')

program
  .version('0.0.1', '-v, --version')
  .allowUnknownOption()
  .command('extract <xi18nArgs>', 'Extract translations using xi18n tool and appends the already translated units', { isDefault: true})
  .command('serve', 'Serve GUI to translate keys with ease')
  .parse(process.argv);
