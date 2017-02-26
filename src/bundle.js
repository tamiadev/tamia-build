const fs = require('fs');
const fsp = require('mz/fs');
const map = require('lodash/map');
const konan = require('konan');
const mkdirp = require('mkdirp');
const webpack = require('./util/webpack');
const transpile = require('./util/transpile');
const minify = require('./util/minify');
const printConfigs = require('./util/printConfigs');
const getScripts = require('./util/getScripts');
const makeWebpackConfig = require('../config/webpack.config');

const OUTPUT_DIR = 'public/build';
const STYLES_BUNDLE = 'styles.js';

const getOutputFileName = filename => filename.replace(/^js\//, '').replace(/^/, `${OUTPUT_DIR}/`);

async function buildWithWebpack(webpackConfig) {
	const stats = await webpack(webpackConfig);

	await fsp.unlink(getOutputFileName(STYLES_BUNDLE));

	const assets = map(stats.compilation.assets, (asset, filename) => {
		return {
			filename,
			code: asset._value || asset._cachedSource,
		};
	})
		.filter(({ filename }) => filename !== STYLES_BUNDLE)
	;

	const minified = await processScripts(assets, minify);
	await processScripts(minified, save);
	return {
		stats,
		assets: minified,
	};
}

async function buildWithBabel(scripts) {
	const transpiled = await processScripts(scripts, transpile);
	const minified = await processScripts(transpiled, minify);
	await processScripts(minified, save);
	return {
		assets: minified,
	};
}

async function processScripts(files, fn) {
	return await Promise.all(files.map(({ code, filename }) => fn(code, filename).then(newCode => ({
		code: newCode,
		filename,
	}))));
}

async function save(code, filename) {
	return await fsp.writeFile(getOutputFileName(filename), code);
}

module.exports = function bundle(options) {
	const scripts = getScripts();

	// Bundle with webpack only scripts that has require/import.
	// Compile simple script with just Babel / Uglify to avoid big webpack bootstrap in each of them, because these
	// scripts will be most probably inlined to HTML
	const { modules, inlines } = scripts.reduce((result, filename) => {
		const code = fs.readFileSync(filename, 'utf8');
		const { strings } = konan(code);
		if (strings.length === 0) {
			result.inlines.push({
				filename,
				code,
			});
		}
		else {
			result.modules.push(filename);
		}

		return result;
	}, { modules: [], inlines: [] });

	const webpackConfig = makeWebpackConfig(modules, 'production', options);

	if (options.verbose) {
		printConfigs(options, webpackConfig);
	}

	mkdirp(OUTPUT_DIR);

	return Promise.all([
		buildWithWebpack(webpackConfig),
		buildWithBabel(inlines),
	])
		.then(([webpack, babel]) => ({
			stats: webpack.stats,
			assets: [...webpack.assets, ...babel.assets],
		}))
	;
};
