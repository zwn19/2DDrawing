const path = require("path");
const ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyPlugin = require('copy-webpack-plugin');


module.exports = {
    entry: {
        main: "./src/main.js",
    },
    output: {
        path: path.resolve(__dirname,'dist'),
        filename: "[name].js",
        chunkFilename: '[name][hash].js',
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        },{
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader',
            options: {
                limit: 10000
            }
        },/*{
            test: /\.scss$/,
            exclude: /node_modules/,
            use: ExtractTextWebpackPlugin.extract({
                fallback: "style-loader",
                use:[{// 提取的时候，继续用下面的方式处理
                    loader: 'css-loader',
                }, {
                    loader: 'postcss-loader',
                    options:{
                        plugins: (loader) =>  [
                            require('postcss-import')({ root: loader.resourcePath }),
                            require('postcss-cssnext')(),
                            require('autoprefixer')(),
                        ]}
                },{
                    loader: "sass-loader"
                }]
            })
        }*/]
    },
    devServer: {
        open: "chrome",
        port: 3000,
        contentBase: "src",
        hot: true
    },
    devtool: 'cheap-module-eval-source-map',
    plugins:[
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.html',
            chunk: "main"
        }),
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextWebpackPlugin({
            filename: "[name][hash].css"
        }),
        new CopyPlugin([{
            from: path.resolve(__dirname,'src/static'),
            to: path.resolve(__dirname,'dist/static')
        }])
    ]
}
