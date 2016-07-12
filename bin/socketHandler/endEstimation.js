function endEstimation(io, userSession, db) {
    var rooms = db.collection('rooms');
    var finishedEstimation;
    rooms.find({
        'room_name': userSession.room_name
    }).toArray(function (err, res) {
        var room = res[0];
        for (var i = 0; i < room.estimations.length; i++) {
            var estimation = room.estimations[i];
            if (estimation.active) {
                estimation.finished = true;
                finishedEstimation = estimation;
                rooms.update({room_name: room.room_name}, {
                    $set: {
                        estimations: room.estimations
                    }
                }, function () {
                    io.to(userSession.room_name).emit('estimationFinished', finishedEstimation);
                });
            }
        }
    });
}

module.exports = endEstimation;