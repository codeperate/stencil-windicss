import pkg from './package.json';


export default {
	input: 'dist/index.js',

	external: [
		'windicss/lib',
		'windicss/utils/parser',
		'windicss/utils/style',
		'fs',
		'path'
	],

	output: [{
		format: 'cjs',
		file: pkg.main
	},
	{
		format: 'es',
		file: pkg.module
	}
	]
};
