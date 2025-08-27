
const mongoose = require('mongoose')

const dbCon = async () => {
    try {
        const db = await mongoose.connect(process.env.MONGODB_URL)
        if (db) {
            console.log("Database connection successful")
        }
    } catch (error) {
        console.log("Error in connecting Mongodb", error)
    }
}

module.exports = dbCon