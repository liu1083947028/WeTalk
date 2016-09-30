/**
 * Created by polylink on 16/9/26.
 */
import {
    MediaStreamTrack
} from 'react-native-webrtc';
import MeetJS from '../groupWebRtc';
export function createLocalTracks(options= {}) {
    return dispatch => {
        MediaStreamTrack.getSources(sourceInfos => {
            let videoSourceId;
            for (let i = 0; i < sourceInfos.length; i++) {
                const sourceInfo = sourceInfos[i];
                if(sourceInfo.kind == "video" && sourceInfo.facing == ((options.facingMode || 'user') == 'user' ? "front" : "back")) {
                    videoSourceId = sourceInfo.id;
                }
            }

            return MeetJS.createLocalTracks({
                devices: options.devices || ['audio', 'video'],
                //facingMode: options.facingMode || 'environment',
                //cameraDeviceId: options.cameraDeviceId,
                resolution: options.resolution,
                cameraDeviceId: videoSourceId,
                micDeviceId: options.micDeviceId
            }).then(localTracks => {
                return dispatch(changeLocalTracks(localTracks));
            }).catch(reason => {
                console.error(
                    'MeetJS.createLocalTracks.catch rejection reason: '
                    + reason);
            });
        });
    };
}

export function changeLocalTracks(newLocalTracks = []) {
    return (dispatch, getState) => {
        const conference =
            getState()['features/base/conference'].jitsiConference;
        let tracksToAdd = [];
        let tracksToRemove = [];
        let promise = Promise.resolve();

        if (conference) {
            conference.getLocalTracks().forEach(track => {
                let type = track.getType();

                if (type) {
                    let newTrack =
                        newLocalTracks.find(t => (t.getType() === type));

                    if (newTrack) {
                        tracksToAdd.push(newTrack);
                        tracksToRemove.push(track);
                    }
                }
            });

            // TODO: add various checks from original useVideo/AudioStream

            promise = dispatch(_disposeAndRemoveTracks(tracksToRemove))
                .then(() => addTracksToConference(conference, tracksToAdd));
        } else {
            tracksToAdd = newLocalTracks;
        }

        return promise
            .then(() => Promise.all(
                tracksToAdd.map(t => dispatch(trackAdded(t)))))
            .then(() => {
                // FIXME Lyubomir Marinov: It doesn't sound right to me to have
                // tracks trying to figure out & trigger participant-related
                // events. A participant owns tracks so it appears natural to me
                // to have the participant keep an eye on its tracks & determine
                // whether its video type has changed.

                // Maybe update local participant's videoType after we received
                // new media tracks.
                let participants = getState()['features/base/participants'];
                let localParticipant = participants.find(p => p.local);
                let promise = Promise.resolve();

                if (localParticipant) {
                    let addedVideoTrack =
                        tracksToAdd.find(t => t.isVideoTrack());
                    let removedVideoTrack =
                        tracksToRemove.find(t => t.isVideoTrack());

                    if (addedVideoTrack) {
                        promise = dispatch(participantVideoTypeChanged(
                            localParticipant.id,
                            addedVideoTrack.videoType));
                    } else if (removedVideoTrack) {
                        promise = dispatch(participantVideoTypeChanged(
                            localParticipant.id,
                            undefined));
                    }
                }

                return promise;
            });
    };
}