const webpack = require('webpack');
const printConfigs = require('./util').printConfigs;
const makeWebpackConfig = require('../config/webpack.config');

module.exports = function bundle(options, callback) {
	const webpackConfig = makeWebpackConfig('production', options);

	if (options.verbose) {
		printConfigs(options, webpackConfig);
	}

	return webpack(webpackConfig, (err, stats) => {
		callback(err, stats);
	});
};
