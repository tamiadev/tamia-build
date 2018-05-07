const path = require('path');
const UglifyJS = require('uglify-js');

module.exports = function(code, filename) {
	return new Promise(resolve => {
		if (path.extname(filename) === '.js') {
			resolve(
				UglifyJS.minify(code, {
					ie8: false,
					ecma: 5,
				}).code
			);
		}
		else {
			resolve(code);
		}
	});
};
