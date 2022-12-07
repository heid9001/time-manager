const { mode }  = require("webpack-nano/argv");
const { merge } = require('webpack-merge');
const path =      require('node:path')
const parts = require("./webpack.parts");
const {
  MiniHtmlWebpackPlugin,
} = require("mini-html-webpack-plugin");

var config = {
  mode,
  optimization: {
    minimize: false
  },
  resolve: {
    alias: {
      // Force all modules to use the same jquery version.
      'jquery': path.join(__dirname, 'node_modules/jquery/src/jquery')
    },
  },
};
config = merge(config, parts.extractCSS());
module.exports = config; // merge просто дополняет объекты и вложенные массивы новыми элементами, возвр. объект
