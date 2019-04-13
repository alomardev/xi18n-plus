import parser from 'fast-xml-parser';
import he from 'he';
import { readFileSync, writeFileSync } from 'fs';

const regex = {
  toencode: /<(source|target)>((?!<\/(source|target)>).|\n)*?<\/(source|target)>/g,
};

export namespace Xliff {

  export const parserOptions = {
    attributeNamePrefix: 'attr.',
    ignoreAttributes: false,
    format: true,
    indentBy: '  '
  };

  export class File {

    content: string;
    parsed: Parsed;
    units: {[key: string]: Unit};

    modified = false;

    get lang() {
      return this.parsed.xliff.file['attr.source-language'];
    }

    constructor(public path: string,) {
      this.content = readFileSync(path).toString();
      const encodedContent = this.content.replace(regex.toencode, (match, capture) => {
        const len = capture.length;
        return `<${capture}>${he.encode(match.substring(len + 2, match.length - len - 3))}</${capture}>`;
      });
      this.parsed = parser.parse(encodedContent, parserOptions);
      this.units = {};
      for(const unit of this.parsed.xliff.file.body['trans-unit']) {
        if (unit.source) unit.source = he.decode(unit.source);
        if (unit.target) unit.target = he.decode(unit.target);
        this.units[unit['attr.id']] = unit;
      }
    }

    forEach(callback: (id: string, source: string, target: string) => void) {
      if (!callback) return;
      for(const unit of this.parsed.xliff.file.body['trans-unit']) {
        callback(unit['attr.id'], unit.source, unit.target);
      }
    }

    appendTarget(id: string, source: string, target: string, overwrite: boolean = true) {
      if (Boolean(this.units[id])) {
        if (overwrite || !this.units[id].source) {
          this.units[id].source = source;
          this.modified = true;
        }
        if (overwrite || !this.units[id].target) {
          this.units[id].target = target;
          this.modified = true;
        }
      } else {
        const unit = {['attr.id']: id, source, target};
        this.parsed.xliff.file.body['trans-unit'].push(unit);
        this.units[id] = unit;
        this.modified = true;
      }
    }

    saveChanges() {
      if (this.modified) {
        writeFileSync(this.path, new parser.j2xParser(parserOptions).parse(this.parsed), {encoding: 'utf8'});
        console.info(`${this.path} updated successfully`);
        this.modified = false;
      }
    }

  }

  export type Parsed = {
    xliff: {
      ['attr.version']: string,
      ['attr.xmlns']: string,
      file: {
        ['attr.source-language']: string,
        ['attr.datatype']: string,
        body: {
          ['trans-unit']: Unit[],
        }
      }
    }
  };

  export type Unit = {['attr.id']: string, source: string, target: string};

}
