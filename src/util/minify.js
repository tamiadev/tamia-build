const path = require('path');
const UglifyJS = require('uglify-js');

module.exports = function(code, filename) {
	return new Promise(resolve => {
		if (path.extname(filename) === '.js') {
			resolve(
				UglifyJS.minify(code, {
					fromString: true,
					compress: {
						screw_ie8: true,
						warnings: false,
					},
					output: {
						comments: false,
					},
				}).code
			);
		}
		else {
			resolve(code);
		}
	});
};
