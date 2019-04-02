"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Clone an object
 *
 * @param {any} src Original object
 * @returns {any} Copied object
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
//# sourceMappingURL=utils.js.map