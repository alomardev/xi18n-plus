#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const app_1 = require("./app/app");
const utils_1 = require("./app/utils");
commander_1.default.version('0.1.8', '-v, --version');
// Serve Command
commander_1.default.command('serve')
    .description('serve a web page to manage translations')
    .action((args, cmd) => {
    console.log('Not implemented!');
});
// Export Command
commander_1.default.command('export <files...>')
    .description('export translation units to csv file')
    .option('-o, --output <file>', 'output file')
    .action((args, cmd) => {
    const app = new app_1.App(args);
    app.exportTranslationUnits(cmd.output).then(count => {
        console.log(`${count} translations exported successfully to ${cmd.output}`);
    }).catch((err) => {
        console.error(`Couldn't export translations.`, err);
    });
});
// Import Command
commander_1.default.command('import <files...>')
    .description('import translation units from csv file')
    .option('-i, --input <file>', 'csv file to be imported')
    .option('-n, --new', 'import only new translation keys')
    .action((args, cmd) => {
    if (!cmd.input) {
        console.error('Input file should be provided');
        process.exit(0);
    }
    const app = new app_1.App(args);
    app.importTranslationUnits(cmd.input, !cmd.new).then((count) => {
        app.saveChanges();
        console.log(`${count} translations imported successfully`);
    }).catch(err => {
        console.error(`Couldn't import translations.`, err);
    });
});
// Add Command
commander_1.default.command('add <files...>')
    .description('add a translation unit')
    .action((args) => {
    const app = new app_1.App(args);
    utils_1.ask(['id: ', ...app.langs.map(lang => `${lang}: `)]).then(answers => {
        const id = answers[0];
        const enIndex = app.langs.findIndex(item => item === 'en');
        const source = answers[enIndex >= 0 ? enIndex + 1 : 1];
        const translations = {};
        for (let i = 0; i < app.langs.length; i++) {
            translations[app.langs[i]] = answers[i + 1];
        }
        app.add(id, source, translations);
        app.saveChanges();
    });
});
commander_1.default.parse(process.argv);
//# sourceMappingURL=xi18n-plus.js.map