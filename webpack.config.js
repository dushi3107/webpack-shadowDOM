// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const env = process.env.NODE_ENV == 'production' ? 'production' : 'development';

const config = {
    entry: ['./src/js/main.js'],
    mode: env,
    output: {
        filename: 'itembank-search.bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        open: true,
        compress: true,
        static: {
            directory: path.join(__dirname, 'dist')
        },
        watchFiles: {
            paths: ['src/**/*.*'],
            options: {
                useFsEvents: true
            }
        },
        historyApiFallback: true,
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/i,
                loader: 'babel-loader',
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                    },
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
            new CssMinimizerPlugin(),
        ]
    },
    plugins: [
        new Dotenv({
            systemvars: true,
            path: `.env.${env}`,
        }),
        new HtmlWebpackPlugin({
            template: './src/pages/index.html',
        }),
        new MiniCssExtractPlugin({
            filename: '[name].scss',
        }),
    ],
};

module.exports = () => {
    return config;
};
