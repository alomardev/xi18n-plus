"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = require("fs");
const utils_1 = require("./utils");
const xliff_1 = require("./xliff");
/**
 * An instance of App contains several operations of the passed translation files
 *
 * @author Abdulrahman M. Al'omar
 */
class App {
    /**
     * @param paths Path to xliff files
     */
    constructor(paths) {
        // Array of fetched languages from input files
        this.langs = [];
        // Collection of xlf files for each language
        this.xliffs = {};
        paths.forEach(path => {
            const file = new xliff_1.Xliff.File(path);
            this.langs.push(file.lang);
            this.xliffs[file.lang] = file;
        });
    }
    /**
     * Exports parsed translations as csv contains Key, Source, and a column for each languages
     *
     * @param outputPath The path of the csv file
     */
    exportTranslationUnits(outputPath) {
        return new Promise((resolve, reject) => {
            const units = this.parseUnits();
            let csv = 'Key,Source';
            for (let i = 0; i < this.langs.length; i++) {
                csv += `,${this.langs[i].toUpperCase()}`;
            }
            csv += '\n';
            let i = 0;
            for (const id in units) {
                const unit = units[id];
                csv += `${id},${utils_1.CSV.escape(unit.source)}`;
                for (const lang of this.langs) {
                    csv += `,${utils_1.CSV.escape(unit[lang])}`;
                }
                csv += '\n';
                i++;
            }
            try {
                fs_1.writeFileSync(outputPath, csv, { encoding: 'utf8' });
                resolve(i);
            }
            catch (err) {
                reject(err);
            }
        });
    }
    /**
     * Imports csv file translations to the fetched xliff files and saves the changes
     *
     * @param input The path of the csv file
     * @param overwrite overwrite the existing translation units content
     */
    importTranslationUnits(input, overwrite = true) {
        return new Promise((resolve, reject) => {
            const translations = {};
            if (!fs_1.existsSync(input)) {
                reject(`The file ${input} doesn't exist`);
                return;
            }
            try {
                fs_1.createReadStream(input).pipe(csv_parser_1.default({
                    mapHeaders: ({ header }) => header.toLowerCase(),
                    mapValues: ({ index, value }) => index > 0 ? utils_1.CSV.unescape(value) : value
                })).on('data', (row) => {
                    const { key, source } = row;
                    for (const k in row) {
                        if (k === 'key' || k === 'source')
                            continue;
                        if (!translations[key]) {
                            translations[key] = { source };
                        }
                        translations[key][k] = row[k];
                    }
                }).on('end', () => {
                    for (const id in translations) {
                        const unit = translations[id];
                        const { source } = unit;
                        for (const key in unit) {
                            if (key === 'source')
                                continue;
                            this.xliffs[key].appendTarget(id, source, unit[key], overwrite);
                        }
                    }
                    resolve(Object.keys(translations).length);
                }).on('error', (err) => {
                    reject(err);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    add(id, source, translations) {
        for (const lang in translations) {
            this.xliffs[lang].appendTarget(id, source, translations[lang]);
        }
    }
    /**
     * Save modified fetched xliff files
     */
    saveChanges() {
        for (const lang of this.langs) {
            this.xliffs[lang].saveChanges();
        }
    }
    /**
     * Convert fetched xliff files to combined translation units
     */
    parseUnits() {
        const translations = {};
        for (const lang of this.langs) {
            const file = this.xliffs[lang];
            file.forEach((id, source, target) => {
                if (!translations[id]) {
                    translations[id] = { source };
                }
                translations[id][lang] = target;
            });
        }
        return translations;
    }
}
exports.App = App;
