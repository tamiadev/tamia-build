# Tâmia Build

[![Build Status](https://travis-ci.org/tamiadev/tamia-build.png)](https://travis-ci.org/tamiadev/tamia-build)

Webpack builder and dev server for [Tâmia](http://tamiadev.github.io/tamia/).

## Installation

```bash
$ npm install --save-dev tamia-build
./node_modules/.bin/tamia init
```

## Usage

You will have two npm scripts:

* `npm start` to start a dev server.
* `npm run bundle` to make a production build of JavaScript and CSS.

### Configuration

Create a `config/tamia.config.js` file.

Available options:

* `rewrites`: list of URL rewrites for dev server.

Config example:

```javascript
module.exports = function(options) {
  var argv = require('minimist')(process.argv.slice(2));
  if (argv.lang) {
    // Redirect HTML pages to local folder
    options.rewrites = [
      { from: '^([^\.]*)$', to: '/' + argv.lang + '$1' },
    ];
  }

  return options;
};
```

## Troubleshooting

Run builder in verbose mode:

```bash
$ npm start -- --verbose
```

---

## License

The MIT License, see the included [License.md](./License.md) file.
