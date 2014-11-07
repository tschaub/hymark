var fs = require('fs');

var async = require('async');
var consolidate = require('consolidate');
var front = require('front-matter');
var globby = require('globby');
var nomnom = require('nomnom');

/**
 * Given a directory path and patterns, generate a list of file paths.
 * @param {string} input Path to directory.
 * @param {Array.<string>} patterns Glob patterns.
 * @param {function(Error, Array.<string>)} callback Called with any error or
 *     a list of paths.
 */
function expand(input, patterns, callback) {
  fs.stat(input, function(err, stats) {
    if (err || !stats.isDirectory()) {
      callback(new Error('Bad input directory: ' + input));
      return;
    }
    globby(patterns, {cwd: input}, callback);
  });
}

/**
 * Process all source files.
 * @param {Array.<string>} paths Paths to source files.
 * @param {Object} options Process options.
 * @param {function(Error)} callback Called with any error.
 */
function processAll(paths, options, callback) {
  async.eachLimit(paths, 50, function(src, done) {
    async.waterfall([
      processSource.bind(null, src, options),
      render
    ], done);
  }, callback);
}

/**
 * Process a source file.
 * @param {string} file Path to source file.
 * @param {Object} options Process options.
 * @param {function(Error)} callback Called with any error.
 */
function processSource(file, options, callback) {
  fs.readFile(file, function(err, data) {
    if (err) {
      callback(err);
      return;
    }
    var parts = front(String(data));
    var context = {
      path: file,
      content: parts.body
    };
    merge(context, parts.attributes, options);
    callback(null, context);
  });
}

/**
 * Render a template.
 * @param {Object} context Template context and any options for template engine.
 * @param {function(Error, string)} callback Called with any error and the
 *     rendered template.
 */
function render(context, callback) {
  consolidate[context.engine](template, context, function(err, str) {
    if (err) {
      callback(err);
      return;
    }
    var file = path.join(context.output, context.path);
    fse.outputFile(file, str, callback);
  });
}

/**
 * Read input, parse YAML front-matter, and render template.
 * @param {Object} options Options.
 * @param {function(Error, string)} callback Called with any error and the
 *     rendered template.
 */
function main(options, callback) {
  expand(options.input, options.match, function(err, paths) {
    if (err) {
      callback(err);
      return;
    }
    processAll(paths, options, callback);
  });
}

/**
 * Parse options and run.
 */
if (require.main === module) {
  var options = nomnom.options({
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
      default: ['*.md', '*.html']
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
  }).parse();

  main(options, function(err, str) {
    if (err) {
      process.stderr.write(err.message + '\n');
      process.exit(1);
    } else {
      process.stdout.write(str);
      process.exit(0);
    }
  });
}
