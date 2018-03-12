const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry: './src/tsomi.js',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle.js'
  },
  devServer: {
    contentBase: path.join(__dirname, ""),
    compress: true,
    port: 3000
  },
  plugins: [
    new ExtractTextPlugin('styles.css')
  ],
  module: {
    rules: [
      { test: '/\.js$/', loader: 'babel-loader' },
      { test: '/\.css$/', loaders: [ 'style-loader', 'css-loader' ] }
    ]
  }
}

