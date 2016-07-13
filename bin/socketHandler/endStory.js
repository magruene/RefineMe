function endStory(io, userSession, db) {
    let rooms = db.collection('rooms');
    let finishedStory;
    rooms.find({'room_name' : userSession.room_name}).limit(1).next((err, room) => {
        if(err) throw err;
        
        for (let i = 0; i < room.stories.length; i++) {
            let story = room.stories[i];
            if (story.active) {
                story.finished = true;
                finishedStory = story;
                rooms.updateOne({room_name: room.room_name}, {
                    $set: {
                        stories: room.stories
                    }
                }, () => {
                    io.to(userSession.room_name).emit('storyFinished', finishedStory);
                });
            }
        }
    });
}

module.exports = endStory;