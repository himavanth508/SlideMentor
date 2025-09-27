const { MongoClient } = require("mongodb");

let client;
let db;

console.log("Connecting to MongoDB...",process.env.MONGO_URI);

async function connectDB() {
  if (db) return db;
  client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db(process.env.DB_NAME || "slides_ai");
  return db;
}

module.exports = { connectDB };
