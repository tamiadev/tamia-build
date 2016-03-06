var path = require('path');
var merge = require('webpack-merge');
var baseConfig = require('./webpack.base.config');

module.exports = function(options) {
	var url = 'http://' + options.host + ':' + options.webpackPort;

	return merge.smart(baseConfig, {
		devtool: 'eval',
		debug: true,

		entry: [
			'webpack-dev-server/client?' + url,
		],

		output: {
			publicPath: url + '/build/',
		},

		resolve: {
			modulesDirectories: [
				path.resolve(__dirname, '../node_modules'),
				'node_modules',
			],
		},

		plugins: [
		],

		module: {
			loaders: [
			],
		},
	});
};
