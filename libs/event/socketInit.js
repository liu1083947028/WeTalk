/**
 * Created by polylink on 16/9/22.
 */
window.navigator.userAgent = 'react-native';
var io = require('socket.io-client/socket.io');
import pubMessages from './pubMessages';
import {domain} from '../../config'
let initSocket =()=> {
    console.log('----initSocket----')
    PubSub.subscribe('LoginSuccess',(type,data)=>{
        console.log('LoginSuccess subscribe===',data)
        if(window.socket){
            console.log('----window.socket.destroy----')
            window.socket.destroy();
        }
        window.socket = io(domain,{query: 'token='+data.imtoken+'&mobileSocket=1',jsonp: false,transports: ['websocket']});
        let onMessage=(mdata)=>{
            console.log('onMessage ROOMMESSAGE====',mdata)
            pubMessages(mdata)
        }
        window.socket.removeListener("ROOMMESSAGE",onMessage);
        window.socket.on('ROOMMESSAGE', onMessage);
        window.socket.on('UPDATEUSERINFO', (userBean) => {
            PubSub.publish('updateUserInfo',userBean)
        });

        //console.warn('en-US DeviceInfo.getDeviceLocale===',DeviceInfo.getDeviceLocale());
        //console.warn('en-US DeviceInfo._lan===',_lan);
        //let _dev={
        //    "uniqueID":DeviceInfo.getUniqueID(),
        //    "deviceId":DeviceInfo.getDeviceId(),
        //    "deviceName":DeviceInfo.getDeviceName(),
        //    "model":DeviceInfo.getModel(),
        //    "dLocale":_lan
        //}
        //self.props.deviceOnline(_dev);

    });
}
export default initSocket;