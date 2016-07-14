var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: {
        'public/build/login': './public/javascripts/login',
        'public/build/room': './public/javascripts/room'
    },
    output: {
        path: './',
        filename: '[name].bundle.js'
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