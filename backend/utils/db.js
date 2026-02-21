const mongoose = require("mongoose");

const ensureVoterIndexes = async (connection) => {
  const votersCollection = connection.collection("voters");
  let indexes = [];
  try {
    indexes = await votersCollection.indexes();
  } catch (error) {
    if (error?.code !== 26 && error?.codeName !== "NamespaceNotFound") {
      throw error;
    }
  }

  const legacyIdIndexes = indexes.filter((index) => index?.key?.idno === 1);
  for (const index of legacyIdIndexes) {
    await votersCollection.dropIndex(index.name);
    console.log(`Dropped legacy voter index: ${index.name}`);
  }

  const cleanup = await votersCollection.updateMany(
    { idno: { $exists: true } },
    { $unset: { idno: "" } }
  );
  if (cleanup.modifiedCount > 0) {
    console.log(`Removed legacy idno field from ${cleanup.modifiedCount} voter record(s).`);
  }

  const emailIndex = indexes.find((index) => index?.key?.email === 1);
  const hasEmailUniqueIndex = Boolean(emailIndex?.unique);
  if (!hasEmailUniqueIndex) {
    try {
      if (emailIndex?.name) {
        await votersCollection.dropIndex(emailIndex.name);
      }
      await votersCollection.createIndex({ email: 1 }, { unique: true, name: "email_1" });
      console.log("Created unique index for voters.email");
    } catch (error) {
      if (error?.code === 11000) {
        console.warn("Could not create unique voters.email index because duplicate emails exist.");
      } else {
        throw error;
      }
    }
  }
};

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/election_management";
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    await ensureVoterIndexes(conn.connection);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
