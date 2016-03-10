import prettyjson from 'prettyjson';
import chalk from 'chalk';

/* eslint-disable no-console */

export function printConfig(config, title) {
	console.log();
	console.log(chalk.underline(chalk.bold(title)));
	console.log();
	console.log(prettyjson.render(config));
	console.log();
}

export function printConfigs(options, webpackConfig) {
	printConfig(options, 'Options');
	printConfig(webpackConfig, 'Webpack config');
}
