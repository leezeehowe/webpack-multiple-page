const path = require('path')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// 运行环境
const isDev = process.env.NODE_ENV === 'dev' || 'development'

/**
 * 其实，使用webpack打包多页应用，只需要关系下面三个路径
 * 1. view：html文件的存放目录
 * 2. entry：js入口文件，一般一个view对应一个入口文件
 * 3. 打包后代码的存放目录
 * 像src下其他自定义的目录基本都不需要理会，因为它们都是开发环境下的目录结构，
 * 通过webpack打包后，原有的目录结构将不复存在，我们的源代码中的文件引用路径也全部会被webpack改写，
 * 或者说我们项目引用的所有文件都已经被webpack的模块管理系统接管。
 */
const Path = {
    // 源代码视图文件
    view: '../src/view',
    // 源代码入口文件文件夹路径
    entry: '../src/script/page',
    // 打包后代码的输出目录
    dist: '../dist'
}

/**
 * 根据定义的路径，扫描所有html页面及其入口文件，生成entry以及html-webpack-plugin实例
 */
function generateViewInsAndEntries() {
    // webpack的打包入口集合
    const Entries = {}
    // html-webpack-plugin的实例
    const ViewInstances = []
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
            minify: !isDev
        }))
        // webpack入口
        Entries[viewName] = path.resolve(__dirname, `${path.resolve(__dirname, Path.entry)}/${viewName}.js`)
    })
    return {
        Entries,
        ViewInstances
    }
}

const {Entries, ViewInstances} = generateViewInsAndEntries()

module.exports = {
    entry: Entries,
    mode: 'none',
    output: {
        path: path.resolve(__dirname, Path.dist),
        publicPath: '../',
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
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-transform-runtime']
                    }
                }
            },
            // 处理图片
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 1024 * 10,
                        name: 'public/img/[name].[contentHash].[ext]' // 转存的图片目录
                    }
                }]
            }
        ]
    },
    // 配置插件
    plugins: [
        // html-webpack-plugin实例
        ...ViewInstances,
        // 清除上一次的打包结果
        new CleanWebpackPlugin(),
    ]
}