import webpack from 'webpack';
import { printConfigs } from './util';
import makeWebpackConfig from '../config/webpack.production.config';

export default function bundle(options, callback) {
	let webpackConfig = makeWebpackConfig(options);

	if (options.verbose) {
		printConfigs(options, webpackConfig);
	}

	webpack(webpackConfig, (err, stats) => {
		callback(err, stats);
	});
}
