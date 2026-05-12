import mongoose from 'mongoose'

export const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    try{
        const uri = process.env.MONGO_URI;
        if(!uri){
            throw new Error("MONGO_URI is required");
        }

        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
        return mongoose.connection;
    } catch (error){
        console.log("Failed to connect to MongoDB", error.message);
        throw error;
    }
}
