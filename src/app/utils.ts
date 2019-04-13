/**
 * Clone an object
 *
 * @param src Original object
 * @returns Copied object
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

export namespace CSV {

  /**
   * Escapes white space characters and the quotation
   * to represent them in the csv file as expected
   *
   * @param content The xliff element content to be escaped
   */
  export function escape(content: string) {
    if (!content) return '';
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

  /**
   * Unescapes the escaped characters
   * to be stored in xliff elements as expected
   *
   * @param content CSV content to unescaped
   */
  export function unescape(content: string) {
    if (!content) return '';
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

}