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
        for (var i = 0; i < session.estimations.length; i++) {

            if (session.estimations[i].active) {
                var estimation = session.estimations[i];
                var userIndex = -1;
                for(var j=0; j < estimation.estimates.length; j++) {
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
                    io.to(userSession.token).emit('alert', "The peasant called " + userSession.user_name + ", made an estimation.");
                    io.to(userSession.token).emit('newEstimateAdded', userSession.user_name);
                    console.log(estimation);
                    if (estimation.estimates.length === session.users.length) {
                        io.to(userSession.token).emit('everyoneMadeEstimation');
                    }

                });
            }
        }
    });
}

module.exports = acceptEstimation;