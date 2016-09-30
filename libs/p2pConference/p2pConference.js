/**
 * Created by Frank on 9/23/16.
 */
const BackendFactory = require('../BackendFactory').default;
const _api = new BackendFactory();
import {
    RTCPeerConnection,
    RTCMediaStream,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStreamTrack,
    getUserMedia,
} from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';

var conference = {
    configuration: null,
    localStream: null,
    pcPeers: {},
    roomName: "",
    joinRoom: function (roomName) {
        createLocalTracks({"type": "video", "isFront": true}).then((stream)=> {
            if (!stream) {
                //reject(null);
                return;
            }
            join(roomName);
            //resolve(stream);
            conference.localStream = stream;
            conference.roomName = roomName;
            PubSub.publish('localStreamOn', {stream: stream});
        });
    },
    leaveRoom: function () {
        //挂断
        hangupP2PConference(conference.roomName);
        if (conference.localStream) {
            if (typeof conference.localStream.getTracks === "undefined") {
                conference.localStream.stop();
            } else {
                conference.localStream.getTracks().forEach(function (track) {
                    track.stop();
                });
            }
            conference.localStream = null;
        }

        for (let socketId in conference.pcPeers) {
            var pc = conference.pcPeers[socketId];
            if (!pc) {
                return;
            }
            pc.close();
            pc = null;
            delete conference.pcPeers[socketId];
        }

        //扬声器靠近耳朵功能取消
        InCallManager.stop();
    }
}


function join(roomID) {
    getIceConfig(roomID, (iceServers)=> {
        //取得打洞用户信息
        if (iceServers) {
            conference.configuration = {"iceServers": iceServers};
            joinP2PConference(roomID, function (socketIds) {
                for (const i in socketIds) {
                    const socketId = socketIds[i];
                    createPC(socketId, true);
                }
            });
        } else {
            //服务不存在...
        }
    });
}

function getIceConfig(roomId, callback) {
    _api.getIceConfig(roomId, function (data) {
        callback(data.iceServers);
    });
}

function joinP2PConference(roomId, callback) {
    _api.joinP2PConference(roomId, function (ids) {
        callback(ids);
    });
}

function exchangeP2PConference(data) {
    _api.exchangeP2PConference(data);
}

function hangupP2PConference(roomId) {
    _api.hangupP2PConference(roomId);
}

function deleteIceConfigUser(roomId) {
    _api.deleteIceConfigUser(roomId);
}

function createPC(socketId, isOffer) {
    const pc = new RTCPeerConnection(conference.configuration);
    conference.pcPeers[socketId] = pc;

    pc.onicecandidate = function (event) {
        if (event.candidate) {
            exchangeP2PConference({'to': socketId, 'candidate': event.candidate});
        }
    };

    function createOffer() {
        pc.createOffer(function (desc) {
            pc.setLocalDescription(desc, function () {
                exchangeP2PConference({'to': socketId, 'sdp': pc.localDescription});
            }, logError);
        }, logError);
    }

    pc.onnegotiationneeded = function () {
        if (isOffer) {
            createOffer();
        }
    }

    pc.oniceconnectionstatechange = function (event) {
        if (event.target.iceConnectionState === 'connected') {
            InCallManager.start({media: 'audio'});
            //通道打通,删除ice用户
            deleteIceConfigUser(conference.configuration.iceServers[1].username);
        }
    };
    pc.onsignalingstatechange = function (event) {
    };

    pc.onaddstream = function (event) {
        PubSub.publish('remoteStreamOn', {stream: event.stream, id: socketId});
    };
    pc.onremovestream = function (event) {
    };

    pc.addStream(conference.localStream);
    return pc;
}

//创建本地Tracks
function createLocalTracks(option) {
    return new Promise(function (resolve, reject) {
        getConsistent(option).then((consistent) => {
            if (!consistent) {
                reject(null);
                return;
            }
            getLocalStream(consistent).then((stream) => {
                resolve(stream);
            }).catch((err) => {
                reject(null);
            });
        });
    });
}

function logError(error) {
}

/**
 * 取得consistent
 * @param option {type:"video",isFront: true}type 类型 video audio,isFront 是否前置摄像头 true,false
 * @returns {Promise}
 */
function getConsistent(option) {
    return new Promise(function (resolve, reject) {
        var consistent = {"audio": true, "video": false};
        try {
            if (option.type == "video") {
                //视频
                MediaStreamTrack.getSources(sourceInfos => {
                    let videoSourceId;
                    for (let i = 0; i < sourceInfos.length; i++) {
                        const sourceInfo = sourceInfos[i];
                        if (sourceInfo.kind == "video" && sourceInfo.facing == (option.isFront ? "front" : "back")) {
                            videoSourceId = sourceInfo.id;
                        }
                    }
                    consistent = {
                        "audio": true,
                        "video": {
                            optional: [
                                {minFrameRate: 20},
                                {minWidth: 320},
                                {minHeigth: 240},
                                {maxWidth: 960},
                                {maxHeigth: 720},
                                {sourceId: videoSourceId}
                            ]
                        }
                    };
                    resolve(consistent);
                });
            } else {
                resolve(consistent);
            }
        } catch (e) {
            reject(null);
        }
    });
}

function getLocalStream(consistent) {
    return new Promise(function (resolve, reject) {
        if (!consistent.audio && !consistent.video) {
            resolve(null);
        } else {
            getUserMedia(consistent, function (stream) {
                resolve(stream);
            }, function (err) {
                reject(null);
            });
        }
    });
}

window.exchange = function (data) {
    if (!conference.localStream) {
        return;
    }
    const fromId = data.from;
    let pc;
    if (fromId in conference.pcPeers) {
        pc = conference.pcPeers[fromId];
    } else {
        pc = createPC(fromId, false);
    }
    if (data.sdp) {
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
            if (pc.remoteDescription.type == "offer")
                pc.createAnswer(function (desc) {
                    pc.setLocalDescription(desc, function () {
                        exchangeP2PConference({'to': fromId, 'sdp': pc.localDescription});
                    }, logError);
                }, logError);
        }, logError);
    } else {
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
}

window.leave = function (socketId) {
    if (!conference.localStream) {
        return;
    }
    const pc = conference.pcPeers[socketId];
    if (!pc) {
        return;
    }
    const viewIndex = pc.viewIndex;
    pc.close();
    delete conference.pcPeers[socketId];

    PubSub.publish('remoteStreamLeave', socketId);
}

export default conference;