// Based on create-react-app

const browsers = require('./browsers');

module.exports = function(env) {
	const plugins = [
		// class { handleClick = () => { } }
		require.resolve('babel-plugin-transform-class-properties'),

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
	];

	if (env === 'production') {
		return {
			presets: [
				// Latest stable ECMAScript features
				// Disable ES6 Modules transpilation since Webpack supports them natively
				[require.resolve('babel-preset-latest'), {
					modules: false,
				}],
			],
			plugins,
		};
	}
	return {
		presets: [
			// ES features necessary for user’s browsers
			// Disable ES6 Modules transpilation since Webpack supports them natively
			[require.resolve('babel-preset-env'), {
				targets: {
					browsers,
				},
				modules: false,
			}],
		],
		plugins,
	};
};
