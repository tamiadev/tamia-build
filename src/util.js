import prettyjson from 'prettyjson';

/* eslint-disable no-console */

export function printWebpackConfig(webpackConfig) {
	console.log();
	console.log('Using Webpack config:');
	console.log(prettyjson.render(webpackConfig));
	console.log();
}
