#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = require('commander');
const minimist = require('minimist');
const chalk = require('chalk');
const Table = require('easy-table');
const gzipSize = require('gzip-size');
const _ = require('lodash');
const pkg = require('../package.json');

/* eslint-disable no-console */

const defaultOptions = {
	publicDir: 'public',
	rewrites: [],
	verbose: false,
};

process.on('uncaughtException', printError);

function printError(error) {
	console.log(chalk.red(error.toString()));
	console.log(error.stack);  // TODO: show only in verbose mode
}

/**
 * Merge default options, project config file (if present), global commander.js options and command options.
 *
 * @param {object} program commander.js program.
 * @param {object} command commander.js command.
 * @return {object}
 */
function aggregateOptions(program, command) {
	const argv = minimist(process.argv.slice(2));
	let options = _.merge({}, defaultOptions, program.opts(), command.opts());

	const configFile = path.resolve(process.cwd(), 'config/tamia.config.js');
	if (fs.existsSync(configFile)) {
		options = require(configFile)(options, argv);
	}

	return options;
}

function formatPercent(size, gzipped) {
	const percent = Math.round((gzipped / size) * 100);
	return isNaN(percent)
		? '100%'
		: `${percent}%`
	;
}

program
	.version(pkg.version)
	.description(pkg.description)
	.option('-v, --verbose', 'print debug information')
	.option('-p, --port <port>', 'dev server port (6601)', 6601)
;

program
	.command('bundle')
	.description('bundle assets')
	.allowUnknownOption()
	.option('-u, --no-compress', 'disable compression')
	.action(function(command) {
		process.env.NODE_ENV = 'production';

		console.log('Bundling assets...');
		console.log();
		require('../lib/bundle')(aggregateOptions(program, command))
			.then(({ stats, assets }) => {
				if (stats.hasErrors()) {
					const error = stats.compilation.errors[0];
					console.log();
					console.log(chalk.red(error.toString()));
					process.exit(1);
				}

				if (stats.hasWarnings()) {
					stats.compilation.warnings.forEach(function(item) {
						console.log();
						console.log(chalk.yellow('Warning: ', item.message));
					});
				}

				// Print time
				const time = (stats.endTime - stats.startTime) / 1000;
				console.log('Done in', time, 's');
				console.log();

				if (!command.compress) {
					return;
				}

				// Print stats
				const table = new Table();
				const sortedAssets = _.sortBy(assets, 'filename');
				sortedAssets.map(({ code = '', filename }) => {
					const name = path.basename(filename);
					const size = code.length;
					const gzipped = size > 0 ? gzipSize.sync(code) : 0;
					table.cell('File', chalk.bold(name));
					table.cell('Size, KB', size / 1024, Table.number(2));
					table.cell('Gzipped, KB', gzipped / 1024, Table.number(2));
					table.cell('Ratio', _.padStart(formatPercent(size, gzipped), 5));
					table.newRow();
				});
				console.log(table.toString());
			})
			.catch(err => {
				printError(err);
				process.exit(1);
			});
	})
;

program
	.command('server')
	.description('start dev server')
	.allowUnknownOption()
	.action(function(command) {
		process.env.NODE_ENV = 'development';

		require('../lib/server')(aggregateOptions(program, command), function(err) {
			if (err) {
				printError(err);
			}
		});
	})
;

program.parse(process.argv);

if (!process.argv.slice(2).length) {
	program.outputHelp();
}
