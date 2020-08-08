const env = process.env.NODE_ENV || 'dev'
console.log(process.env.NODE_ENV)
module.exports = require(`./config/webpack.config.${env}.js`)