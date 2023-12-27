import mongoose from 'mongoose';

import { DB_NAME } from '../constants/index.js';

const connectDB = async () => {
    try {
        console.log(`${process.env.MONGODB_URL}/${DB_NAME}`);
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`MongoDB connected !! DB HOST:${connectionInstance.connection.host}`);
    } catch (error) {
        console.error(`Error :: connectDB ::`, error);
        process.exit(1);
    }
};

export default connectDB;
