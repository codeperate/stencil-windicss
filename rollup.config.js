import pkg from './package.json';


export default {
  input: 'dist/index.js',

  external: [
    'windicss/lib',
    'windicss/utils/parser',
    'windicss/types/utils/style',
    'fs'
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