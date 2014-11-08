var path = require('path');

var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

var hymark = require('../../lib/index');
var fixtures = path.join(__dirname, '..', 'fixtures');

lab.experiment('defaults()', function() {

  lab.test('copies properties from one object to another', function(done) {
    var dest = {foo: 'bar'};
    var source = {bam: 'baz'};

    hymark.defaults(dest, source);
    expect(dest).to.deep.equal({foo: 'bar', bam: 'baz'});
    done();
  });

  lab.test('does not overwrite existing properties', function(done) {
    var dest = {foo: 'bar'};
    var source = {foo: 'baz'};
    expect(hymark.defaults(dest, source)).to.deep.equal({foo: 'bar'});
    done();
  });

  lab.test('accepts multiple sources', function(done) {
    var dest = {foo: 'bar'};
    var source1 = {bam: 'bam1'};
    var source2 = {bam: 'bam2', baz: 'baz2'};
    expect(hymark.defaults(dest, source1, source2)).to.deep.equal({
      foo: 'bar',
      bam: 'bam1',
      baz: 'baz2'
    });
    done();
  });

  lab.test('returns the destination object', function(done) {
    var dest = {};
    var got = hymark.defaults(dest, {});
    expect(got).to.equal(dest);
    done();
  });

});

lab.experiment('expand()', function() {

  lab.test('generates a list of file paths', function(done) {
    var input = path.join(fixtures, 'basic', 'src');
    var patterns = ['*.md'];

    hymark.expand(input, patterns, function(err, paths) {
      if (err) {
        done(err);
        return;
      }
      expect(paths).to.deep.equal(['hello.md']);
      done();
    });
  });

  lab.test('matches multiple patterns', function(done) {
    var input = path.join(fixtures, 'basic', 'src');
    var patterns = ['**/*.md', '**/*.html', '!**/_*/*'];

    hymark.expand(input, patterns, function(err, paths) {
      if (err) {
        done(err);
        return;
      }
      expect(paths.sort()).to.deep.equal(['hello.md', 'index.html']);
      done();
    });
  });

  lab.test('generates an error with bogus input directory', function(done) {
    var input = 'path/to/bogus/directory';
    var patterns = ['**/*.md'];

    hymark.expand(input, patterns, function(err, paths) {
      expect(err).to.be.an.instanceof(Error);
      expect(paths).to.be.undefined();
      done();
    });
  });

});

lab.experiment('read()', function() {

  lab.test('parses yaml and content from an input file', function(done) {
    var input = path.join(fixtures, 'basic', 'src');
    var file = 'hello.md';

    hymark.read(file, {input: input}, function(err, context) {
      if (err) {
        done(err);
        return;
      }
      expect(context.content, 'content').to.equal('\n# hello\n');
      expect(context.path, 'path').to.equal(file);
      expect(context.title, 'title').to.equal('Hello World');
      expect(context.template, 'template').to.equal('page.html');
      expect(context.input, 'input').to.equal(input);
      done();
    });
  });

  lab.test('parses yaml and content from an input file', function(done) {
    var input = path.join(fixtures, 'basic', 'src');
    var file = 'file-not-found';

    hymark.read(file, {input: input}, function(err, context) {
      expect(err).to.be.an.instanceof(Error);
      expect(context).to.be.undefined();
      done();
    });
  });

});

lab.experiment('transform()', function() {

  lab.test('transforms markdown to markup', function(done) {
    var context = {
      path: 'foo.md',
      content: '# bar\n'
    };

    hymark.transform(context, function(err, ctx) {
      expect(err).to.be.null();
      expect(ctx).to.deep.equal({
        path: 'foo.html',
        content: '<h1 id="bar">bar</h1>\n'
      });
      done();
    });
  });

  lab.test('passes markup through unchanged', function(done) {
    var context = {
      path: 'foo.html',
      content: '<blink>bar</blink>\n'
    };

    hymark.transform(context, function(err, ctx) {
      expect(err).to.be.null();
      expect(ctx).to.equal(context);
      done();
    });
  });

});

lab.experiment('render()', function() {

  lab.test('returns content when no engine provided', function(done) {
    var content = 'some content';

    hymark.render({content: content}, function(err, str, context) {
      expect(err).to.be.null();
      expect(str).to.equal(content);
      expect(context).to.deep.equal({content: content});
      done();
    });
  });

  lab.test('uses template if engine available', function(done) {
    var context = {
      engine: 'handlebars',
      title: 'handlebars test',
      content: 'some content',
      templates: path.join(fixtures, 'basic', 'src', '_templates'),
      template: 'page.html'
    };

    hymark.render(context, function(err, str, ctx) {
      expect(err).to.equal(null);
      expect(str).to.include('Basic: handlebars test');
      expect(str).to.include(ctx.content);
      done();
    });
  });

  lab.test('generates an error for unsupported engine', function(done) {
    var context = {
      engine: 'bogus engine',
      content: 'some content',
      templates: path.join(fixtures, 'basic', 'src', '_templates'),
      template: 'page.html'
    };

    hymark.render(context, function(err, str, ctx) {
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.include(context.engine);
      expect(str).to.be.undefined();
      expect(ctx).to.be.undefined();
      done();
    });
  });

});
