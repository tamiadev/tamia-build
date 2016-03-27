var path = require('path');
var merge = require('webpack-merge');
var baseConfig = require('./webpack.base.config');

module.exports = function() {
	return merge.smart(baseConfig, {
		devtool: 'eval',
		debug: true,

		output: {
			publicPath: '/build/',
		},

		resolve: {
			modulesDirectories: [
				path.resolve(__dirname, '../node_modules'),
				'node_modules',
			],
		},
	});
};
