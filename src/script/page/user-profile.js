import '../../style/user-profile.less'
import { getUserInfo } from '../service/user.service'

getUserInfo(100).then(res => {
    document.getElementsByClassName('message')[0].innerHTML = res.name
}).catch(err => {
    document.getElementsByClassName('message')[0].innerHTML = '获取用户信息失败!!'
})