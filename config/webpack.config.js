const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyPlugin = require('purifycss-webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const postCssInject = require('postcss-inject');
const browsers = require('./browsers');
const babelPreset = require('./babel-preset-webpack');

const source = file => path.resolve(process.cwd(), file);

const injectStyles = cssFilePath => postCssInject({
	cssFilePath,
	injectTo: 'fileStart',
});

// Generate entries for all scripts
const scripts = glob.sync('js/*.js');
if (!scripts.length) {
	throw new Error('No scripts found in "js" folder.');
}
if (scripts.indexOf('js/main.js') === -1) {
	throw new Error('Main script not found: "js/main.js".');
}
const entries = scripts.reduce(function(entries, script) {
	entries[path.basename(script, '.js')] = './' + script;
	return entries;
}, {});

// Load user templates via Webpack to make hot reload and CSS Modules work.
// Webpack loaders require to pass a file, so just pass the current file, it will be ignored by the loader anyway.
entries.styles = `${require.resolve('../src/templates-loader')}!${__filename}`;

const tamiaComponentsPath = path.dirname(require.resolve('tamia/src/components'));

// CSS Modules locations
const cssModulesPaths = [
	tamiaComponentsPath,
	source('templates'),
];

module.exports = function(env, options) {
	const isDev = env !== 'production';

	const plugins = [
		new webpack.LoaderOptionsPlugin({
			options: {
				postcss: [
					injectStyles(source('styles/config.pcss')),
					injectStyles(require.resolve('tamia/src/styles/core.pcss')),
					injectStyles(require.resolve('tamia/src/styles/config.pcss')),
					require('postcss-extend')(),
					require('postcss-cssnext')({
						browsers,
					}),
				],
			},
		}),
		new ExtractTextPlugin({
			filename: '[name].css',
			allChunks: true,
		}),
		new webpack.DefinePlugin({
			DEBUG: JSON.stringify(isDev),
			'process.env': {
				NODE_ENV: JSON.stringify(env),
			},
		}),
	];

	if (options.compress) {
		plugins.push(
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					screw_ie8: true,
					warnings: false,
				},
				output: {
					comments: false,
				},
			}),
			new PurifyPlugin({
				paths: glob.sync(source('public/**/*.html')),
				purifyOptions: {
					info: options.verbose,
					rejected: options.verbose,
				},
				verbose: options.verbose,
			}),
			new OptimizeCssAssetsPlugin({
				canPrint: options.verbose,
			})
		);
	}

	return {
		entry: entries,
		devtool: false,
		output: {
			path: source('public/build'),
			publicPath: '/build/',
			filename: '[name].js',
		},
		resolve: {
			extensions: ['.js', '.jsx'],
		},
		plugins,
		module: {
			noParse: /\.min\.js/,
			rules: [
				{
					test: /\.jsx?$/,
					include: [
						tamiaComponentsPath,
						source('js'),
						source('templates'),
					],
					use: [
						{
							loader: 'babel-loader',
							options: {
								babelrc: false,
								presets: [babelPreset(env)],
							},
						},
					],
				},
				{
					test: /\.pcss$/,
					include: cssModulesPaths,
					loader: ExtractTextPlugin.extract({
						fallbackLoader: 'style-loader',
						loader: [
							{
								loader: 'css-loader',
								query: {
									importLoaders: true,
									modules: true,
									localIdentName: '[name]--[local]',
								},
							},
							'postcss-loader',
						],
					}),
				},
				{
					test: /\.pcss$/,
					exclude: cssModulesPaths,
					loader: ExtractTextPlugin.extract({
						fallbackLoader: 'style-loader',
						// FIXME: Object version doesn’t work for some obscure reason
						loader: 'css-loader?importLoaders=1!postcss-loader',
						/*[
							{
								loader: 'css-loader',
								query: {
									importLoaders: true,
								},
							},
							'postcss-loader',
						],*/
					}),
				},
			],
		},
	};
};
