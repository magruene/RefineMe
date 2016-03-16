function createEstimation(io, userSession, db, name) {
    var newEstimation = {
        name : name,
        estimates: []
    };
    var sessions = db.collection('sessions');
    sessions.find({
        'token': userSession.token
    }).toArray(function (err, res) {
        if (err) throw err;
        var session = res[0];

        if (session.estimations === undefined) {
            session.estimations = [newEstimation];
        } else {
            session.estimations.push(newEstimation);
        }
        sessions.update({token: session.token}, {
            $set: {
                estimations: session.estimations
            }
        }, function () {
            io.to(userSession.token).emit('alert', "Behold peasants, a new estimation has been created");
        });
    });
}

module.exports = createEstimation;