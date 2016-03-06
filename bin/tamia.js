#!/usr/bin/env node
'use strict';

var program = require('commander');
var chalk = require('chalk');
var pkg = require('../package.json');

/* eslint-disable no-console */

program
	.version(pkg.version)
	.description(pkg.description)
	.option('-v, --verbose', 'print debug information')
	.option('-h, --host <host>', 'dev server host (localhost)', 'localhost')
	.option('-p, --port <port>', 'dev server port (6601)', 6601)
	.option('-w, --webpack-port <port>', 'webpack dev server port (6602)', 6602)
;

program
	.command('init')
	.description('initialize project')
	.action(function() {
		console.log('Initializing project...');
		console.log();
		require('../lib/init').default(function(err) {
			if (err) {
				console.log(err);
			}
			else {
				console.log();
				console.log('Done.');
			}
		});
	})
;


program
	.command('build')
	.description('build site')
	.action(function() {
		process.env.NODE_ENV = 'production';

		console.log('Building site...');
		console.log();
		require('../lib/build').default(program, function(err, stats) {
			if (err) {
				console.log(err);
				process.exit(1);
			}

			if (stats.hasErrors()) {
				stats.compilation.errors.forEach(function(item) {
					console.log(chalk.red(item.stack || item));
				});
				process.exit(1);
			}

			if (stats.hasWarnings()) {
				stats.compilation.warnings.forEach(function(item) {
					console.log(chalk.yellow('Warning: ', item.message));
				});
			}

			console.log();
			console.log('Done.');
		});
	})
;

program
	.command('server')
	.description('start dev server')
	.action(function() {
		process.env.NODE_ENV = 'development';

		require('../lib/server').default(program, function(err) {
			if (err) {
				console.log(err);
			}
			else {
				console.log('Listening at', chalk.underline('http://' + program.host + ':' + program.port));
				console.log();
			}
		});
	})
;

program.parse(process.argv);

if (!process.argv.slice(2).length) {
	program.outputHelp();
}
