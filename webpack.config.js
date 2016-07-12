var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './public/javascripts/login.js',
    output: {
        path: path.resolve(__dirname, './public/build'),
        filename: 'login.bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
};