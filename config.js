/**
 * Created by polylink on 16/9/21.
 */
const domain = "v.wetalk.net";
module.exports={
    domain:"https://"+domain,
    mediaDomain:"https://media.wetalk.net",
    GET_AVATAR:'/imavatar/',
    PARSE: {
        APP_ID: '',
        REST_API_KEY: '',
        SESSION_TOKEN_KEY: 'imToken'
    },
    connection: {
        bosh: 'https://' + domain + '/http-bind',
        hosts: {
            domain,
            focus: 'focus.' + domain,
            muc: 'conference.' + domain
        }
    },
}