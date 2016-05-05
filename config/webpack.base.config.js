var path = require('path');
var glob = require('glob');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var env = process.env.NODE_ENV || 'development';

// Generate entries for all scripts
var scripts = glob.sync('js/*.js');
if (!scripts.length) {
	throw new Error('No scripts found in "js" folder.');
}
if (scripts.indexOf('js/main.js') === -1) {
	throw new Error('Main script not found: "js/main.js".');
}
var entries = scripts.reduce(function(entries, script) {
	entries[path.basename(script, '.js')] = './' + script;
	return entries;
}, {});

module.exports = {
	context: process.cwd(),

	entry: entries,

	output: {
		path: path.resolve(process.cwd(), 'public/build'),
		publicPath: '/build/',
		filename: '[name].js',
	},

	resolve: {
		extensions: ['', '.js'],
	},

	resolveLoader: {
		modulesDirectories: [
			path.resolve(__dirname, '../node_modules'),
			'node_modules',
		],
	},

	plugins: [
		new ExtractTextPlugin('styles.css'),
		new webpack.DefinePlugin({
			'DEBUG': JSON.stringify(env !== 'production'),
			'process.env': {
				NODE_ENV: JSON.stringify(env),
			},
		}),
	],

	module: {
		noParse: /\.min\.js/,

		loaders: [
			{
				test: /\.js$/,
				include: [
					path.resolve(process.cwd(), 'js'),
				],
				loader: 'babel-loader',
			},
			{
				test: /\.styl$/,
				loader: ExtractTextPlugin.extract(
					'style',
					['css', 'postcss', 'stylus']
				),
			},
		],
	},

	stylus: {
		define: {
			DEBUG: env === 'development',
			embedurl: require('stylus').url(),
		},
		import: [
			path.resolve(process.cwd(), 'styles/config.styl'),
		],
	},

	postcss: function() {
		return [
			autoprefixer({
				browsers: ['last 2 versions', 'not ie < 11', 'not ie_mob < 11'],
			}),
		];
	},
};
