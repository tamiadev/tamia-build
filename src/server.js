import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import browserSync from 'browser-sync';
import rewriteModule from 'http-rewrite-middleware';
import stripAnsi from 'strip-ansi';
import { printConfigs } from './util';
import makeWebpackConfig from '../config/webpack.development.config';

export default function server(options, callback) {
	let webpackConfig = makeWebpackConfig(options);

	if (options.verbose) {
		printConfigs(options, webpackConfig);
	}

	let bs = browserSync.create();
	let bundler = webpack(webpackConfig);

	let jsChanged = false;
	let cssChanged = false;

	// Reload all devices when bundle is complete
	bundler.plugin('done', stats => {
		if (stats.hasErrors() || stats.hasWarnings()) {
			return bs.sockets.emit('fullscreen:message', {
				title: 'Webpack Error',
				body: stripAnsi(stats.toString()),
				timeout: 100000,
			});
		}
		if (jsChanged) {
			// Reload the page
			bs.reload();
			jsChanged = cssChanged = false;
		}
		else if (cssChanged) {
			// Inject CSS
			bs.reload('*.css');
			cssChanged = false;
		}
	});

	let middleware = [
	];

	// Rewrites
	let rewrites = [
		{ from: '^([^\.]*\\w)$', to: '$1.html' },
	].concat(options.rewrites);
	middleware.push(rewriteModule.getMiddleware(rewrites));

	// Webpack dev server
	let devServerConfig = {
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

	let webpackUrl = `http://${options.host}:${options.port}`;

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
		online: false,
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
				match: `js/**/*.js`,
				fn(event) {
					if (event === 'change') {
						jsChanged = true;
					}
				},
			},
			{
				match: `styles/**/*.styl`,
				fn(event) {
					if (event === 'change') {
						cssChanged = true;
					}
				},
			},
		],
		rewriteRules: [
			// Replace JavaScript bundles with links to Webpack dev server
			{
				match: /<script src="(\/build\/\w+\.js)(?:\?[\da-f]+)?"><\/script>/g,
				replace: `<script src="${webpackUrl}$1"></script>`,
			},
			// Replace stylesheet with a link to Webpack dev server
			{
				match: /<link href="(\/build\/\w+\.css)(?:\?[\da-f]+)?" rel="stylesheet">/g,
				replace: `<link href="${webpackUrl}$1" rel="stylesheet">`,
			},
			// Replace inlined assets with links to Webpack dev server
			{
				match: /<script>\/\*(\w+)\*\/[\s\S]*?<\/script>/gm,
				replace: `<script src="${webpackUrl}/build/$1.js"></script>`,
			},
			{
				match: /<style>\/\*(\w+)\*\/[\s\S]*?<\/style>/gm,
				replace: `<link href="${webpackUrl}/build/$1.css" rel="stylesheet">`,
			},
		],
		middleware,
	}, callback);
}
