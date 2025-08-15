import mongoose from "mongoose";
import { runSeeder } from "../utils/seeder";
import { restartUserJob } from "./restart_user_job";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        await runSeeder()
        await restartUserJob()

        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
    }
};

export default connectDB;







