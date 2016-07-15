import {Socket} from './socketConnection';
import {el} from './utils';
import * as header from './header';
import * as menu from './menu';
import * as estimationTable from './estimationTable';

let session_username = sessionStorage.getItem('ss_user_name');
let activeStory;
let isCreator;
let cardTemplate;
let mobileMenuTemplate;
let storyNumberTemplate;
let SocketConnection;

(function (global, $) {

    function init() {
        try {
            SocketConnection = new Socket(global.location.host);
        } catch (e) {
            throw new Error('Sorry, we couldn\'t connect. Please try again later \n\n' + e);
        }

    }

    init();

    // attempt connection to the SocketConnection
    if (SocketConnection !== undefined) {
        SocketConnection.on('prepare-room-screen', function (room) {
            header.init(SocketConnection);
            menu.init(SocketConnection, room);
            estimationTable.init(SocketConnection);
            sessionStorage.setItem('ss_room', room);
            $("#room_name").text(room.room_name);
            $('#users').empty();
            isCreator = room.creator === sessionStorage.getItem('ss_user_name');
            if (isCreator) {
                $('.availableEstimationsDropdown').removeClass("hide");
                $(".modal-action").click(function () {
                    let estimationName = $("input[name='estimationName']").val();
                    SocketConnection.emit('create_story', estimationName);
                });
            }
        });

        SocketConnection.on("selectedStory", function (room) {
            updateView(room);
        });

        
    }
})(window, jQuery);