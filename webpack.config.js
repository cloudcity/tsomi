const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  entry: './src/tsomi.js',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'js'),
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: path.join(__dirname, ''),
    compress: true,
    port: 3000,
  },
  module: {
    rules: [
      { test: /\.js$/, loader: 'babel-loader' },
      { test: /\.css$/, loaders: ['style-loader', 'css-loader'] },
    ],
  },
}
