function createStory(io, userSession, repo, name) {
    let newStory = {
        name: name,
        estimates: []
    };
    repo.find({'room_name': userSession.room_name}, (err, room) => {
        if (err) throw err;

        if (room.stories === undefined) {
            room.stories = [newStory];
        } else {
            room.stories.push(newStory);
        }
        repo.update({room_name: room.room_name},
            {stories: room.stories},
            () => {
                io.to(userSession.room_name).emit('alert', "A new story '" + name + "' has been created!");
                io.to(userSession.room_name).emit('update-view', room);
            });
    });
}

module.exports = createStory;