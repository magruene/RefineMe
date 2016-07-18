import {el} from './utils';

export function init(socketConnection) {
    $(".button-collapse").sideNav({
        menuWidth: 240, // Default is 240
        closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
    });
    
    el('.leave_room')[0].addEventListener('click', function () {
        socketConnection.emit('leave_room', {
            room_name: sessionStorage.getItem('ss_room_name'),
            user_name: sessionStorage.getItem('ss_user_name')
        });
    });
}