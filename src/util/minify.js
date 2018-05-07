const path = require('path');
const UglifyJS = require('uglify-js');

module.exports = function(code, filename) {
	return new Promise((resolve, reject) => {
		if (path.extname(filename) === '.js') {
			const result = UglifyJS.minify(code, {
				ie8: false,
			});
			if (result.error) {
				reject(result.error);
			}

			resolve(result.code);
		}
		else {
			resolve(code);
		}
	});
};
