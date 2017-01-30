const prettyjson = require('prettyjson');
const chalk = require('chalk');

/* eslint-disable no-console */

function printConfig(config, title) {
	console.log();
	console.log(chalk.underline(chalk.bold(title)));
	console.log();
	console.log(prettyjson.render(config));
	console.log();
}

function printConfigs(options, webpackConfig) {
	printConfig(options, 'Options');
	printConfig(webpackConfig, 'Webpack config');
}

module.exports = {
	printConfig,
	printConfigs,
};
