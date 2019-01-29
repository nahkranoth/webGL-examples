const path = require('path');
const webpack = require('webpack');
const rawLoader = require('raw-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        utils:path.resolve(__dirname + "/src/utils/utils.js"),
        app:path.resolve(__dirname + "/src/main.js"),
        gl_matrix:path.resolve(__dirname + "/src/utils/gl-matrix.js")
    },
    output: {
        path: path.resolve(__dirname + "/build"),
        filename: "[name].js"
    },
    resolve: {
        alias: {
            'gl-matrix':path.resolve(__dirname + "/src/utils/gl-matrix.js")
        }
    },
    module: {
        rules: [
            {
                test: [ /\.vert$/, /\.frag$/, /\.obj$/ ],
                use: 'raw-loader'
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    'file-loader',
                    {
                        loader: 'image-webpack-loader'
                    },
                ]
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            _: 'underscore'
        }),
        new HtmlWebpackPlugin({template: 'src/index.html'})
    ],
    devServer: {
        contentBase: path.join(__dirname, 'build'),
        open: true,
        watchOptions: {
            ignored: ['build', 'node_modules', 'custom']
        }
    }
};