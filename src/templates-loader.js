// Loader that generates a Webpack entry point to extract all CSS and enable CSS hot reload for CSS Modules

const path = require('path');
const glob = require('glob');

const requireIt = name => `require(${JSON.stringify(name)})`;

module.exports = function() {};
module.exports.pitch = function() {
	/* istanbul ignore if */
	if (this.cacheable) {
		this.cacheable();
	}

	const modules = [
		// Templates
		...glob.sync(path.resolve(process.cwd(), 'templates/*.jsx')),

		// Custom Tamia component styles
		...glob.sync(path.resolve(process.cwd(), 'templates/theme/*.pcss')),
	];

	return `
if (module.hot) {
	module.hot.accept([])
}	
${modules.map(requireIt).join('\n')}
`;
};
