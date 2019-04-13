"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Clone an object
 *
 * @param src Original object
 * @returns Copied object
 */
function clone(src) {
    const target = {};
    for (const prop in src) {
        if (src.hasOwnProperty(prop)) {
            target[prop] = src[prop];
        }
    }
    return target;
}
exports.clone = clone;
var CSV;
(function (CSV) {
    /**
     * Escapes white space characters and the quotation
     * to represent them in the csv file as expected
     *
     * @param content The xliff element content to be escaped
     */
    function escape(content) {
        if (!content)
            return '';
        return `"${content.replace(/(\n|\t|\f|\r|")/g, (match) => {
            switch (match) {
                case '\n': return '\\n';
                case '\t': return '\\t';
                case '\f': return '\\f';
                case '\r': return '\\r';
                case '"': return '""';
            }
            return match;
        })}"`;
    }
    CSV.escape = escape;
    /**
     * Unescapes the escaped characters
     * to be stored in xliff elements as expected
     *
     * @param content CSV content to unescaped
     */
    function unescape(content) {
        if (!content)
            return '';
        return `${content.replace(/(\\n|\\t|\\f|\\r)/g, (match) => {
            switch (match) {
                case '\\n': return '\n';
                case '\\t': return '\t';
                case '\\f': return '\f';
                case '\\r': return '\r';
            }
            return match;
        })}`;
    }
    CSV.unescape = unescape;
})(CSV = exports.CSV || (exports.CSV = {}));
//# sourceMappingURL=utils.js.map