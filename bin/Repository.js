let mongoDb = require('mongodb').MongoClient;

var MongoRepository = function(connectionString, objectName){
    let db;
    mongoDb.connect(connectionString, function (err, database) {
        if(err) throw err;

        console.log('Server started successfully!');
        db = database;
    });

    this.add = function(value, callback) {
        db.collection(objectName).insertOne(value, callback);
    };

    this.find = function(query, callback) {
        db.collection(objectName).find(query).limit(1).next(function(error, documents) {
            callback(error, documents);
        });
    };

    this.update = function(query, value, callback) {
        db.collection(objectName)
            .updateOne(query, {$set: value}, callback);
    };
};

exports.Repository = MongoRepository;