var webpack = require('webpack');
var merge = require('webpack-merge');
var baseConfig = require('./webpack.base.config');

module.exports = function(options) {
	var plugins = [];

	if (options.compress) {
		plugins.push(new webpack.optimize.UglifyJsPlugin({
			sourceMap: false,
			compress: {
				warnings: false,
			},
			output: {
				comments: false,
			},
		}));
	}

	return merge.smart(baseConfig, {
		devtool: false,
		debug: false,
		plugins: plugins,
	});
};
