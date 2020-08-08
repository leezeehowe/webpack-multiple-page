const path = require('path')
const webpackBase = require('./webpack.config.base.js')
const { merge } = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const WebpackManifestPlugin = require('webpack-manifest-plugin')

module.exports = merge(webpackBase, {
    devtool: 'inline-source-map',
    output: {
        // webpack-dev-server只支持[hash]，不知道为何
        filename: 'public/js/[name].bundle.[hash].js',
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            esModule: true,
                            hmr: true
                        }
                    },
                    'css-loader',
                    'less-loader'
                ]
            },
        ]
    },
    plugins: [
        // MiniCssExtractPlugin也支持HMR，只是不能使用哈希散列命名文件
        new MiniCssExtractPlugin({
            filename: 'public/style/[name].css'
        }),
        new WebpackManifestPlugin()
    ],
    devServer: {
        contentBase: path.join(__dirname, '../dist'),
        compress: true,
        port: 80,
        writeToDisk: true
    },
    optimization: {
        minimize: false
    }
})