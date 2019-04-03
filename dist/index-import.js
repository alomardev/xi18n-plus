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
    .parse(process.argv);
const app = new app_1.App(commander_1.default.args);
app.importTranslationUnits(commander_1.default.input);
//# sourceMappingURL=index-import.js.map