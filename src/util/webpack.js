const webpack = require('webpack');

module.exports = function(webpackConfig) {
	return new Promise((resolve, reject) => {
		return webpack(webpackConfig, (err, stats) => {
			if (err) {
				reject(err);
			}
			resolve(stats);
		});
	});
};
