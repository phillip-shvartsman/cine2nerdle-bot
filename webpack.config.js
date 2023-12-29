const PnpWebpackPlugin = require('pnp-webpack-plugin');

module.exports = {
  entry: {
    contentApp: './src/content-script.js',
    menuApp: './src/menu_script.js',
    backgroundApp: './src/background.js'
  },
  mode: "development",
  devtool: 'cheap-module-source-map',
  resolve: {
    plugins: [ PnpWebpackPlugin, ],
  },
  resolveLoader: {
    plugins: [ PnpWebpackPlugin.moduleLoader(module), ],
  },
};