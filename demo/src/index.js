require('babel-register')({
	ignore: /node_modules\/(?!tamia)/,
	cache: false,
});

const {
	start,
	loadConfig,
	loadSourceFiles,
	generatePages,
	savePages,
	createMarkdownRenderer,
	createTemplateRenderer,
	helpers,
} = require('fledermaus');
const Embed = require('../templates/components/Embed').default;

start('Building site...');

const config = loadConfig('config');
const options = config.base;

const renderMarkdown = createMarkdownRenderer({
	customTags: {
		embed: Embed,
	},
});
const renderTemplate = createTemplateRenderer({
	root: options.templatesFolder,
});

const documents = loadSourceFiles(options.sourceFolder, options.sourceTypes, {
	renderers: {
		md: renderMarkdown,
	},
});

const pages = generatePages(documents, config, helpers, { jsx: renderTemplate });

savePages(pages, options.publicFolder);
