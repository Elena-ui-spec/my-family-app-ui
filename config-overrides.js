const webpack = require("webpack");

module.exports = function override(config, env) {
  // Add polyfills for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    constants: require.resolve("constants-browserify"),
    crypto: require.resolve("crypto-browserify"),
    buffer: require.resolve("buffer/"),
    stream: require.resolve("stream-browserify"),
    process: require.resolve("process/browser"),
  };

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ]);

  return config;
};
