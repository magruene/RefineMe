import {el} from './utils';

export function init(socketConnection) {
    el('.leave_room')[0].addEventListener('click', function () {
        socketConnection.emit('leave_room', {
            room_name: sessionStorage.getItem('ss_room_name'),
            user_name: sessionStorage.getItem('ss_user_name')
        });
    });
}