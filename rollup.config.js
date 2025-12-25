import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

export default {
  input: 'src/index.jsx',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'auto'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm'
    }
  ],
  external: ['react', 'react-dom'],
  plugins: [
    resolve({ extensions: ['.js', '.jsx'] }),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env', '@babel/preset-react'],
      extensions: ['.js', '.jsx']
    })
  ]
};
