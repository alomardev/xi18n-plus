#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const app_1 = require("./app/app");
commander_1.default
    .arguments('<source-files...>')
    .option('-i, --input <file>', 'csv file to be imported')
    .option('-n, --new', 'import only new translation keys')
    .parse(process.argv);
if (!commander_1.default.input) {
    console.error('Input file should be provided');
    process.exit(0);
}
const app = new app_1.App(commander_1.default.args);
app.importTranslationUnits(commander_1.default.input, !commander_1.default.new).then((count) => {
    app.saveChanges();
    console.log(`${count} translations imported successfully`);
}).catch(err => {
    console.error(`Couldn't import translations.`, err);
});
//# sourceMappingURL=index-import.js.map