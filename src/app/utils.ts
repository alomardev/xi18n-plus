/**
 * Clone an object
 *
 * @param {any} src Original object
 * @returns {any} Copied object
 */
export function clone(src: any): any {
  const target: any = {};
  for (const prop in src) {
    if (src.hasOwnProperty(prop)) {
      target[prop] = src[prop];
    }
  }
  return target;
}