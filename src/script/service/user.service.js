import { getUserInfoApi } from '../api/user.api'

export const getUserInfo = async (id) => {
    const user = await getUserInfoApi()
    console.log(user)
    return {
        name: 'user-' + id || 0
    }
}