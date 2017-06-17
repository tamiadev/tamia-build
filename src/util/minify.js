const path = require('path');
const butternut = require('butternut');

module.exports = function(code, filename) {
	return new Promise(resolve => {
		if (path.extname(filename) === '.js') {
			resolve(
				butternut.squash(code, {
					sourceMap: false,
				}).code
			);
		}
		else {
			resolve(code);
		}
	});
};
