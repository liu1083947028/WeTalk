/**
 * Created by polylink on 16/9/26.
 */
import MeetJS from '../groupWebRtc';
import {connection} from '../../config';
let meetInit=(room)=>{
    MeetJS.init({}).then(() => {
        const connection = new MeetJS.JitsiConnection(
            null,
            null,
            {
                ...connection,
                bosh: connection.bosh + (
                    room ? ('?room=' + room) : ''
                )
            }
        );

        dispatch(connectionInitialized(connection, room));
    }).catch(error => {
        dispatch(rtcError(error));
    });
}