import mongoose from "mongoose";

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected || mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "stepdb",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = true;
}
