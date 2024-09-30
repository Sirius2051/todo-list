require('dotenv').config();
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.URI);

async function connectDB() {
    try {
        await client.connect();
        console.log("Conectado a MongoDB");
    } catch (err) {
        console.error(err);
    }
}
module.exports = { connectDB, client };