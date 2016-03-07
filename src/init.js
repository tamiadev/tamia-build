import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ncp from 'copy-paste';

/* eslint-disable no-console */

const ok = message => console.log(chalk.green('✔'), message);
const notOk = message => console.log(chalk.red('✘'), message);

const template = filepath => path.resolve(__dirname, `../templates/${filepath}`);

const copyTemplate = filepath => {
	try {
		fs.copySync(template(filepath), filepath, { clobber: false });
		ok(filepath);
	}
	catch (e) {
		notOk(filepath);
	}
};

const addScript = (pkg, name, command) => {
	let scriptPath = `package.json/${name}`;
	let currentCommand = pkg.scripts[name];
	if (!currentCommand || currentCommand === command) {
		pkg.scripts[name] = command;
		ok(scriptPath);
	}
	else {
		notOk(`${scriptPath} — manual update required:`);
		console.log(chalk.red(`- ${currentCommand}`));
		console.log(chalk.green(`+ ${command}`));
		console.log();
	}
	return pkg;
};

const saveJson = (filepath, content) => {
	try {
		fs.writeJsonSync(filepath, content);
		ok(filepath);
	}
	catch (e) {
		notOk(filepath);
	}
};

const requireNpmPackages = (pkg, packages) => {
	let devDeps = pkg.devDependencies;
	if (devDeps) {
		packages = packages.filter(name => !devDeps[name.replace(/@.*$/, '')]);
	}

	if (!packages.length) {
		return;
	}

	let command = 'npm install --save-dev ' + packages.join(' ');

	ncp.copy(command);

	console.log();
	console.log('Install these npm modules (the command has been copied to the clipboard):');
	console.log(chalk.white(command));
};

export default function init(callback) {
	// Copy files
	copyTemplate('js/main.js');
	copyTemplate('styles/index.styl');
	copyTemplate('styles/styles.styl');
	copyTemplate('styles/config.styl');
	copyTemplate('.babelrc');
	copyTemplate('.eslintrc');
	copyTemplate('.editorconfig');

	// Read package.json
	let pkg = fs.readJsonSync('package.json');

	// Create npm scripts
	pkg = addScript(pkg, 'bundle', 'tamia bundle');
	pkg = addScript(pkg, 'start', 'tamia server');
	pkg = addScript(pkg, 'test', 'npm run lint');
	pkg = addScript(pkg, 'lint', 'eslint js');

	// Save package.json
	saveJson('package.json', pkg);

	// Check required npm packages
	requireNpmPackages(pkg, [
		'eslint@1.10.3',
		'babel-eslint',
		'eslint-config-tamia',
		'babel-preset-tamia',
	]);

	callback();
}
