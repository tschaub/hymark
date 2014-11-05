var fs = require('fs');

var consolidate = require('consolidate');
var front = require('front-matter');
var gather = require('gather-stream');
var nomnom = require('nomnom');

/**
 * Given a stream, parse out the YAML front-matter and call the callback with
 * the body and any parsed attributes.
 *
 * @param {stream.Readable} stream Input stream.
 * @param {function(Error, string, Object)} callback Called with any error, the
 *     stream body, and any YAML attributes.
 */
function parse(stream, callback) {
  stream.pipe(gather(function(err, data) {
    if (err) {
      callback(err);
      return;
    }
    var meta = front(String(data));
    callback(null, meta.body, meta.attributes);
  }));
}

/**
 * Render a template.
 * @param {string} engine Template engine.
 * @param {string} template Path to template.
 * @param {Object} options Template context and any options for template engine.
 * @param {function(Error, string)} callback Called with any error and the
 *     rendered template.
 */
function render(engine, template, options, callback) {
  // TODO: errors to callback
  consolidate[engine](template, options, callback);
}

/**
 * Read input, parse YAML front-matter, and render template.
 * @param {Object} options Options.
 * @param {function(Error, string)} callback Called with any error and the
 *     rendered template.
 */
function main(options, callback) {
  var stream;
  if (options.input) {
    // TODO: errors to callback
    stream = fs.createReadStream(options.input);
  } else {
    stream = process.stdin;
  }
  parse(stream, function(err, body, attributes) {
    var template = attributes.template || options.template;
    if (!template) {
      callback(new Error('No template found'));
      return;
    }
    attributes.content = body;
    render(options.engine, template, attributes, callback);
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
    input: {
      position: 0,
      required: false,
      help: 'Input source file (if not provided stdin will be used)'
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
