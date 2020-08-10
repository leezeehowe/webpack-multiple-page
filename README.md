## webpack构建多页应用

### module & chunk & bundle

module即模块。比如在vue项目中，路由、store、每一个vue组件都是一个模块，在node项目中，一个dao、service层会是一个模块，模块内部维护自身的状态，通过export对外提供服务。模块化提供坚实的抽象和清晰的边界，可以说，我们编写的程序就是由模块组成的。

chunk是webpack的术语，chunk是一组module，webpack以chunk为单位对我们的代码进行处理，比如说loader通过正则表达式从chunk中可以匹配到**一组**它想要处理的module（通过import时指定的路径）

bundle由**≥1个的chunk中的一组的module组成**。一个chunk一般来说会产生一个bundle，但是如果项目很大，一个chunk中依赖了许多module，打包处理的bundle会很大，浏览器下载这些bundle时就会很慢，像单页应用只有一个entry，如果不做任何的优化配置，最终可能会打包出来一个兆级大小单位的bundle，这也正是单页应用首次加载缓慢的原因。所以webpack提供了一个[SplitChunksPlugin](#)对chunk进行拆分。

所以chunk和bundle其实都代表了一组module，chunk中的module是我们编写的**源代码**和第三方库，bundle中的module是通过webpack编译后的代码，只是一组module在不同阶段的称呼。

理解了module、chunk、bundle三者的关系对我们掌握webpack是非常有帮助的，如果不能很好的认识三者的关系，有些问题会云里雾里，比如说：

```javascript
// index.js
import '../../style/index.less'
console.log("index.js")
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <!-- Hello World! -->
</body>
</html>
```

```js
// webpack.config.js
entry: {
    index: 'script/page/index.js'
}
plugins: [
    new HtmlWebpackPlugin({
    filename: `view/index.html`,
    template: path.resolve(__dirname, `${viewPath}/${viewName}.html`),
    chunks: ['index']
})
    new MiniCssExtractPlugin({
        filename: 'public/style/[name].bundle.css'
    }),
]
```

```html
<!-- htmlwebpackplugin插件生成的index.html文件 -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
<link href="../public/style/index.bundle.css" rel="stylesheet"></head>
<body>
<script src="../public/js/index.bundle.js"></script></body>
</html>
```

MiniCssExtractPlugin的配置项中除了指定生成的css文件的文件名外就没有别的配置，为什么htmlwebpackplugin生成的index.html文件中会自动引入了index.bundle.css这个文件？原因在于index.bundle.js以及index.bundle.css这两个bundle是属于名为index的这个chunk的，而我们在htmlwebpackplugin的配置中，通过chunks配置项指定了要引入一个名为index的chunk，这个chunk最终经由webpack打包出来了两个bundle。

![](https://lee-img-bed.oss-cn-shenzhen.aliyuncs.com/Snipaste_2020-08-09_14-05-05.png)

### 项目结构

```js
// webpack的配置文件
├─config
// 打包后的代码目录
├─dist
// 源代码目录
└─src
	// 图标、字体、图片等资源文件目录
    ├─assets
    │  ├─icon
    │  └─img
    // 第三方库、自己封装的库、util等等
    ├─lib
    // 脚本文件，e.g. ts或者js
    ├─script
    │  ├─api	 // api层，统一存放项目中所有的api请求
    │  ├─page	 // page层，在多页应用中，相当于入口层
    │  └─service // service层，抽象出page层
    // 样式文件 e.g. css或者less
    ├─style
    // 视图，e.g. html或者vue
    └─view
```

建议api层以及service层中以面向对象的思想进一步划分，比如api层中的user.api.js中是关于用户这个实体类的所有API请求，service层中的user.service.js中是关于用户的所有操作，service层调用api层，page层调用service层。

![](https://lee-img-bed.oss-cn-shenzhen.aliyuncs.com/Snipaste_2020-08-10_08-57-26.png)

page层负责页面的渲染、参数的收集，service层负责参数的校验、数据的组装以及具体的业务逻辑，api层负责从服务器获取数据。这样的设计其实跟服务器端的controller、service、dao层划分是类似的，都是为了“高内聚、低耦合”。所以说，语言只是具体实现的工具，核心是思想。

### entry

webpack的打包入口，目前来说必须是一个JS文件，在entry中，我们以任意模块规范引入项目中的asset（一切资源文件包括js、css、html、json等等都可以算是asset）并且使用，webpack并不关心你用的是什么模块规范的具体实现（e.g. CommonJS、RequireJS），它只需要关心模块的引入路径，通过引入路径，可以分析出模块的文件类型，非JS文件就去寻找对应的loader，所以loader的作用就是加载模块、返回webpack能处理的JS代码并且加入到其所属chunk中（当然，loader也可以emit文件），因此，不是在entry中引入的文件，都不会纳入webpack的模块管理系统中，比如说，一个html文件中，通过<img><link><script>标签引入的图片、样式、JS文件等等，并没有通过webpack进行打包，如果你用htmlwebpackplugin复制了该html文件，最终这些资源文件就会404，因为引用路径是开发环境下的路径，甚至htmlwebpackplugin也可能并没有把该html文件加入到webpack的打包过程中，仅仅只是跟webpack说一句"你打包编译完成之后需要把这几个chunk的模块给我"。所以，使用webpack构建多页应用的话，需要改变传统的多页应用开发模式，不要直接在html文件中使用<img><link><script>引用asset，而要在entry能够遍历到的JS module中通过JS的模块规范引入这些asset，看似变的麻烦了，但其实资源的引入变得更加可控了，还可以实现按需加载和延迟加载。



### optimization-优化

#### 缓存

##### [hash] & [chunkHash] & [contentHash]

这三个是webpack提供的用于改变输出的资源文件名的占位符。

- [hash]和webpack的每一次打包构建有关，无论该module的内容是否有变化，只要重新使用webpack打包，[hash]都会变。
- [chunkHash]和该moddule的所属chunk有关，无论该module本身的内容有无变化，只要其所属chunk的任一module发生变化，[chunkHash]都会变。
- [contentHash]只和module本身的内容是否变化有关，只有当module本身的内容发生变化，[contentHash]才会发生变化，所以用该占位符可以实现最大程度的文件缓存。

##### mini-css-extract-plugin

style-loader会把css通过style标签插入html文档中，这个插件可以把css单独抽出一个文件并且通过link标签插入html文档中，通过该插件以及配合[contentHash]可以实现长效缓存，仅当css内容改变时浏览器才会重新请求这份样式。

配置也很简单

```js
module: {
  rules: [
      {
          test: /\.less$/,
          use: [
              {
                  loader: MiniCssExtractPlugin.loader,
                  options: {
                      /**
                       * return `${
                          esModule ? 'export default' : 'module.exports ='
                          } ${JSON.stringify(encodedData)}`;
                       */
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
      // 指定css文件的输出路径
      filename: 'public/style/[name].css'
  }),
],
```



#### Code Splitting/chunk splitting

代码分割，因为webpack是以chunk为单位管理我们的项目代码的，所以code splitting也即chunk splitting，也正是它打破了chunk与bundle之间的一对一关系。

```js
module.exports = {
  //...这是webpack的chunk splitting默认配置
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      minRemainingSize: 0,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      automaticNameDelimiter: '~',
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```



