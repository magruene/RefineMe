function endEstimation(io, userSession, db) {
    var sessions = db.collection('sessions');
    var finishedEstimation;
    sessions.find({
        'token': userSession.token
    }).toArray(function (err, res) {
        var session = res[0];
        for (var i = 0; i < session.estimations.length; i++) {
            var estimation = session.estimations[i];
            if (estimation.active) {
                estimation.finished = true;
                finishedEstimation = estimation;
                sessions.update({token: session.token}, {
                    $set: {
                        estimations: session.estimations
                    }
                }, function () {
                    io.to(userSession.token).emit('estimationFinished', finishedEstimation);
                });
            }
        }
    });
}

module.exports = endEstimation;