import axios from 'axios'

class HttpRequest {
    constructor(baseUrl = baseURL) {
      this.baseUrl = baseUrl
      this.queue = {}
    }
    getInsideConfig() {
      const config = {
        baseURL: this.baseUrl,
        headers: {},
        withCredentials: true
      }
      return config
    }
    destroy(url) {
      delete this.queue[url]
      if (!Object.keys(this.queue).length) {
        // Spin.hide()
      }
    }
    interceptors(instance, url) {
      // 请求拦截
      instance.interceptors.request.use(config => {
        // 添加全局的loading...
        if (!Object.keys(this.queue).length) {
          // Spin.show() // 不建议开启，因为界面不友好
        }
        this.queue[url] = true
        return config
      }, error => {
        return Promise.reject(error)
      })
      // 响应拦截
      instance.interceptors.response.use(res => {
        this.destroy(url)
        const { data, status } = res
  
        // 业务未成功，记入错误日志
        if (data.status != 200) {
          let errorData = {
            // 请求类型
            method: res.config.method,
            // 请求参数，不支持get类型
            params: res.config.data,
            // 服务器返回状态码
            status: data.status,
            // 服务器返回状态码描述
            statusText: data.msg,
            request: {
              responseURL: res.request.responseURL
            }
          }
        //   addErrorLog(errorData)
        }  
        return { data, status }
      }, error => {
        this.destroy(url)
        let errorInfo = error.response
        if (!errorInfo) {
          const { request: { statusText, status }, config } = JSON.parse(JSON.stringify(error))
          errorInfo = {
            statusText,
            status,
            request: {
              responseURL: config.url
            }
          }
        }
        // addErrorLog(errorInfo)
        return Promise.reject(error)
      })
    }
    request(options) {
      const instance = axios.create()
      options = Object.assign(this.getInsideConfig(), options)
      this.interceptors(instance, options.url)
      return instance(options)
    }
  }

export default new HttpRequest('localhost')