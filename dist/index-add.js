#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const app_1 = require("./app/app");
const utils_1 = require("./app/utils");
commander_1.default
    .arguments('<source-files...>')
    .parse(process.argv);
const app = new app_1.App(commander_1.default.args);
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
//# sourceMappingURL=index-add.js.map