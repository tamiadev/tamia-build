var path = require('path');
var merge = require('webpack-merge');
var baseConfig = require('./webpack.base.config');

module.exports = function(options) {
	var url = 'http://' + options.host + ':' + options.webpackPort;

	// Append dev client to every entry
	var devClient = ['webpack-dev-server/client?' + url];
	[].concat(baseConfig).forEach(function(wpOpt) {
		if (typeof wpOpt.entry === 'object' && !Array.isArray(wpOpt.entry)) {
			Object.keys(wpOpt.entry).forEach(function(key) {
				wpOpt.entry[key] = devClient.concat(wpOpt.entry[key]);
			});
		}
		else {
			wpOpt.entry = devClient.concat(wpOpt.entry);
		}
	});

	return merge.smart(baseConfig, {
		devtool: 'eval',
		debug: true,

		output: {
			publicPath: url + '/build/',
		},

		resolve: {
			modulesDirectories: [
				path.resolve(__dirname, '../node_modules'),
				'node_modules',
			],
		},
	});
};
