#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
commander_1.default
    .version('0.1.2', '-v, --version')
    .command('serve', 'serve a web page to manage translations', { isDefault: true })
    .command('export', 'export translation units to csv file')
    .command('import', 'import translation units from csv file')
    .command('add', 'add a translation unit')
    .command('update', 'update a translation unit')
    .command('delete', 'delete a translation unit')
    .parse(process.argv);
//# sourceMappingURL=index.js.map