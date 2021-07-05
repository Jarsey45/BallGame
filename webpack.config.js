module.exports = {
  entry: './src/main.ts',
  module: {
    // Use `ts-loader` on any file that ends in '.ts'
    rules: [{
      test: /\.ts$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    }, ],
  },
  // Bundle '.ts' files as well as '.js' files.
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'build.js',
    path: `${process.cwd()}/build`,
  },
  watch: true
};