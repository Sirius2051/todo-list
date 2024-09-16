const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("Conectado a MongoDB");
    } catch (err) {
        console.error(err);
    }
}

module.exports = { connectDB, client };

