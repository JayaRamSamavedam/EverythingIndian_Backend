require("dotenv").config();
const express = require("express");
const cookieParser = require('cookie-parser');


const app = express();

const cors = require("cors");
require("./db/connection");

const router = require("./routes/userroutes");
// const productrouter=require("./routes/productroutes");
const PORT = 4002;

// middleware
app.use(express.json());
app.use(cors({
    origin: "*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
app.use(cookieParser());
app.use(router);
// app.use(productrouter);

app.listen(PORT,()=>{
    console.log(`Server start at Port No :${PORT}`)
})