"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fast_xml_parser_1 = __importDefault(require("fast-xml-parser"));
const he_1 = __importDefault(require("he"));
const fs_1 = require("fs");
const regex = {
    toencode: /<(source|target)>((?!<\/(source|target)>).|\n)*?<\/(source|target)>/g,
};
var Xliff;
(function (Xliff) {
    Xliff.parserOptions = {
        attributeNamePrefix: 'attr.',
        ignoreAttributes: false,
        format: true,
        indentBy: '  '
    };
    class File {
        constructor(path) {
            this.path = path;
            this.modified = false;
            this.content = fs_1.readFileSync(path).toString();
            const encodedContent = this.content.replace(regex.toencode, (match, capture) => {
                const len = capture.length;
                return `<${capture}>${he_1.default.encode(match.substring(len + 2, match.length - len - 3))}</${capture}>`;
            });
            this.parsed = fast_xml_parser_1.default.parse(encodedContent, Xliff.parserOptions);
            this.units = {};
            for (const unit of this.parsed.xliff.file.body['trans-unit']) {
                if (unit.source)
                    unit.source = he_1.default.decode(unit.source);
                if (unit.target)
                    unit.target = he_1.default.decode(unit.target);
                this.units[unit['attr.id']] = unit;
            }
        }
        get lang() {
            return this.parsed.xliff.file['attr.source-language'];
        }
        forEach(callback) {
            if (!callback)
                return;
            for (const unit of this.parsed.xliff.file.body['trans-unit']) {
                callback(unit['attr.id'], unit.source, unit.target);
            }
        }
        appendTarget(id, source, target, overwrite = true) {
            if (Boolean(this.units[id])) {
                if (overwrite || !this.units[id].source) {
                    this.units[id].source = source;
                    this.modified = true;
                }
                if (overwrite || !this.units[id].target) {
                    this.units[id].target = target;
                    this.modified = true;
                }
            }
            else {
                const unit = { ['attr.id']: id, source, target };
                this.parsed.xliff.file.body['trans-unit'].push(unit);
                this.units[id] = unit;
                this.modified = true;
            }
        }
        saveChanges() {
            if (this.modified) {
                fs_1.writeFileSync(this.path, new fast_xml_parser_1.default.j2xParser(Xliff.parserOptions).parse(this.parsed), { encoding: 'utf8' });
                console.info(`${this.path} updated successfully`);
                this.modified = false;
            }
        }
    }
    Xliff.File = File;
})(Xliff = exports.Xliff || (exports.Xliff = {}));
//# sourceMappingURL=xliff.js.map