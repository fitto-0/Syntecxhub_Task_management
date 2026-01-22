import mongoose from "mongoose";

export default async function connectDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI missing");
  }

  mongoose.set("strictQuery", false);
  await mongoose.connect(uri);
  console.log("Mongo connected");
}
