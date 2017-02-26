const { transform } = require('babel-core');
const babelPreset = require('../../config/babel-preset-webpack');

module.exports = function(code, filename) {
	return new Promise(resolve => {
		code = transform(code, {
			filename,
			babelrc: false,
			sourceType: 'script',
			presets: [babelPreset('production')],
		}).code;

		// Strip strict mode declaration
		code = code.replace(/^\s*["']use strict["'];/, '');

		resolve(code);
	});
};
