const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const shared = require('./webpack.shared');

const rootDir = path.dirname(path.dirname(__dirname));

const prod = {
  mode: 'production',
  output: {
    filename: 'bundle.js',
    path: path.join(rootDir, 'dist'),
    publicPath: '/'
  }
};
console.log("prod:", prod);
module.exports = merge(shared, prod);