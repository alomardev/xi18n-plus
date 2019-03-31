"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
/**
 * Delete messages file
 *
 * @param {string} path File path
 */
function deleteFile(path) {
    process.chdir('src');
    fs_1.default.unlinkSync(path);
    process.chdir('..');
}
exports.deleteFile = deleteFile;
//# sourceMappingURL=utils.js.map