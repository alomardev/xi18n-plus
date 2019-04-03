"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const csv_parser_1 = __importDefault(require("csv-parser"));
class App {
    constructor(files) {
        this.regex = {
            lang: /<file((?!source-language=").|\n)+source-language="(\w+)"/,
            units: /<trans-unit((?!id=").|\n)*id="([\w.]+)"((?!>).|\n)*>(((?!<\/trans-unit>).|\n)*)<\/trans-unit>/g,
            source: /<source>(((?!<\/source>).|\n)*)<\/source>/,
            target: /<target>(((?!<\/target>).|\n)*)<\/target>/,
            csvUnescape: /\\[ntfrb]/,
            csvEscape: /[\n\t\f\r\b]/,
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
        fs_1.writeFileSync(output, csv, { encoding: 'utf8' });
        console.log(`CSV file generated successfully with ${i} translations of ${j} language(s)`);
    }
    importTranslationUnits(input) {
        const translations = new TransUnits();
        fs_1.createReadStream(input).pipe(csv_parser_1.default({
            mapHeaders: ({ header, index }) => {
                const h = header.toLowerCase();
                if (index > 1) {
                    translations.addLanguage(h);
                }
                return h;
            },
            mapValues: ({ index, value }) => index > 0 ? this.unescape(value) : value
        })).on('data', (row) => {
            const { key, source } = row;
            for (const k in row) {
                if (k === 'key' || k === 'source')
                    continue;
                translations.addTransUnit(k, key, source, row[k]);
            }
        }).on('end', () => {
            fs_1.writeFileSync('test.xml', translations.toString('ar'), { encoding: 'utf8' });
        });
    }
    escape(content) {
        if (!content)
            return '';
        // TODO: Use regexp's conditional replace
        return `"${content
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t')
            .replace(/\f/g, '\\f')
            .replace(/\r/g, '\\r')
            .replace(/"/g, '""')}"`;
    }
    unescape(content) {
        if (!content)
            return '';
        // TODO: Use regexp's conditional replace
        return content
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\f/g, '\f')
            .replace(/\\r/g, '\r');
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
    toString(lang, indent = 2, offset = '') {
        let tab = '';
        while (indent-- > 0) {
            tab += ' ';
        }
        let output = '';
        for (const k of this.keys) {
            const item = this.units[k];
            output += `${offset}<trans-unit id="${k}">\n${offset + tab}` +
                (item.source ? `<source>${item.source}</source>\n` : '') +
                (item[lang] ? `${offset + tab}<target>${item[lang]}</target>\n` : '') +
                `${offset}</trans-unit>\n`;
        }
        return output;
    }
}
exports.TransUnits = TransUnits;
//# sourceMappingURL=app.js.map