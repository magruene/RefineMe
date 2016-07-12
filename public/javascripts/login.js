import {el} from './utils';

(function (global) {
    let room_name = el('#room_name'),
        user_name = el('#user_name'),
        submit_button = el('#submit_button'),
        create_button = el('#create_button'),
        server;

    // attempt to establish a connection to the server
    try {
        server = io.connect(global.location.host);
    }
    catch (e) {
        alert('Sorry, we couldn\'t connect. Please try again later \n\n' + e);
    }

    // if successful
    if (server !== undefined) {

        console.log("Connection established...");

        // add the event listener for the login submit button
        submit_button.addEventListener('click', (event) => {
            // send the values to the server
            server.emit('join', {
                room_name: room_name.value,
                user_name: user_name.value
            });
        });

        create_button.addEventListener('click', (event) => {
            server.emit('create_room', {
                user_name: user_name.value
            });
        });

        // alert error messages returned from the server
        server.on('alert', (msg) => {
            console.log(msg);
            alert(msg);
        });

        server.on('store_room_name', (room_name) => {
            sessionStorage.setItem('ss_user_name', user_name.value);
            sessionStorage.setItem('ss_room_name', room_name);
        });

        server.on('redirect', (href) => {
            window.location.assign(href);
        });
    }
})(window);