const path = require('path');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    mode: 'development',
    devtool: 'inline-source-map',
    optimization: {
        usedExports: true,
        sideEffects: false,
        minimize: false
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    plugins: [
        new NodePolyfillPlugin(),
        new HtmlWebpackPlugin({
            // Creating a basic HTML template instead of looking for a file
            filename: 'index.html',
            title: 'Webex WebRTC App',
            meta: {
                viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no'
            }
        })
    ],
    resolve: {
        fallback: {
            fs: false,
            os: require.resolve('os-browserify'),
            stream: require.resolve('stream-browserify'),
            querystring: require.resolve('querystring-es3'),
            crypto: false,
            path: false,
            http: false,
            https: false,
            util: false,
            buffer: require.resolve('buffer/'),
            url: false,
        },
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 3000,
        hot: true,
        historyApiFallback: true,
        open: true
    }
};