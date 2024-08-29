const express = require("express");
const cors = require('cors');
const connectWithDb = require("./config/db");
const projectRoutes = require("./routes/projectRoutes");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieSession = require("cookie-session");
const app = express();
app.use(
	cors({origin: '*',})
)


// Connect to the database

connectWithDb();

// Middleware to parse JSON requests
app.use(express.json());
const fileupload = require("express-fileupload");
app.use(fileupload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));


// Routes
app.use("/api/colab", projectRoutes);
app.use(express.urlencoded({extented:false}))



app.get('/',(req, res)=>{
    res.send('<h>welcome to colab</h>');
})

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
