(function (global, $) {

    var session_token = $('#session_token'),
        user_name = $('#user_name'),
        submit_button = $('#submit_button'),
        create_button = $('#create_button');

    // attempt to establish a connection to the server
    try {
        var server = io.connect(global.location.host);
    }
    catch (e) {
        alert('Sorry, we couldn\'t connect. Please try again later \n\n' + e);
    }

    // if successful
    if (server !== undefined) {

        console.log("Connection established...");

        // add the event listener for the login submit button
        submit_button.click(function (event) {
            // send the values to the server
            server.emit('join', {
                token: session_token.val(),
                user_name: user_name.val()
            });
        });

        create_button.click(function (event) {
            server.emit('create_session', {
                user_name: user_name.val()
            });
        });

        // alert error messages returned from the server
        server.on('alert', function (msg) {
            console.log(msg);
            alert(msg);
        });

        server.on('store_token', function (token) {
            sessionStorage.setItem('ss_user_name', user_name.val());
            sessionStorage.setItem('ss_token', token);
        });

        server.on('redirect', function (href) {
            window.location.assign(href);
        });
    }
})(window, jQuery);