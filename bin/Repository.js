let mongoDb = require('mongodb').MongoClient;

var MongoRepository = function(connectionString, objectName){
    
    let db;
    mongoDb.connect(connectionString, (err, database) => {
        if(err) throw err;

        console.log('Server started successfully!');
        db = database;
    });

    this.add = (value, callback) => {
        db.collection(objectName).insertOne(value, (error, result) => callback(error, result));
    };

    this.find = (query, callback) => {
        db.collection(objectName).find(query).limit(1).next((error, documents) => {
            callback(error, documents);
        });
    };

    this.update = (query, value, callback) => {
        db.collection(objectName)
            .updateOne(query, {$set: value}, (error, result) => callback(error, result));
    };
};

exports.Repository = MongoRepository;