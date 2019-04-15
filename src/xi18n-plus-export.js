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
    .option('-o, --output <file>', 'output file')
    .parse(process.argv);
const app = new app_1.App(commander_1.default.args);
app.exportTranslationUnits(commander_1.default.output).then(count => {
    console.log(`${count} translations exported successfully to ${commander_1.default.output}`);
}).catch((err) => {
    console.error(`Couldn't export translations.`, err);
});
