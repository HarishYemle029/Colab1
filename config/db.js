const mongoose = require("mongoose");
require("dotenv").config();

const connectWithDb = () => {
    mongoose.connect(process.env.DATABASE_URL, {
        
    })
    .then(() => {
        console.log("DB Connected Successfully");
    })
    .catch((error) => {
        console.error("DB Facing Connection Issues");
        console.error(error);
        process.exit(1);
    });
};

module.exports = connectWithDb;
