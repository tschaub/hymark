var fs = require('fs');
var path = require('path');

var async = require('async');
var consolidate = require('consolidate');
var front = require('front-matter');
var globby = require('globby');
var nomnom = require('nomnom');

/**
 * Apply defaults.
 * @param {Object} object Destination object.
 * @param {Object} source1 First source.
 * @param {Object} source2 Second source.
 * @return {Object} The destination object.
 */
function defaults(object, source1, source2) {
  [source1, source2].forEach(function(source) {
    for (var key in source) {
      if (!(key in object)) {
        object[key] = source[key];
      }
    }
  });
  return object;
}

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
 * Process a source file.
 * @param {string} file Relative path to source file (from input directory).
 * @param {Object} options Process options.
 * @param {function(Error)} callback Called with any error.
 */
function read(file, options, callback) {
  fs.readFile(path.join(options.input, file), function(err, data) {
    if (err) {
      callback(err);
      return;
    }
    var parts = front(String(data));
    var context = {
      path: file,
      content: parts.body
    };
    callback(null, defaults(context, parts.attributes, options));
  });
}

/**
 * Render output.
 * @param {Object} context Context for rendering.
 * @param {function(Error, string, Object)} callback Called with any error, the
 *     rendered output, and the context object.
 */
function render(context, callback) {
  var engine = context.engine;
  if (engine) {
    if (!(engine in consolidate)) {
      callback(new Error('Unsupported engine: ' + engine));
      return;
    }
    var template = path.join(context.templates, context.template);
    consolidate[engine](template, context, function(err, str) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, str, context);
    });
  } else {
    setImmediate(function() {
      callback(null, context.content, context);
    });
  }
}

/**
 * Write output file.
 * @param {string} str File content.
 * @param {Object} context Context for rendering.
 * @param {function(Error)} callback Called with any error.
 */
function write(str, context, callback) {
  var file = path.join(context.output, context.path);
  fse.outputFile(file, str, callback);
}

/**
 * Process all source files.
 * @param {Array.<string>} paths Paths to source files.
 * @param {Object} options Process options.
 * @param {function(Error)} callback Called with any error.
 */
function operate(paths, options, callback) {
  async.eachLimit(paths, 64, function(file, done) {
    async.waterfall([
      read.bind(null, file, options),
      render,
      write
    ], done);
  }, callback);
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
    operate(paths, options, callback);
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

/**
 * Assign main function to module exports.
 */
var exports = module.exports = main;

/**
 * Additional exports.
 */
exports.defaults = defaults;
exports.expand = expand;
exports.read = read;
exports.render = render;
exports.write = write;
exports.operate = operate;
