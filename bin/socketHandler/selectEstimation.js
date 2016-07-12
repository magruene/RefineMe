function selectEstimation(io, userSession, db, data) {
    var rooms = db.collection('rooms');

    rooms.find({
        'room_name': userSession.room_name
    }).toArray(function (err, res) {
        if (err) throw err;

        var room = res[0];
        var activeEstimation;
        console.log(room)
        for(var i=0; i < room.estimations.length; i++) {
            if (room.estimations[i].name === data) {
                room.estimations[i].active = true;
                activeEstimation = room.estimations[i];
            } else {
                room.estimations[i].active = false;
            }
        }

        rooms.update({room_name: room.room_name}, {
            $set: {
                estimations: room.estimations
            }
        }, function () {
            io.to(userSession.room_name).emit('alert', "Session admin has selected new story. Now active: " + activeEstimation.name);
            io.to(userSession.room_name).emit('selectedEstimation', room);
        });

    });
}

module.exports = selectEstimation;