import url from 'url';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import express from 'express';
import staticTransform from 'connect-static-transform';
import { printWebpackConfig } from './util';
import makeWebpackConfig from '../config/webpack.development.config';

/* eslint-disable no-console */

export default function server(options, callback) {
	let webpackConfig = makeWebpackConfig(options);

	if (options.verbose) {
		printWebpackConfig(webpackConfig);
	}

	let app = express();

	// Inject Webpack bundle
	app.use(staticTransform({
		root: 'public',

		// The middleware expects a regex, but we can use a duck object to match /yo/index.html as well as /yo/foo?a=1
		match: {
			test(str) {
				const { pathname } = url.parse(str);
				const basename = pathname.split('/').pop();
				return basename === '' || basename.substr(-5) === '.html';
			},
		},

		// Append index.html to a path if needed
		normalize(requestPath) {
			requestPath = requestPath.split('?')[0];
			if (requestPath.substr(-1) === '/') {
				requestPath += 'index.html';
			}
			return requestPath;
		},

		transform: (path, html, send) => {
			// Remove stylesheet link, CSS will be injected by Webpack bundle
			html = html.replace(
				/<link href="\/build\/styles\.css(?:\?\d+)?" rel="stylesheet">/,
				'<!-- styles.css was removed by Tâmia dev server -->'
			);

			// Load Webpack main bundle from Webpack dev server
			let webpackUrl = `http://${options.host}:${options.webpackPort}`;
			if (/<script src="\/build\/main\.js/.test(html)) {
				html = html.replace(
					/<script src="\/build\/main\.js(?:\?\d+)?"><\/script>/,
					''
				);
			}
			html = html.replace(
				'</body>',
				`<script src="${webpackUrl}/build/main.js"></script>\n</body>`
			);

			// Replace other bundles with links to Webpack dev server
			html = html.replace(
				/<script src="\/build\/(\w+)\.js(?:\?\d+)?"><\/script>/g,
				`<script src="${webpackUrl}/build/$1.js"></script>`
			);

			// Replace inlined assets with links to Webpack dev server
			html = html.replace(
				/<script>\/\*(\w+)\*\/.*<\/script>/g,
				`<script src="${webpackUrl}/build/$1.js"></script>`
			);
			html = html.replace(
				/<style>\/\*(\w+)\*\/.*<\/style>/g,
				`<link href="${webpackUrl}/build/$1.css" rel="stylesheet">`
			);

			send(html, { 'Content-Type': 'text/html; charset=utf-8' });
		},
	}));

	// Serve other static assets
	app.use(express.static('public'));

	app.listen(options.port, options.host, callback);

	// Webpack dev server
	let devServerConfig = {
		inline: true,
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
	new WebpackDevServer(webpack(webpackConfig), devServerConfig).listen(options.webpackPort);
}
