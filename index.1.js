#!/usr/bin/env node

const program = require('commander')
const fs = require('fs');
const exec = require('child_process').exec;
const convertXml = require('xml-js');

// Helper Methods
function extractTargets(xmlJs) {
  const targets = {};
  const elements = getElement(xmlJs, 'xliff.file.body').elements;
  for (const e of elements) {
    if (e.name !== 'trans-unit') {
      continue;
    }
    const target = getElement(e, 'target');
    if (!target) continue;
    targets[e.attributes.id] = target;
  }

  return targets;
}

function getElement(obj, tag) {
  const segs = tag.split('.');
  for (const e of obj.elements) {
    if (e.name === segs[0]) {
      if (segs.length > 1) {
        segs.splice(0, 1);
        return getElement(e, segs.join('.'));
      } else {
        return e;
      }
    }
  }
  return null;
}

// Setup
program
  .version('0.0.1', '-v, --version')
  .allowUnknownOption()
  .parse(process.argv);


// Get output file from --outFile or --configuration
let file;
for (let i = 0; i < program.rawArgs.length; i++) {
  const arg = program.rawArgs[i];
  if (arg.startsWith('--outFile')) {
    if (arg.indexOf('=') != -1) {
      file = arg.split('=')[1];
    } else {
      file = program.rawArgs[i + 1];
    }
  }
}

if (!file) {
  console.error(`Couldn't get the output file, --outFile should be provided`);
  process.exit(1);
}

// Copy current file and append .old to file name
let oldXml;
let oldTargets;
let oldKeys;
process.chdir('src');
if (fs.existsSync(file)) {
  console.log(`Copying ${file} to ${file}.old...`);
  fs.copyFileSync(file, `${file}.old`);

  console.log(`Parsing ${file}...`);
  const rawXml = fs.readFileSync(file, { encoding: 'utf8' });
  oldXml = convertXml.xml2js(rawXml);
  oldTargets = extractTargets(oldXml);
  oldKeys = Object.keys(oldTargets);
  console.log(`${oldKeys.length} trans-unit extracted`);
} else {
  console.log(`The file ${file} doesn't exist`);
}
process.chdir('..');

// Executing ng xi18n
const xi18nArgs = program.rawArgs.slice(2).join(' ');

let newXml;
console.log(`Executing 'ng xi18n ${xi18nArgs}'`);
exec('ng xi18n ' + xi18nArgs, (err, stdout, stderr) => {
  if (err) {
    console.error(`Couldn't execute "ng xi18n ${xi18nArgs}"`);
    process.exit(1);
    return;
  }

  // Parse new xml file
  process.chdir('src');

  console.log(`Parsing the new ${file}...`);
  const rawXml = fs.readFileSync(file, { encoding: 'utf8' });
  newXml = convertXml.xml2js(rawXml, { trim: false });

  // Append target to similar keys
  if (oldKeys) {
    const bodyElements = getElement(newXml, 'xliff.file.body').elements;
    for (const e of bodyElements) {
      if (e.name !== 'trans-unit') {
        continue;
      }
      const key = e.attributes.id;
      const index = oldKeys.indexOf(key);
      if (index >= 0) {
        let sourceIndex = 0;
        for (let i = 0; i < e.elements.length; i++) {
          if (e.elements[i].name === 'source') {
            sourceIndex = i;
            break;
          }
        }
        e.elements.splice(sourceIndex, 0, oldTargets[key]);
        oldKeys.splice(index, 1);
      }
    }

    // give warning if there are missed keys
    if (oldKeys.length > 0) {
      console.warn(`${oldKeys.length} missed keys, for the following:`);
      for (const k of oldKeys) {
        console.log(oldTargets[k].source);
      }
    }

    // Store the new one

    //fs.unlinkSync(`${file}.old`);
    const output = convertXml.js2xml(newXml, {
      spaces: 2
    });
    fs.writeFileSync(`${file}`, output, { encoding: 'utf8' });
    process.chdir('..');

    console.log('Translation units updated successfully');
  }

});

