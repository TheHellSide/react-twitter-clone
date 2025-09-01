import mongoose from "mongoose";

const connect_mongodb = async () => {
    try {
        const db_connection = await mongoose.connect(process.env.MONGO_URI);
        console.log(`mongodb-connected: ${db_connection.connection.host}`)
    }
    
    catch (error) {
        console.log(`database-error: ${error.message}`);
        process.exit(1)
    }
}

export default connect_mongodb;