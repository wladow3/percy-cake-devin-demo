/**
=========================================================================
Copyright 2019 T-Mobile, USA

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
See the LICENSE file for additional language around disclaimer of warranties.

Trademark Disclaimer: Neither the name of "T-Mobile, USA" nor the names of
its contributors may be used to endorse or promote products derived from this
software without specific prior written permission.
===========================================================================
*/

const webpack = require("webpack");

module.exports = {
  resolve: {
    alias: {
      fs: "filesystem" // see webapp/src/app/filesystem
    },
    fallback: {
      path: require.resolve("path-browserify"),
      buffer: require.resolve("buffer/"),
      process: require.resolve("process/browser"),
      stream: require.resolve("stream-browserify"),
      util: false,
      assert: false,
      crypto: false,
      os: false,
      http: false,
      https: false,
      zlib: false,
      url: false,
      net: false,
      tls: false,
      child_process: false,
      "graceful-fs": false
    },
    // Allow Webpack 5 to resolve modules that don't have proper exports field
    conditionNames: ["import", "require", "default"]
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"]
    }),
    new webpack.NormalModuleReplacementPlugin(
      /graceful-fs/,
      require.resolve("fs")
    )
  ],
  module: {
    rules: [
      {
        test: /\.svg$/,
        type: "asset/source"
      }
    ]
  },
  optimization: {
    runtimeChunk: false // This will embed webpack runtime chunk in the single bundle
  }
};
