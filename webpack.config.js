const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin'); //clean directories before build
const isDevMode = 'production' !== process.env.NODE_ENV;

module.exports = {
    entry: { main: './src/main.js' },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[chunkhash].js'
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {   
                test: /\.css$/i, 
                use: ['style-loader', 'css-loader']
            },
            {   
                test: /\.handlebars$/, 
                loader: "handlebars-loader" 
            },
            {
                test: /\.scss$/,
                use: ['style-loader','css-loader', 'postcss-loader', 'sass-loader']
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin('dist', {}),  //Cleans dist directory before build
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "style.[contenthash].css"
        }),
        new HtmlWebpackPlugin({
            title: 'My Boilerplate',
            template: './src/index.handlebars',
            minify: !isDevMode && {
                html5: true,
                collapseWhitespace: true,
                caseSensitive: true,
                removeComments: true,
                removeEmptyElements: true
            },
          }),
        
        new WebpackMd5Hash()
    
    ]
};