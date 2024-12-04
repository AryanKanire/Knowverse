const mongoose = require("mongoose");

const connecttomongodb = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log("connected to mongodb");
    } catch (error) {
        console.log("Error connecteing mongodb",error.message);
    }
}

module.exports = connecttomongodb;