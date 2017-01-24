# `hymark`

[![Greenkeeper badge](https://badges.greenkeeper.io/tschaub/hymark.svg)](https://greenkeeper.io/)

Render markup using templates and YAML front-mattered content.

## Installation

The `hymark` command line utility can be installed globally with `npm` (which you'll get by installing [Node](http://nodejs.org/)).

    npm install hymark --global

Alternatively, you can install `hymark` locally as a development dependency of a Node-based project.

    npm install hymark --save-dev

## Usage

    hymark <input> <output> [options]

Hymark takes source files from an `<input>` directory and transforms them into HTML files in an `<output>` directory.  Any Markdown files found will be converted to HTML.  Other source files are parsed for [YAML front matter](#yaml-front-matter), but are not otherwise transformed.  The `<input>` directory must be a path to an existing directory.  The `<output>` directory will be created if it does not exist.

### Options

#### <a id='match'>`match`</a>

The `match` option is a list of patterns that determines which of the files in the input directory should be processed.  By default, all Markdown and HTML files are processed, and files in directories starting with `_` are ignored.

    hymark src dist --match='**/*.md' --match='**/*.html' --match='!**/_*/*'

As shown above, the CLI accepts multiple `match` options to form a list.  If you need something different than the default behavior (processing Markdown and HTML and ignoring `_` directories), you can supply your own patterns.  Below is a brief overview of the pattern syntax:

 * `*` matches any number of characters, but not `/`
 * `?` matches a single character, but not `/`
 * `**` matches any number of characters, including `/`, as long as it's the only thing in a path part
 * `{}` allows for a comma-separated list of "or" expressions
 * `!` at the beginning of a pattern will negate the match

See [`globby`](https://www.npmjs.org/package/globby#readme) and [`minimatch`](https://www.npmjs.org/package/minimatch#readme) for more detail on the pattern syntax.

#### <a id='engine'>`engine`</a>

Including an `engine` option triggers template rendering.

    hymark src dist --engine=handlebars --templates=src/_templates

The supported engines are `atpl`, `dust`, `eco`, `ect`, `ejs`, `haml`, `haml`, `handlebars`, `hogan`, `jade`, `jazz`, `jqtpl`, `JUST`, `liquor`, `lodash`, `mustache`, `QEJS`, `ractive`, `swig`, `templayed`, `toffee`, `underscore`, `walrus`, and `whiskers`.  To use a template engine, it must be installed with `npm` first.

#### <a id='templates'>`templates`</a>

The `templates` option is the path to a directory containing templates.  By default, the current directory will be searched for templates.  Typically you'll want to provide an alternate path.  Note that if you keep templates in the same directory as your source Markdown or HTML files, you'll want `hymark` to ignore your template directory when processing input files.  The default behavior is to ignore directories starting with `_` when processing input files.  So it works well if you keep templates alongside your source files in a directory named `_templates`.

For example, given the following files:

    src/
      hello.md
      world.md
      _templates/
        page.html

Running `hymark src dist --engine=handlebars --templates=src/_templates` will produce the following output files:

    dist/
      hello.html
      world.html

### <a id='yaml-front-matter'>YAML Front Matter</a>

When templates are rendered, the content from an input source file is made available as the `content` variable.  To make additional data available for template rendering, input source files can include YAML front matter.

For example, consider the following `hello.txt` input file:

    ---
    title: Hello
    template: page.html
    ---
    body content here

In parsing this input file, the data below would be made available to the template:

```json
{
  "title": "Hello",
  "content": "body content here\n"
}
```

Note that depending on the template engine that you choose, you'll want to make sure that the `content` is rendered directly, without additional HTML escaping.  An example [Handlebars](http://handlebarsjs.com/) template might look like this:

```html
<!DOCTYPE html>
<html>
  <head><title>{{ title }}</title></head>
  <body>{{{ content }}}</body>
</html>
```


[![Current Status](https://secure.travis-ci.org/tschaub/hymark.png?branch=master)](https://travis-ci.org/tschaub/hymark)
