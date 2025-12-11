const { MongoClient } = require("mongodb");

const mongoUser = process.env.MONGODB_USER || "user";
const mongoPassword = process.env.MONGODB_PASSWORD || "password";
const mongoHost = process.env.MONGODB_HOST || "mongodb";
const mongoPort = process.env.MONGODB_PORT || "27017";
const mongoDbName = process.env.MONGODB_DB || "weather";
const mongoAuthDb = process.env.MONGODB_AUTH_DB || "admin";
const mongoCollectionName = process.env.MONGODB_COLLECTION || "measurements";
const mongoUri =
  process.env.MONGODB_URI ||
  `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDbName}?authSource=${mongoAuthDb}`;

let mongoClient;

const getMongoClient = async () => {
  if (!mongoClient) {
    mongoClient = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });
    try {
      await mongoClient.connect();
    } catch (error) {
      mongoClient = null;
      throw error;
    }
  }

  return mongoClient;
};

const getMeasurementsCollection = async () => {
  const client = await getMongoClient();
  return client.db(mongoDbName).collection(mongoCollectionName);
};

module.exports = {
  getMeasurementsCollection,
};
