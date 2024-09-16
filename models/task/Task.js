const { MongoClient, ObjectId } = require('mongodb');
const { client } = require('../../db/db');

async function createTask(task) {
    try {
        await client.connect();
        const database = client.db('TaskList');
        const tasksCollection = database.collection('tasksCollection');
        const result = await tasksCollection.insertOne(task);
        return result.insertedId;
    } finally {
        await client.close();
    }
}
async function getTasks() {
    try {
        await client.connect();
        const database = client.db('TaskList');
        const tasksCollection = database.collection('tasksCollection');
        return await tasksCollection.find({}).toArray(); // Sin filtro
    } finally {
        await client.close();
    }
}

async function updateTask(taskId, updatedTask) {
    try {
        await client.connect();
        const database = client.db('TaskList');
        const tasksCollection = database.collection('tasksCollection');
        const result = await tasksCollection.updateOne(
            { _id: new ObjectId(taskId) },
            { $set: updatedTask }
        );
        return result.modifiedCount;
    } finally {
        await client.close();
    }
}
async function deleteTask(taskId) {
    try {
        await client.connect();
        const database = client.db('TaskList');
        const tasksCollection = database.collection('tasksCollection');
        const result = await tasksCollection.deleteOne({ _id: new ObjectId(taskId) });
        return result.deletedCount;
    } finally {
        await client.close();
    }
}

module.exports = { createTask, getTasks, updateTask, deleteTask };