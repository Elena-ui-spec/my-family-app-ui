const path = require("path");
const webpack = require("webpack");

module.exports = {
  resolve: {
    fallback: {
      assert: require.resolve("assert/"),
      crypto: require.resolve("crypto-browserify"),
      constants: require.resolve("constants-browserify"),
      buffer: require.resolve("buffer/"),
      stream: require.resolve("stream-browserify"),
      process: require.resolve("process/browser"),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
    }),
  ],
  entry: "./src/index.js", // Your main entry file
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  // Add other configurations as needed
};
