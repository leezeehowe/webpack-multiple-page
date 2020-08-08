import '../../style/index.less'
import { getUserInfo } from '../service/user.service'

getUserInfo(10086).then(res => {
    document.getElementsByTagName('body')[0].innerHTML = res.name
}).catch(err => {
    document.getElementsByTagName('body')[0].innerHTML = err.message || '500!'
    import('../../assets/img/p.jpg').then(res => {
        const img = new Image()
        img.src = res.default
        document.getElementsByTagName("body")[0].appendChild(img)
        console.log(res.default)
    })
})