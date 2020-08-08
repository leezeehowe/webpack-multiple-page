import axios from '../../lib/http'

export const getUserInfoApi = () => {
    return axios.request({
        url: '/user/info',
        method: 'get'
    })
}