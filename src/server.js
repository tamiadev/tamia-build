const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const browserSync = require('browser-sync');
const modRewrite = require('connect-modrewrite');
const stripAnsi = require('strip-ansi');
const getScripts = require('./util/getScripts');
const printConfigs = require('./util/printConfigs');
const makeWebpackConfig = require('../config/webpack.config');

module.exports = function server(options, callback) {
	const scripts = getScripts();
	const webpackConfig = makeWebpackConfig(scripts, 'development', options);

	if (options.verbose) {
		printConfigs(options, webpackConfig);
	}

	const bs = browserSync.create();
	const bundler = webpack(webpackConfig);

	let jsChanged = false;
	let cssChanged = false;

	// Reload all devices when bundle is complete
	bundler.plugin('done', stats => {
		if (stats.hasErrors() || stats.hasWarnings()) {
			bs.sockets.emit('fullscreen:message', {
				title: 'Webpack Error',
				body: stripAnsi(stats.toString()),
				timeout: 100000,
			});
			return;
		}
		if (jsChanged) {
			// Reload the page
			bs.reload();
			jsChanged = false;
			cssChanged = false;
		}
		else if (cssChanged) {
			// Inject CSS
			bs.reload('*.css');
			cssChanged = false;
		}
	});

	const middleware = [
	];

	// Rewrites
	const rewrites = options.rewrites.concat([
		'^([^.]*\\w)$ $1.html',
	]);

	middleware.push(modRewrite(rewrites));

	// Webpack dev server
	const devServerConfig = {
		publicPath: webpackConfig.output.publicPath,
	};
	if (options.verbose) {
		devServerConfig.stats = {
			colors: true,
			chunks: false,
			chunkModules: false,
		};
	}
	else {
		devServerConfig.noInfo = true;
	}
	middleware.push(webpackDevMiddleware(bundler, devServerConfig));

	bs.init({
		server: {
			baseDir: options.publicDir,
			directory: false,
			index: 'index.html',
			serveStaticOptions: {
				redirect: false,
			},
		},
		port: options.port,
		open: false,
		reloadOnRestart: true,
		minify: !options.verbose,
		notify: options.verbose,
		logFileChanges: options.verbose,
		plugins: [
			'bs-fullscreen-message',
		],
		files: [
			`${options.publicDir}/**/*.*`,
			{
				match: 'js/**/*.js',
				fn(event) {
					if (event === 'change') {
						jsChanged = true;
					}
				},
			},
			{
				match: '{styles,templates}/**/*.pcss',
				fn(event) {
					if (event === 'change') {
						cssChanged = true;
					}
				},
			},
		],
		rewriteRules: [
			// Replace inlined assets with Webpack bundles
			{
				match: /<script>\/\*([^*]+)\*\/[\s\S]*?<\/script>/gm,
				replace: '<!-- Inlined in production --><script src="/build/$1.js"></script>',
			},
			{
				match: /<style>\/\*([^*]+)\*\/[\s\S]*?<\/style>/gm,
				replace: '<!-- Inlined in production --><link href="/build/$1.css" rel="stylesheet">',
			},
		],
		middleware,
	}, callback);

	return bundler;
};
