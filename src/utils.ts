import fs from 'fs';
/**
 * Delete messages file
 *
 * @param {string} path File path
 */
export function deleteFile(path: string) {
  process.chdir('src');
  fs.unlinkSync(path);
  process.chdir('..');
}