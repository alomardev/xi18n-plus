import { readFileSync, writeFileSync, createReadStream } from 'fs';
import csv from 'csv-parser';

export class App {

  private readonly regex = {
    lang: /<file((?!source-language=").|\n)+source-language="(\w+)"/, // source-language: 2
    units: /<trans-unit((?!id=").|\n)*id="([\w.]+)"((?!>).|\n)*>(((?!<\/trans-unit>).|\n)*)<\/trans-unit>/g, // id: 2, content: 4
    source: /<source>(((?!<\/source>).|\n)*)<\/source>/, // content: 1
    target: /<target>(((?!<\/target>).|\n)*)<\/target>/, // content: 1
    csvUnescape: /\\[ntfrb]/, // content: 1
    csvEscape: /[\n\t\f\r\b]/, // content: 1
  }

  private fileContents: string[];

  constructor(files: string[]) {
    this.fileContents = files.map(f => readFileSync(f).toString());
  };

  getTranslationUnits(): TransUnits {
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
        translations.addTransUnit(lang, key, source, target)
      }
    }
    return translations;
  }

  exportTranslationUnits(output: string, transUnits: TransUnits = this.getTranslationUnits()) {
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
      csv += `${key},${this.escape(item.source)}`
      for(const lang of transUnits.languages) {
        csv += `,${this.escape(item[lang])}`;
      }
      csv += '\n';
      i++;
    }
    writeFileSync(output, csv, {encoding: 'utf8'});
    console.log(`CSV file generated successfully with ${i} translations of ${j} language(s)`)
  }

  importTranslationUnits(input: string) {
    const translations = new TransUnits();
    createReadStream(input).pipe(csv({
      mapHeaders: ({header, index}) => {
        const h = header.toLowerCase();
        if (index > 1) {
          translations.addLanguage(h);
        }
        return h;
      },
      mapValues: ({index, value}) => index > 0 ? this.unescape(value) : value
    })).on('data', (row) => {
      const {key, source} = row;
      for (const k in row) {
        if (k === 'key' || k === 'source') continue;
        translations.addTransUnit(k, key, source, row[k]);
      }
    }).on('end', () => {
      writeFileSync('test.xml', translations.toString('ar'), {encoding: 'utf8'});
    });
  }

  private escape(content: string) {
    if (!content) return '';
    // TODO: Use regexp's conditional replace
    return `"${content
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t')
      .replace(/\f/g, '\\f')
      .replace(/\r/g, '\\r')
      .replace(/"/g, '""')}"`;
  }

  private unescape(content: string) {
    if (!content) return '';
    // TODO: Use regexp's conditional replace
    return content
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\f/g, '\f')
      .replace(/\\r/g, '\r');
  }

}

export class TransUnits {

  languages: string[] = new Array();

  units: { [key: string]: TransUnitItem } = {};

  get keys() {
    return Object.keys(this.units);
  }

  addLanguage(lang: string) {
    this.languages.push(lang);
  }

  addTransUnit(lang: string, key: string, source: string, target: string) {
    this.units[key] = {...this.units[key], [lang]: target};
    if (source) this.units[key].source = source;
  }

  get(key: string) {
    return this.units[key];
  }

  toString(lang: string, indent: number = 2, offset: string = '') {
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

export interface TransUnitItem {
  source?: string;
  [key: string]: string; // Language-specific target
}