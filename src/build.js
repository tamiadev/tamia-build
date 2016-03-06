import webpack from 'webpack';
import { printWebpackConfig } from './util';
import makeWebpackConfig from '../config/webpack.production.config';

export default function build(options, callback) {
	let webpackConfig = makeWebpackConfig(options);

	if (options.verbose) {
		printWebpackConfig(webpackConfig);
	}

	webpack(webpackConfig, (err, stats) => {
		callback(err, stats);
	});
}
