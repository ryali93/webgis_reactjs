const path = require('path');

module.exports = {
  devServer: {
    port: 4000
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src/')
    },
    configure: (webpackConfig) => {
      // Soporte a .mjs
      webpackConfig.resolve.extensions.push('.mjs', '.js', '.jsx');
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      });
      // Evitar errores “fully specified”
      webpackConfig.resolve.fullySpecified = false;

      return webpackConfig;
    }
  }
};