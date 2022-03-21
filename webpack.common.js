const path = require('path');

const DotenvPlugin = require('dotenv-webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require("webpack");

module.exports = {
    target: 'web',
    entry: {
        serviceWorker: './src/serviceWorker.ts',
        contentScript: './src/contentScript.ts',
        popup: './src/popup.ts',
        options: './src/options.ts',
    },
    module: {
        rules: [
            {
                test: /\.(js|ts)x?$/,
                use: ['babel-loader'],
                exclude: /node_modules/,
            },
            {
                test: /\.(scss|css)$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
          "fs": false,
          // "tls": false,
          // "net": false,
          "path": false,
          // "util": require.resolve('util/'),
          // "zlib": false,
          "http": require.resolve('stream-http'),
          // "stream": require.resolve('stream-browserify'),
          // "url": false,
          // "request": require.resolve('request'),
          "https": require.resolve('https-browserify'),
          // "stream": require.resolve("stream-browserify"),
          "buffer": require.resolve("buffer")
        },
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    plugins: [
        new DotenvPlugin(),
        new ESLintPlugin({
            extensions: ['js', 'ts'],
            overrideConfigFile: path.resolve(__dirname, '.eslintrc'),
        }),
        new MiniCssExtractPlugin({
            filename: 'styles/[name].css',
        }),
        new CopyPlugin({
            patterns: [{from: 'static'}],
        }),
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
    ],
};
