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

const tamiaComponentsPath = source('node_modules/tamia/lib/components');

// CSS Modules locations
const cssModulesPaths = [
	tamiaComponentsPath,
	source('templates'),
];

module.exports = function(scripts, env, options) {
	const isDev = env !== 'production';

	// Generate entries for all scripts
	const entries = scripts.reduce((entries, script) => {
		entries[path.basename(script, '.js')] = './' + script;
		return entries;
	}, {});

	// Load user templates via Webpack to make hot reload and CSS Modules work.
	entries.styles = `${require.resolve('../src/templates-loader')}!`;

	const plugins = [
		new webpack.LoaderOptionsPlugin({
			options: {
				postcss: [
					injectStyles(source('styles/config.pcss')),
					injectStyles(require.resolve('tamia/lib/styles/core.pcss')),
					injectStyles(require.resolve('tamia/lib/styles/config.pcss')),
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
			ignoreOrder: true,
		}),
		new webpack.DefinePlugin({
			'DEBUG': JSON.stringify(isDev),
			'process.env': {
				NODE_ENV: JSON.stringify(env),
			},
		}),
	];

	if (options.compress) {
		plugins.push(
			new PurifyPlugin({
				paths: glob.sync(source('public/**/*.html')),
				purifyOptions: {
					info: options.verbose,
					rejected: options.verbose,
				},
				verbose: options.verbose,
			}),
			new OptimizeCssAssetsPlugin({
				cssProcessorOptions: {
					discardComments: {
						removeAll: true,
					},
					discardOverridden: true,
					mergeRules: true,
				},
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
						fallback: 'style-loader',
						use: [
							{
								loader: 'css-loader',
								query: {
									importLoaders: 1,
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
						fallback: 'style-loader',
						use: [
							{
								loader: 'css-loader',
								query: {
									importLoaders: 1,
								},
							},
							'postcss-loader',
						],
					}),
				},
			],
		},
	};
};
