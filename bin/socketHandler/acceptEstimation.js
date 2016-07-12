function acceptEstimation(io, userSession, db, estimationValue) {
    var rooms = db.collection('rooms');
    rooms.find({
        'room_name': userSession.room_name
    }).toArray(function (err, res) {
        var singleEstimation = {
            user: userSession.user_name,
            estimation: estimationValue
        };
        var room = res[0];
        if (room.estimations) {
            for (var i = 0; i < room.estimations.length; i++) {

                if (room.estimations[i].active) {
                    var estimation = room.estimations[i];
                    var userIndex = -1;
                    for (var j = 0; j < estimation.estimates.length; j++) {
                        if (estimation.estimates[j].user === userSession.user_name) {
                            userIndex = j;
                        }
                    }

                    //user already made an estimation, so we simply override the value, else add new estimate
                    if (userIndex !== -1) {
                        estimation.estimates[userIndex].estimation = estimationValue;
                    } else {
                        estimation.estimates.push(singleEstimation);
                    }

                    rooms.update({room_name: room.room_name}, {
                        $set: {
                            estimations: room.estimations
                        }
                    }, function () {
                        io.to(userSession.room_name).emit('alert', "The user " + userSession.user_name + " made an estimation.");
                        io.to(userSession.room_name).emit('update-view', room);
                        console.log(estimation);
                    });
                }
            }
        }
    });
}

module.exports = acceptEstimation;