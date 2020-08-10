const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpackBase = require('./webpack.config.base.js')
const { merge } = require('webpack-merge')

module.exports = merge(webpackBase, {
    mode: 'production',
    output: {
        filename: 'public/js/[name].bundle.[contentHash].js'
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
                            hmr: false
                        }
                    },
                    'css-loader',
                    'less-loader'
                ]
            }
        ]
    },
    plugins: [
        // 生产环境下，使用[contentHash]，仅当模块内容发生改变时才改变缓存
        new MiniCssExtractPlugin({
            filename: 'public/style/[name].[contentHash].css'
        })
    ]
})