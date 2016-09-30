/**
 * Created by Gavin on 2016/3/10.
 * Client消息转发中心
 */
module.exports = (data)=> {
    if (data.type == 1) {
        PubSub.publish('roomAdd', data);
    } else if (data.type == 2) {
        console.log('messageAdd====',data)
        PubSub.publish('messageAdd', data);
        handleMsg(data);
    } else if(data.type == 5){
        //悬浮窗口
        PubSub.publish('openNotisfication', data);
    } else if(data.type == 3){
        //p2p exchange data
        window.exchange(data.obj.extend.props.exchangeData);
    } else if(data.type == 4){
        //p2p 挂断
        window.leave(data.obj.extend.props.leaveId);
    }
}
var handleMsg= (data)=> {
    //消息特殊处理
    if(data.obj.message&&data.obj.message.extend&&data.obj.message.extend.props&&data.obj.message.extend.props.emit){
        PubSub.publish(data.obj.message.extend.props.emit, data);
    }
}