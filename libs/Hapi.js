/**
 * # Hapi.js
 * 
 * This class interfaces with Hapi.com using the rest api
 * see [http://hapijs.com/api](http://hapijs.com/api)
 *
 */
'use strict';
/**
 * ## Async support
 * 
 */ 
//require('regenerator/runtime');

/**
 * ## Imports
 * 
 * Config for defaults and underscore for a couple of features
 */

import Ajax from './Ajax';
//let md5 = require('md5');

export default class Hapi{
  /**
   * ## Hapi.js client
   *
   *
   * @throws tokenMissing if token is undefined
   */
  async login(username,password,nationalCode='86') {
    return await ajaxPost('/api/authMD5',{"account": username, "password": password,"nationalCode":nationalCode});
  }

  async getRooms() {
    return await ajaxGet('/api/getRooms');
  }

  async autoLogin(){
    return await ajaxGet('/api/authByToken');
  }

  async getMessages(rid,before,u){
    var _before='';
    if(before){
      _before=before.getTime();
    }else {
      _before='notime';
    }
    return await ajaxGet('/api/getMessages/'+rid+'/'+_before);
  }

  /**
   * 房间设为已读
   * @returns {T}
     */
  async setRoomRead(rid){
    return await ajaxGet('/api/setSubRoomHasRead/'+rid);
  }

  /**
   * 发送消息
   * @param data
   * @returns {T}
     */
  async sendMessage(data){
    return await ajaxPost('/api/addMessage',data);
  }
  /**
   * ### logout
   * prepare the request and call _fetch
   */  
  async deviceOutline(uniqueID) {
    return await Ajax('/api/deviceOutline/'+uniqueID, null,'GET').then((result)=> {
      if(Number(result.res)>0){
        return result;
      }else {
        throw(result);
      }
    }).catch((error)=>{
      throw(error);
    })
  }


  /**
   * 设备上线
   * @param data
   * @returns {T}
     */
  async deviceOnline(data){
    return await Ajax('/api/deviceOnline', data,'POST').then((result)=> {
      if(Number(result.res)>0){
        return result;
      }else {
        throw(result);
      }
    }).catch((error)=>{
      throw(error);
    })
  }

  /**
   * 根据房间id来获取房间信息
   * @param rid
   * @returns {T}
     */
  async getRoomById(rid){
    return await ajaxGet('/api/getRoomInfo/'+rid);
  }


  /**
   * 接受邀请
   * @param data
   * @returns {T}
   */
  async acceptCall(data){
    return await Ajax("/api/"+data.action+"/"+data.rid+"/acceptCall", null,'get').then((result)=> {
      if(Number(result.res)>0){
        return result;
      }else {
        throw(result);
      }
    }).catch((error)=>{
      throw(error);
    })
  }


  /**
   * 拒绝邀请
   * @param data
   * @returns {T}
   */
  async refuseCall(data){
    return await Ajax('/api/refuseCall',{"rid":data.rid,"uid":data.uid,"action":data.action},'post').then((result)=> {
      if(Number(result.res)>0){
        return result;
      }else {
        throw(result);
      }
    }).catch((error)=>{
      throw(error);
    })
  }

  async startWebRtc(action,contacts,rid,rType,rName){
    return await Ajax('/api/startWebRtc',{"action":action,"contacts":contacts,"rid":rid,"rType":rType,"rName":rName},'post').then((result)=> {
      if(Number(result.res)>0){
        return result;
      }else {
        throw(result);
      }
    }).catch((error)=>{
      throw(error);
    })
  }

  async cancelCall(rid, action, callId) {
    return await Ajax('/api/' + action + '/' + rid + '/' + callId + '/cancelCall', null, 'get').then((result)=> {
      if (Number(result.res) > 0) {
        return result;
      } else {
        throw(result);
      }
    }).catch((error)=> {
      throw(error);
    })
  }

  async userSetting(key,val){
    return await Ajax('/api/updateSettings',{"key":key,"val":val},'post').then((result)=> {
      if(Number(result.res)>0){
        return result;
      }else {
        throw(result);
      }
    }).catch((error)=>{
      throw(error);
    })
  }

  async webLogOut(){
    return await Ajax('/api/weblogout',null,'get').then((result)=> {
      if(Number(result.res)>0){
        return result;
      }else {
        throw(result);
      }
    }).catch((error)=>{
      throw(error);
    })
  }

  /**
   * 加入P2P房间
   * @param roomId
   * @param callback
   */
  async joinP2PConference(roomId, callback) {
    return await Ajax('/api/joinP2PConference', {rid: roomId}, 'post').then((result)=> {
      if (Number(result.res) > 0) {
        callback(result.ids);
      } else {
        callback([]);
      }
    }).catch((error)=> {
      callback([]);
    });
  }

  /**
   * P2P打洞
   * @param data
   */
  async exchangeP2PConference(data) {
    var tmpData = {
      to: data.to
    };

    if (data.sdp) {
      tmpData._type = "sdp";
      tmpData.sdp = data.sdp.sdp;
      tmpData.type = data.sdp.type;
    }

    if (data.candidate) {
      tmpData._type = "candidate";
      tmpData.candidate = data.candidate.candidate;
      tmpData.sdpMLineIndex = data.candidate.sdpMLineIndex;
      tmpData.sdpMid = data.candidate.sdpMid;
    }

    return await Ajax('/api/exchangeP2PConference', tmpData, 'post').then((result)=> {
      if (Number(result.res) > 0) {
        return result;
      } else {
        throw(result);
      }
    }).catch((error)=> {
      throw(error);
    });
  }

  /**
   * 挂断
   * @param roomId
   */
  async hangupP2PConference(roomId) {
    return await Ajax('/api/hangupP2PConference', {rid: roomId}, 'post').then((result)=> {
      if (Number(result.res) > 0) {
        return result;
      } else {
        throw(result);
      }
    }).catch((error)=> {
      throw(error);
    });
  }

  /**
   * 取得ice配置
   * @param roomId
   */
  async getIceConfig(roomId,callback) {
    return await Ajax('/api/iceconfig/getIceConfig', {roomId: roomId}, 'post').then((result)=> {
      if (Number(result.res) > 0) {
        callback(result);
      } else {
        throw(result);
      }
    }).catch((error)=> {
      throw(error);
    });
  }

  /**
   * 删除ice配置用户
   * @param roomId
   */
  async deleteIceConfigUser(roomId) {
    return await Ajax('/api/iceconfig/deleteIceConfigUser', {roomId: roomId}, 'post').then((result)=> {
      if (Number(result.res) > 0) {
        return result;
      } else {
        throw(result);
      }
    }).catch((error)=> {
      throw(error);
    });
  }

  /**
   * 获取图片验证码
   * @returns {T}
     */
  async getCaptcha() {
    return await Ajax('/api/getCaptcha', null, 'get').then((result)=> {
      if (Number(result.res) > 0) {
        return result;
      } else {
        throw(result);
      }
    }).catch((error)=> {
      throw(error);
    });
  }

  /**
   * 获取短信验证码
   * @returns {T}
   */
  async getSmsToken(data) {
    return await Ajax('/api/checkPhoneNum', data, 'POST').then((result)=> {
      if (Number(result.res) > 0) {
        return result;
      } else {
        throw(result);
      }
    }).catch((error)=> {
      throw(error);
    });
  }

  /**
   * 获取短信验证码
   * @returns {T}
     */
  async getSmsCode(data) {
    return await Ajax('/api/sendSMS', data, 'POST').then((result)=> {
      if (Number(result.res) > 0) {
        return result;
      } else {
        throw(result);
      }
    }).catch((error)=> {
      throw(error);
    });
  }

  /**
   * 验证短信验证码
   * @param data
   * @returns {T}
     */
  async checkSmsCode(data) {
    return await Ajax('/api/verifySMSCode', data, 'POST').then((result)=> {
      if (Number(result.res) > 0) {
        return result;
      } else {
        throw(result);
      }
    }).catch((error)=> {
      throw(error);
    });
  }

  /**
   * 用户注册
   * @param data
   * @returns {T}
   */
  async registerUserByPhone(data) {
    return await Ajax('/api/registerUserByPhone', data, 'POST').then((result)=> {
      if (Number(result.res) > 0) {
        return result;
      } else {
        throw(result);
      }
    }).catch((error)=> {
      throw(error);
    });
  }

  /**
   * 更新用户名称
   * @param data
   * @returns {T}
     */
  async updateFullName(data) {
    return await Ajax('/api/updateFullName', data, 'POST').then((result)=> {
      if (Number(result.res) > 0) {
        return result;
      } else {
        throw(result);
      }
    }).catch((error)=> {
      throw(error);
    });
  }

  /**
   * 发送绑定邮箱的邮件
   * @param data
   * @returns {T}
     */
  async toBindEmail(data) {
    return await Ajax('/api/bindEmail', data, 'POST').then((result)=> {
      if (Number(result.res) > 0) {
        return result;
      } else {
        throw(result);
      }
    }).catch((error)=> {
      throw(error);
    });
  }


  async toGetRoomById(rid) {
    return await Ajax('/api/getRoomInfo/'+rid, null, 'get').then((result)=> {
      if (Number(result.res) > 0) {
        return result;
      } else {
        throw(result);
      }
    }).catch((error)=> {
      throw(error);
    });
  }

  async closeRoom(rid) {
    return await Ajax('/api/closeRoom/'+rid, null, 'get').then((result)=> {
      if (Number(result.res) > 0) {
        return result;
      } else {
        throw(result);
      }
    }).catch((error)=> {
      throw(error);
    });
  }

  /**
   * 初始化通讯录
   * @param openId
   * @param uid
   * @returns {T}
     */
  async getMoreWetalkContacts(page=1,searchText) {
    return await ajaxPost('/api/getMoreContacts',{"page":page,"searchField":searchText});
  }

  /**
   * 获取被收藏的房间信息
   * @param rid
   * @param searchText
   * @returns {*}
     */
  async getMoreGroupContacts(rid,searchText) {
    return await ajaxPost('/api/getMoreGroups',{"rid":rid,"searchField":searchText});
  }

  /**
   * 新增聊天
   * @param data
   * @returns {*}
     */
  async addRoom(data){
    return await ajaxPost('/api/addRoom',data);
  }

  /**
   * 获取房间详情
   * @param rid
   * @returns {*}
     */
  async getRoomInfo(rid){
    return await ajaxGet('/api/getRoomInfo/'+rid);
  }

  /**
   * 验证通讯录的特性
   * {"phones":"86-343444434,86-243434355","emails""e1,e2,e3"}
   * @param data
   * @returns {*}
     */
  async checkContacts(data){
    return await ajaxPost('/api/checkContact',data);
  }

};
let ajaxPost=function(url,data){
  return  Ajax(url, data, 'POST').then((result)=> {
    if (Number(result.res) > 0) {
      return result;
    } else {
      throw(result);
    }
  }).catch((error)=> {
    throw(error);
  });
}
let ajaxGet=function(url){
  return  Ajax(url, null, 'GET').then((result)=> {
    if (Number(result.res) > 0) {
      return result;
    } else {
      throw(result);
    }
  }).catch((error)=> {
    throw(error);
  });
}