#!/usr/bin/env node

var nomnom = require('nomnom');

var main = require('./index');

function options(argv) {
  var spec = {
    engine: {
      abbr: 'e',
      help: 'Template engine',
      choices: [
        'atpl', 'dust', 'eco', 'ect', 'ejs', 'haml', 'haml', 'handlebars',
        'hogan', 'jade', 'jazz', 'jqtpl', 'JUST', 'liquor', 'lodash',
        'mustache', 'QEJS', 'ractive', 'swig', 'templayed', 'toffee',
        'underscore', 'walrus', 'whiskers'
      ]
    },
    match: {
      abbr: 'm',
      help: 'Pattern(s) to match',
      list: true,
      default: ['**/*.md', '**/*.html', '!**/_*/*']
    },
    templates: {
      abbr: 't',
      help: 'Path to template directory',
      default: process.cwd()
    },
    input: {
      position: 0,
      required: true,
      help: 'Input directory'
    },
    output: {
      position: 1,
      required: true,
      help: 'Output directory'
    }
  };

  return nomnom.script('hymark').options(spec).parse(argv);
}

/**
 * Parse options and run.
 */
if (require.main === module) {
  main(options(process.argv.slice(2)), function(err) {
    if (err) {
      process.stderr.write(err.message + '\n');
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
}

exports.options = options;
