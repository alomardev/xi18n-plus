var fs = require('fs');
var exec = require('child_process').exec;
var _ = require('lodash');

var bin = {
  xi18n: './node_modules/.bin/ng',
  ngxExtractor: './node_modules/.bin/ngx-extractor',
};

module.exports = {

  /**
   * Clone an object
   *
   * @param {any} src Original object
   * @returns {any} Copied object
   */
  clone: function(src) {
    var target = {};
    for (var prop in src) {
      if (src.hasOwnProperty(prop)) {
        target[prop] = src[prop];
      }
    }
    return target;
  },


  /**
   * Extract translation from trans-unit elements
   *
   * @param {string} xml XML data
   * @returns {{[key: string]: string}} Translations
   */
  extractTranslations: function(xml) {
    console.log('Extracting translation units...');

    var translations = {};
    var lastTransUnitIndex = 0;
    var i = 0;
    while (true) {
      var transUnitIndex = xml.indexOf('<trans-unit', lastTransUnitIndex);
      if (transUnitIndex === -1) break;

      var fromIndex = transUnitIndex + 11;
      var toIndex = xml.indexOf('</trans-unit>', fromIndex);

      var id = this.betweenIndices('id="', '"', fromIndex, toIndex, xml);
      var target = this.betweenIndices('<target>', '</target>', fromIndex, toIndex, xml);

      if (id && target) {
        translations[id] = target;
        i++;
      }

      lastTransUnitIndex = toIndex;
    }

    console.log(`${i} trans-unit extracted`);
    return translations;
  },

  /**
   * Get text between two strings
   *
   * @param {string} start Starting text
   * @param {string} end Ending text
   * @param {number} fromIndex Search starting index
   * @param {number} toIndex Search ending index
   * @param {string} xml XML data
   */
  betweenIndices: function(start, end, fromIndex, toIndex, xml) {
    var startLen = start.length;
    var startIndex = xml.indexOf(start, fromIndex);
    if (startIndex === -1 || startIndex > toIndex) return null;
    var endIndex = xml.indexOf(end, startIndex + startLen);
    if (endIndex === -1 || endIndex > toIndex) return null;
    return xml.substring(startIndex + startLen, endIndex);
  },

  /**
   * Backup existing messages file
   *
   * @param {string} path File path
   */
  backupFile: function(path) {
    process.chdir('src');
    if (fs.existsSync(path)) {
      console.log(`Copying ${path} to ${path}.old...`);
      fs.copyFileSync(path, `${path}.old`);
    } else {
      console.log(`The file ${path} doesn't exist`);
    }
    process.chdir('..');
  },

  /**
   * Delete messages file
   *
   * @param {string} path File path
   */
  deleteFile: function(path) {
    process.chdir('src');
    fs.unlinkSync(path);
    process.chdir('..');
  },

  /**
   * Save file to the specified path
   *
   * @param {string} path Output file path
   * @param {string} xml XML data
   */
  saveFile: function(path, xml) {
    var output = xml
      .replace(/\n\s*(\s?)(<x|<\/source>|<\/target>)/g, '$1')
      .replace(/ \s+<x/g, ' ')
      .replace(/(<source>|<target>)\s+/g, '$1')
      .replace(/\s+(<\/source>|<\/target>)/g, '$1')
      .replace(/([ \t]*)<\/trans-unit><trans-unit/g, '$1</trans-unit>\n$1<trans-unit');
    process.chdir('src');
    fs.writeFileSync(path, output, { encoding: 'utf8' });
    process.chdir('..');
  },

  /**
   * Load xml file
   *
   * @param {string} path File path
   * @returns {string} XML data
   */
  loadFile: function(path) {
    console.log(`Loading ${path}...`);
    process.chdir('src');
    var result;
    if (fs.existsSync(path)) {
      result = fs.readFileSync(path, { encoding: 'utf8' });
    } else {
      console.error(`The file ${path} doesn't exist`);
    }
    process.chdir('..');
    return result;
  },

  /**
   * Get output file path from --outFile option
   *
   * @param {string[]} args Process arguments
   * @returns {string} Messages file path
   */
  getOutputFile: function(args) {
    var file;
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      if (arg.startsWith('--outFile') || arg.startsWith('--out-file') || arg.startsWith('-of')) {
        if (arg.indexOf('=') != -1) {
          file = arg.split('=')[1];
        } else {
          file = args[i + 1];
        }
      }
    }
    if (!file) {
      console.error(`Couldn't get output file from args`);
    }
    return file;
  },

  /**
   * Appends the passed translation to xml data
   *
   * @param {{[key: string]: string}} translations
   * @param {string} xml XML data
   * @returns {string} XML data with translations
   */
  appendTranslations: function(translations, xml) {
    var lastTransUnitIndex = 0;
    var keys = Object.keys(translations);
    while (true) {
      var transUnitIndex = xml.indexOf('<trans-unit', lastTransUnitIndex);
      if (transUnitIndex === -1) break;

      var fromIndex = transUnitIndex + 11;
      var toIndex = xml.indexOf('</trans-unit>', fromIndex);

      var id = this.betweenIndices('id="', '"', fromIndex, toIndex, xml);
      var sourceCloseIndex = xml.indexOf('</source>', fromIndex);
      var targetIndex = xml.indexOf('<target>', fromIndex);

      var additionalChars = '';
      if (keys.indexOf(id) !== -1 && (targetIndex === -1 || targetIndex > toIndex) && sourceCloseIndex < toIndex) {
        var spaces = '';
        var spaceCheckStartIndex = xml.indexOf('\n', fromIndex);
        var spaceCheckEndIndex = xml.indexOf('\n', spaceCheckStartIndex + 1);
        for (var c of xml.slice(spaceCheckStartIndex + 1, spaceCheckEndIndex)) {
          if (c === ' ' || c === '\t') {
            spaces += c;
          } else {
            break;
          }
        }
        additionalChars = '\n' + spaces + '<target>' + translations[id] + '</target>';
        xml = xml.slice(0, sourceCloseIndex + 9) + additionalChars + xml.slice(sourceCloseIndex + 9);
      }

      lastTransUnitIndex = toIndex + additionalChars.length;
    }
    return xml;
  },

  /**
   * Executes ng xi18n with arguments
   *
   * @param {string} args ng xi18n arguments
   * @param {() => void} callback
   */
  xi18n: function(args, callback) {
    if (!fs.existsSync(`${bin.xi18n}`)) {
      console.error(`Coudln't find ng command`);
      return;
    }
    console.log(`Executing 'ng xi18n ${args}'...`);
    var child = exec(`${bin.xi18n} xi18n ${args}`, (err) => {
      if (err) {
        console.error(`Error occured while executing ng xi18n ${args}`);
        return;
      }
      this.ngxExtractor(this.getOutputFile(args.split(' ')), callback);
    });
    child.stdout.pipe(process.stdout);
    // TODO: Output the content of the child_process
  },

  ngxExtractor(outFile, callback) {
    outFile = outFile.startsWith('/') ? 'src' + outFile : 'src/' + outFile;
    if (!fs.existsSync(`${bin.ngxExtractor}`)) {
      console.error(`Coudln't find ngx-extract command`);
      callback();
      return;
    }
    console.log(`Executing 'ngx-extractor --input src/**/*.ts --out-file ${outFile}'...`);
    var child = exec(`${bin.ngxExtractor} --input src/**/*.ts --out-file ${outFile}`, (err) => {
      if (err) {
        console.error(`Error occured while executing ngx-extractor --input src/**/*.ts --out-file ${outFile}`);
        return;
      }
      callback();
    });
    child.stdout.on('data', (data) => console.log(data));
    // TODO: Output the content of the child_process
  }

}