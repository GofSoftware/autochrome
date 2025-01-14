const esbuild= require('esbuild');
const lessLoader = require('esbuild-plugin-less').lessLoader;

const args = new Set();

process.argv.forEach(function (val, index, array) {
	args.add(val);
});

(async () => {
	await esbuild.build({
		entryPoints: ['./apps/content/src/content.ts'],
		bundle: true,
		minify: args.has('--production'),
		keepNames: true,
		outfile: './dist/content/content.js',
		plugins: [lessLoader()]
	})
})();
