import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
};
const isNextBuild = process.env.NEXT_PHASE === "phase-production-build";

const observeConnection = (promise) => {
  promise.catch((error) => {
    if (!global._mongoConnectionErrorLogged) {
      global._mongoConnectionErrorLogged = true;
      console.warn("MongoDB connection unavailable (running in guest/JWT session mode):", error?.message || error);
    }
  });
  return promise;
};

let client;
let clientPromise;

if (uri && !isNextBuild && process.env.NODE_ENV === "development") {
  // Use a global variable to preserve the value across module reloads in development
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = observeConnection(client.connect());
  }
  clientPromise = global._mongoClientPromise;
} else if (uri && !isNextBuild) {
  // In production, it's best to not use a global variable
  client = new MongoClient(uri, options);
  clientPromise = observeConnection(client.connect());
}

export default clientPromise;