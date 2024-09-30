// models/user.js
const bcrypt = require('bcryptjs');
const { MongoClient, ObjectId } = require('mongodb');
const { client } = require('../../db/db');

async function createUser(nombre, email, password) {
  	await client.connect();
	const database = client.db('TaskList');
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password.toString(), salt);
	const result = await database.collection('usuarios').insertOne({ nombre, email, password: hashedPassword });
	return result.insertedId;
}
async function findUserByEmail(email) {
	await client.connect();
	const database = client.db('TaskList');
	return await database.collection('usuarios').findOne({ email });
}

module.exports = { createUser, findUserByEmail };
