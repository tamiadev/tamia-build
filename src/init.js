import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

const ok = message => console.log(chalk.green('✔'), message);
const notOk = message => console.log(chalk.red('✘'), message);

const template = filepath => path.resolve(__dirname, `../templates/${filepath}`);

const createFolder = filepath => {
	fs.ensureDirSync(filepath);
	ok(filepath);
};

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
	if (!pkg.scripts[name]) {
		pkg.scripts[name] = command;
		ok(scriptPath);
	}
	else {
		notOk(scriptPath);
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

export default function init(callback) {
	// Copy files
	copyTemplate('js/main.js');
	copyTemplate('styles/index.styl');
	copyTemplate('styles/styles.styl');
	copyTemplate('styles/config.styl');

	// Create extra folders
	createFolder('js/components');
	createFolder('styles/blocks');

	// Read package.json
	let pkg = fs.readJsonSync('package.json');

	// Create npm scripts
	pkg = addScript(pkg, 'bundle', 'tamia bundle');
	pkg = addScript(pkg, 'start', 'tamia server');

	// Save package.json
	saveJson('package.json', pkg);

	callback();
}
