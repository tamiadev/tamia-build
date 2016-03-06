var webpack = require('webpack');
var merge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var baseConfig = require('./webpack.base.config');

module.exports = function() {
	return merge.smart(baseConfig, {
		devtool: false,

		plugins: [
			//new webpack.optimize.UglifyJsPlugin({
			//	sourceMap: false,
			//	compress: {
			//		warnings: false,
			//	},
			//	output: {
			//		comments: false,
			//	},
			//}),
			new ExtractTextPlugin('styles.css'),
		],

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
