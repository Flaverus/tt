/* Seed a few temperature/humidity readings for local development. */
const dbName = 'weather';
const collectionName = 'measurements';

const samples = [
  {
    sensorId: 'cosy-homeoffice',
    temperature: 22.1,
    humidity: 41,
    timestamp: ISODate('2024-10-01T07:00:00Z'),
  },
  {
    sensorId: 'cosy-homeoffice',
    temperature: 23.4,
    humidity: 38,
    timestamp: ISODate('2024-10-01T09:00:00Z'),
  },
  {
    sensorId: 'cosy-homeoffice',
    temperature: 27.8,
    humidity: 55,
    timestamp: ISODate('2024-10-01T10:30:00Z'),
  },
  {
    sensorId: 'cosy-homeoffice',
    temperature: 18.6,
    humidity: 62,
    timestamp: ISODate('2024-10-01T11:15:00Z'),
  },
  {
    sensorId: 'cosy-homeoffice',
    temperature: 17.9,
    humidity: 65,
    timestamp: ISODate('2024-10-01T12:45:00Z'),
  },
];

db = db.getSiblingDB(dbName);

if (!db.getCollectionNames().includes(collectionName)) {
  db.createCollection(collectionName);
}

db[collectionName].insertMany(samples);
