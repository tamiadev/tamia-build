const glob = require('glob');

module.exports = function() {
	return glob.sync('js/*.js');
};
