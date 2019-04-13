import csv from 'csv-parser';
import { createReadStream, writeFileSync } from 'fs';
import { CSV } from './utils';
import { Xliff } from './xliff';

// Rpresents a unit as that combines all languages of a single source
type Units = { [key: string]: { source?: string, [key: string]: string } };

/**
 * An instance of App contains several operations of the passed translation files
 *
 * @author Abdulrahman M. Al'omar
 */
export class App {

  // Collection of xlf files for each language
  private xliffs: { [key: string]: Xliff.File } = {};

  // Array of fetched languages from input files
  private langs: string[] = [];

  /**
   * @param paths Path to xliff files
   */
  constructor(paths: string[]) {
    paths.forEach(path => {
      const file = new Xliff.File(path);
      this.langs.push(file.lang);
      this.xliffs[file.lang] = file;
    });
  }

  /**
   * Exports parsed translations as csv contains Key, Source, and a column for each languages
   *
   * @param outputPath The path of the csv file
   */
  exportTranslationUnits(outputPath: string) {
    const units = this.parseUnits();

    let csv = 'Key,Source';
    for (let i = 0; i < this.langs.length; i++) {
      csv += `,${this.langs[i].toUpperCase()}`;
    }

    csv += '\n';
    let i = 0;
    for (const id in units) {
      const unit = units[id];
      csv += `${id},${CSV.escape(unit.source)}`
      for (const lang of this.langs) {
        csv += `,${CSV.escape(unit[lang])}`;
      }
      csv += '\n';
      i++;
    }

    writeFileSync(outputPath, csv, { encoding: 'utf8' });
    console.log(`CSV file generated successfully with ${i} translations of ${this.langs.length} language(s)`);
  }

  /**
   * Imports csv file translations to the fetched xliff files and saves the changes
   *
   * @param input The path of the csv file
   * @param overwrite overwrite the existing translation units content
   */
  importTranslationUnits(input: string, overwrite: boolean = true) {
    const translations: Units = {};
    createReadStream(input).pipe(csv({
      mapHeaders: ({ header }) => header.toLowerCase(),
      mapValues: ({ index, value }) => index > 0 ? CSV.unescape(value) : value
    })).on('data', (row) => {
      const { key, source } = row;
      for (const k in row) {
        if (k === 'key' || k === 'source') continue;
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
          if (key === 'source') continue
          this.xliffs[key].appendTarget(id, source, unit[key], overwrite);
        }
      }
      for (const lang of this.langs) {
        this.xliffs[lang].saveChanges();
      }
    });
  }

  /**
   * Convert fetched xliff files to combined translation units
   */
  private parseUnits(): Units {
    const translations: Units = {};
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
