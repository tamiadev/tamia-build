// Babel preset for Node

module.exports = {
	presets: [
		// ES features necessary for user’s Node version
		[require.resolve('babel-preset-env'), {
			targets: {
				node: 'current',
			},
		}],
	],
	plugins: [
		// The following two plugins use Object.assign directly, instead of Babel's
		// extends helper. Note that this assumes `Object.assign` is available.
		// { ...todo, completed: true }
		[require.resolve('babel-plugin-transform-object-rest-spread'), {
			useBuiltIns: true,
		}],

		// Transforms JSX
		[require.resolve('babel-plugin-transform-react-jsx'), {
			useBuiltIns: true,
			pragma: 'h',
		}],

		// CSS Modules
		[require.resolve('babel-plugin-css-modules-transform'), {
			extensions: ['.pcss'],
			generateScopedName: '[name]--[local]',
		}],
	],
};
