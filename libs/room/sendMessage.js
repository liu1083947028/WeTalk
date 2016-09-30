/**
 * Created by polylink on 16/9/22.
 */
const BackendFactory = require('../BackendFactory').default;
const _api=new BackendFactory();

let sendMessage =_api.sendMessage;
export default sendMessage