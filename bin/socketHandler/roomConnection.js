function roomConnection(io, socket, repo, data) {
    
    console.log(data);
    
    let userSession = {
        room_name: data.room_name,
        user_name: data.user_name,
        socket: socket
    };

    socket.join(userSession.room_name);

    repo.find({
        'room_name': userSession.room_name
    }, (err, room) => {
        if (err) throw err;

        socket.emit('prepare-room-screen', room);
        io.to(userSession.room_name).emit('update-table', room);

        let createStory = require("./createStory.js");
        socket.on('create_story', (storyName) => {
            createStory(userSession.room_name, repo, storyName,
                (actualRoom) => {
                    io.to(userSession.room_name).emit('alert', "A new story '" + storyName + "' has been created!");
                    io.to(userSession.room_name).emit('storyCreated', actualRoom);
                });
        });

        let acceptStory = require("./acceptStory.js");
        socket.on('user_estimated', (data) => {
            acceptStory(userSession, repo, data,
                (actualRoom) => {
                    io.to(userSession.room_name).emit('alert', "The user " + userSession.user_name + " made an estimation.");
                    io.to(userSession.room_name).emit('update-table', actualRoom);
                });
        });

        let selectStory = require("./selectStory.js");
        socket.on('select_story', (data) => {
            selectStory(userSession.room_name, repo, data,
                (actualRoom, activeStory) => {
                    io.to(userSession.room_name).emit('alert', "New story selected: " + activeStory.name);
                    io.to(userSession.room_name).emit('selectedStory', actualRoom);
                });
        });

        let endStory = require("./endStory.js");
        socket.on('finish_story', () => {
            endStory(userSession.room_name, repo,
                (finishedStory) => {
                    io.to(userSession.room_name).emit('storyFinished', finishedStory);
                });
        });
    })
}

module.exports = roomConnection;