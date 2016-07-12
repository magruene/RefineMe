function createEstimation(io, userSession, db, name) {
    var newEstimation = {
        name: name,
        estimates: []
    };
    var rooms = db.collection('rooms');
    rooms.find({
        'room_name': userSession.room_name
    }).toArray(function (err, res) {
        if (err) throw err;
        var room = res[0];

        if (room.estimations === undefined) {
            room.estimations = [newEstimation];
        } else {
            room.estimations.push(newEstimation);
        }
        rooms.update({room_name: room.room_name}, {
            $set: {
                estimations: room.estimations
            }
        }, function () {
            io.to(userSession.room_name).emit('alert', "A new estimation '" + name + "' has been created!");
            io.to(userSession.room_name).emit('update-view', room);
        });
    });
}

module.exports = createEstimation;