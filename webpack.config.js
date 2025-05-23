const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack');
const { CycloneDxWebpackPlugin } = require('@cyclonedx/webpack-plugin');

const cycloneDxWebpackPluginOptions = {
    specVersion: '1.4',
    reproducibleResults: true
}

module.exports = {
    entry: './src/index.js',
    mode: 'production',
    output: {
        filename: 'index.min.js',
        path: path.resolve(__dirname, 'dist'),
    },
    optimization: {
        usedExports: true,
        sideEffects: true,
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                        drop_debugger: true,
                    },
                    mangle: true,
                    output: {
                        comments: false
                    }
                },
                extractComments: false
            })
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        }),
        new CycloneDxWebpackPlugin(cycloneDxWebpackPluginOptions),
        new BundleAnalyzerPlugin()
    ],
    resolve: {
        fallback: {
            fs: false,
            os: require.resolve('os-browserify'),
            stream: require.resolve('stream-browserify'),
            querystring: require.resolve('querystring-es3'),
            crypto: false,
        }
    }
};