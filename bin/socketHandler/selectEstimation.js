function selectEstimation(io, userSession, db, data) {
    var sessions = db.collection('sessions');

    sessions.find({
        'token': userSession.token
    }).toArray(function (err, res) {
        if (err) throw err;

        var session = res[0];
        var activeEstimation;
        console.log(session)
        for(var i=0; i < session.estimations.length; i++) {
            if (session.estimations[i].name === data) {
                session.estimations[i].active = true;
                activeEstimation = session.estimations[i];
            } else {
                session.estimations[i].active = false;
            }
        }

        sessions.update({token: session.token}, {
            $set: {
                estimations: session.estimations
            }
        }, function () {
            io.to(userSession.token).emit('alert', "Behold peasants, we will now estimate: " + activeEstimation.name);
            io.to(userSession.token).emit('selectedEstimation', session);
        });

    });
}

module.exports = selectEstimation;