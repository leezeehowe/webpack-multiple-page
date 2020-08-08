const path = require('path')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const Path = {
    // 源代码视图文件
    view: '../src/view',
    // 源代码入口文件文件夹路径
    entry: '../src/script/page',
    // 打包后输出的目录
    dist: '../dist'
}
// 运行环境
const isDev = process.env.NODE_ENV === 'dev' || 'development'

// webpack的打包入口集合
const Entries = {}
// html-webpack-plugin的实例
const ViewInstances = []

function generateViewInsAndEntries() {
    // 存放视图文件(e.g. html)的文件夹路径
    const viewPath = path.join(__dirname, Path.view)
    // 所有视图文件
    const viewDir = fs.readdirSync(viewPath)
    viewDir.forEach(viewFile => {
        // 视图文件名，不带后缀(e.g. index.html -> index)
        const viewName = viewFile.split(".")[0]
        ViewInstances.push(new HtmlWebpackPlugin({
            filename: `view/${viewName}.html`,
            template: path.resolve(__dirname, `${viewPath}/${viewName}.html`),
            // 配置生成的html引入的公共代码块 引入顺序从右至左  
            chunks: [viewName],
            favicon: '',
            minify: !isDev
        }))
        // webpack入口
        Entries[viewName] = path.resolve(__dirname, `${path.resolve(__dirname, Path.entry)}/${viewName}.js`)
    })
}

generateViewInsAndEntries()

module.exports = {
    entry: Entries,
    mode: 'none',
    output: {
        path: path.resolve(__dirname, Path.dist),
        publicPath: '../'
    },
    resolve: {
        extensions: ['.js']
    },
    module: {
        rules: [
            // 使用babel处理js文件
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            // 处理图片
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        name: 'public/img/[name].[contentHash].[ext]' // 转存的图片目录
                    }
                }]
            },
            // 处理字体
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: ['url-loader']
            }
        ]
    },
    // 配置插件
    plugins: [
        // 分离tml-webpack-plugin实例数组、引入jq
        ...ViewInstances,
        new CleanWebpackPlugin(),
    ]
}