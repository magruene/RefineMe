export function Socket(url) {
    let socket = io.connect(url);

    socket.emit('room-connection', {
        room_name: sessionStorage.getItem('ss_room_name'),
        user_name: sessionStorage.getItem('ss_user_name')
    });

    // alert error messages returned from the SocketConnection
    socket.on('alert', function (msg) {
        Materialize.toast(msg, 4000, 'rounded');
    });

    socket.on('redirect', function (href) {
        window.location.assign(href);
    });
    
    function registerEvent(eventName, func) {
        socket.on(eventName, func);
    }

    function emitEvent(eventName, value) {
        socket.emit(eventName, value);
    }
    
    
    return {
        on: registerEvent,
        emit: emitEvent
    }
}