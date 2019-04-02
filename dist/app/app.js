"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class App {
    constructor(files) {
        this.regex = {
            lang: /<file((?!source-language=").|\n)+source-language="(\w+)"/,
            units: /<trans-unit((?!id=").|\n)*id="([\w.]+)"((?!>).|\n)*>(((?!<\/trans-unit>).|\n)*)<\/trans-unit>/g,
            source: /<source>(((?!<\/source>).|\n)*)<\/source>/,
            target: /<target>(((?!<\/target>).|\n)*)<\/target>/,
        };
        this.fileContents = files.map(f => fs_1.readFileSync(f).toString());
    }
    ;
    getTranslationUnits() {
        const translations = new TransUnits();
        for (const content of this.fileContents) {
            const lang = content.match(this.regex.lang)[2];
            translations.addLanguage(lang);
            let matches;
            while (matches = this.regex.units.exec(content)) {
                const key = matches[2];
                const inner = matches[4];
                const sourceMatch = inner.match(this.regex.source);
                const targetMatch = inner.match(this.regex.target);
                const source = sourceMatch ? sourceMatch[1] : null;
                const target = targetMatch ? targetMatch[1] : null;
                translations.addTransUnit(lang, key, source, target);
            }
        }
        return translations;
    }
    exportTranslationUnits(output, transUnits = this.getTranslationUnits()) {
        let csv = 'Key,Source';
        let j = 0;
        for (const lang of transUnits.languages) {
            csv += `,${lang.toUpperCase()}`;
            j++;
        }
        csv += '\n';
        let i = 0;
        for (const key of transUnits.keys) {
            const item = transUnits.get(key);
            csv += `${key},${this.escape(item.source)}`;
            for (const lang of transUnits.languages) {
                csv += `,${this.escape(item[lang])}`;
            }
            csv += '\n';
            i++;
        }
        fs_1.writeFileSync(output, csv, { encoding: 'utf-8' });
        console.log(`CSV file generated successfully with ${i} translations of ${j} language(s)`);
    }
    escape(content) {
        if (!content)
            return '';
        const json = JSON.stringify(content);
        return json.replace(/\\"/g, '""');
    }
}
exports.App = App;
class TransUnits {
    constructor() {
        this.languages = new Array();
        this.units = {};
    }
    get keys() {
        return Object.keys(this.units);
    }
    addLanguage(lang) {
        this.languages.push(lang);
    }
    addTransUnit(lang, key, source, target) {
        this.units[key] = Object.assign({}, this.units[key], { [lang]: target });
        if (source)
            this.units[key].source = source;
    }
    get(key) {
        return this.units[key];
    }
}
exports.TransUnits = TransUnits;
//# sourceMappingURL=app.js.map