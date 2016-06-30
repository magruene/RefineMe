function acceptEstimation (io, userSession, db, estimationValue) {
    var sessions = db.collection('sessions');
    sessions.find({
        'token': userSession.token
    }).toArray(function (err, res) {
        var singleEstimation = {
            user: userSession.user_name,
            estimation: estimationValue
        };
        var session = res[0];
        if (session.estimations) {
            for (var i = 0; i < session.estimations.length; i++) {

                if (session.estimations[i].active) {
                    var estimation = session.estimations[i];
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

                    sessions.update({token: session.token}, {
                        $set: {
                            estimations: session.estimations
                        }
                    }, function () {
                        io.to(userSession.token).emit('alert', "The user " + userSession.user_name + " made an estimation.");
                        var updateView = {
                            type: 'ESTIMATION_ACCEPT',
                            session: session
                        };
                        io.to(userSession.token).emit('update-view', updateView);
                        console.log(estimation);
                    });
                }
            }
        }
    });
}

module.exports = acceptEstimation;