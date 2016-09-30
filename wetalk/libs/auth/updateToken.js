/**
 * Created by polylink on 16/9/21.
 * 根据用户名/密码获取登录信息和token
 */
const BackendFactory = require('../BackendFactory').default;
const AppAuthToken = require('../AppAuthToken').default;
const _api=new BackendFactory();
const _at=new AppAuthToken();
//let wetalkLogin=_api.login
let updateToken =()=>{
   return _api.autoLogin().then(
        (json)=>{
            console.log('json=autoLogin====',json)
            if(json.res>0){
                _at.storeSessionToken(json.jwt)
                PubSub.publish('LoginSuccess',{"imtoken":json.jwt,"uid":json.user._id})
            }
            return json
        }
    )
}
export default updateToken