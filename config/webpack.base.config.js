var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');

var env = process.env.NODE_ENV || 'development';

module.exports = {
	context: process.cwd(),

	entry: './js/index.js',

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
		],
	},

	plugins: [
		new webpack.DefinePlugin({
			'DEBUG': JSON.stringify(env === 'production' ? 'true' : 'false'),
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
				loaders: [
					'style',
					'css',
					'postcss',
					'stylus',
				],
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
