var fs = require('fs');
var exec = require('child_process').exec;
var convertXml = require('xml-js');

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
   * @param {convertXml.Element} rootElement XML element
   * @returns {{[key: string]: convertXml.Element}} Translations
   */
  extractTranslations: function(rootElement) {
    console.log('Extracting translation units...');
    var targets = {};
    var i = 0;
    var elements = this.getElement(rootElement, 'xliff.file.body').elements;
    for (var e of elements) {
      if (e.name !== 'trans-unit') {
        continue;
      }
      var target = this.getElement(e, 'target');
      if (!target) continue;
      i++;
      targets[e.attributes.id] = target;
    }

    console.log(`${i} trans-unit extracted`);
    return targets;
  },

  /**
   * Get element from converted xml element
   * by sequence of tag names
   *
   * @param {convertXml.Element} element XML element
   * @param {string} tag Element path
   * @returns {convertXml.Element} XML element
   */
  getElement: function(element, tag) {
    var segs = tag.split('.');
    for (var e of element.elements) {
      if (e.name === segs[0]) {
        if (segs.length > 1) {
          segs.splice(0, 1);
          return this.getElement(e, segs.join('.'));
        } else {
          return e;
        }
      }
    }
    return null;
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
   * @param {convertXml.Element} rootElement XML element
   */
  saveFile: function(path, rootElement) {
    var output = convertXml.js2xml(rootElement, {
      spaces: 2
    });
    process.chdir('src');
    fs.writeFileSync(path, output, { encoding: 'utf8' });
    process.chdir('..');
  },

  /**
   * Parse xml file
   *
   * @param {string} path File path
   * @returns {convertXml.Element} XML element
   */
  parseFile: function(path) {
    console.log(`Parsing ${path}...`);

    process.chdir('src');
    var result;
    if (fs.existsSync(path)) {
      var rawXml = fs.readFileSync(path, { encoding: 'utf8' });
      result = convertXml.xml2js(rawXml);
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
      if (arg.startsWith('--outFile')) {
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
   * Appends the passed translation to the xml element
   *
   * @param {{[key: string]: convertXml.Element}} translations
   * @param {convertXml.Element} rootElement XML element
   * @returns {convertXml.Element} New XML element with translations
   */
  appendTranslations: function(translations, rootElement) {
    var transKeys = Object.keys(translations);
    if (!transKeys.length === 0) {
      return;
    }
    var cloned = this.clone(rootElement);
    var bodyElements = this.getElement(cloned, 'xliff.file.body').elements;
    for (var e of bodyElements) {
      if (e.name !== 'trans-unit') {
        continue;
      }
      var key = e.attributes.id;
      var index = transKeys.indexOf(key);
      if (index >= 0) {
        var sourceIndex = 0;
        for (var i = 0; i < e.elements.length; i++) {
          if (e.elements[i].name === 'source') {
            sourceIndex = i;
            break;
          }
        }
        e.elements.splice(sourceIndex + 1, 0, translations[key]);
        transKeys.splice(index, 1);
      }
    }

    // give warning if there are missed keys
    if (transKeys.length > 0) {
      console.warn(`${transKeys.length} missed keys, for the following:`);
      for (const k of transKeys) {
        console.log(translations[k].source);
      }
    }

    return cloned;
  },

  /**
   * Executes ng xi18n with arguments
   *
   * @param {string} args ng xi18n arguments
   * @param {() => void} callback
   */
  xi18n: function(args, callback) {
    console.log(`Executing 'ng xi18n ${args}'...`)
    exec(`ng xi18n ${args}`, (err) => {
      if (err) {
        console.error(`Error occured while executing ng xi18n ${args}`);
        return;
      }
      callback();
    });
    // TODO: Output the content of the child_process
  }

}