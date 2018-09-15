const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const shared = require('./webpack.shared');

const prod = {
  mode: 'production',
  output: {
    filename: 'bundle.js',
    path: path.join(path.dirname(__dirname), 'dist'),
    publicPath: '/'
  }
};
module.exports = merge(shared, prod);