import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connection successfull!");
  } catch (error) {
    console.log(" Error occured in database connection ", error);
  }
};

export default connectDB;