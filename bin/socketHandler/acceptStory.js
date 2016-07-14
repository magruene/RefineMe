function acceptStory(io, userSession, repo, estimationValue) {

    repo.find({'room_name': userSession.room_name}, (err, room) => {
        if (err) throw err;

        let singleEstimation = {
            user: userSession.user_name,
            estimation: estimationValue
        };
        if (room.stories) {
            for (let i = 0; i < room.stories.length; i++) {
                if (room.stories[i].active) {
                    let story = room.stories[i];
                    let userIndex = -1;
                    for (let j = 0; j < story.estimates.length; j++) {
                        if (story.estimates[j].user === userSession.user_name) {
                            userIndex = j;
                        }
                    }

                    //user already made an estimation, so we simply override the value, else add new estimate
                    if (userIndex !== -1) {
                        story.estimates[userIndex].estimation = estimationValue;
                    } else {
                        story.estimates.push(singleEstimation);
                    }

                    repo.update({room_name: room.room_name},
                        {stories: room.stories},
                        () => {
                            io.to(userSession.room_name).emit('alert', "The user " + userSession.user_name + " made an estimation.");
                            io.to(userSession.room_name).emit('update-view', room);
                            console.log(story);
                        });
                }
            }
        }

    });
}

module.exports = acceptStory;