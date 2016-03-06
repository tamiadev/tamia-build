var webpack = require('webpack');
var merge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var baseConfig = require('./webpack.base.config');

module.exports = function(options) {
	var plugins = [
		new ExtractTextPlugin('styles.css'),
	];

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

		plugins: plugins,

		module: {
			loaders: [
				{
					test: /\.styl$/,
					loader: ExtractTextPlugin.extract(
						'style',
						['css', 'postcss', 'stylus']
					),
				},
			],
		},
	});
};
