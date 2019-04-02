import { readFileSync, writeFileSync } from 'fs';

export class App {

  private readonly regex = {
    lang: /<file((?!source-language=").|\n)+source-language="(\w+)"/, // source-language: 2
    units: /<trans-unit((?!id=").|\n)*id="([\w.]+)"((?!>).|\n)*>(((?!<\/trans-unit>).|\n)*)<\/trans-unit>/g, // id: 2, content: 4
    source: /<source>(((?!<\/source>).|\n)*)<\/source>/, // content: 1
    target: /<target>(((?!<\/target>).|\n)*)<\/target>/, // content: 1
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
    writeFileSync(output, csv, {encoding: 'utf-8'});
    console.log(`CSV file generated successfully with ${i} translations of ${j} language(s)`)
  }

  private escape(content: string) {
    if (!content) return '';
    const json = JSON.stringify(content);
    return json.replace(/\\"/g, '""');
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

}

export interface TransUnitItem {
  source?: string;
  [key: string]: string; // Language-specific target
}