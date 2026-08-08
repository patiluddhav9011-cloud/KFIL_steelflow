import mongoose from "mongoose";

// Connects to MongoDB using the URI from the .env file.
// Called once when the server starts up.
export async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/KFILsteelflow";

  try {
    await mongoose.connect(uri);
    console.log("[KFILSteelFlow] Connected to MongoDB");
  } catch (err) {
    console.error("[KFILSteelFlow] Could not connect to MongoDB.");
    console.error("  -> Check that MONGO_URI in your .env file is correct,");
    console.error("     and that your MongoDB server (local or Atlas) is running.");
    console.error("  Original error:", err.message);
    process.exit(1);
  }
}

export default connectDB;
