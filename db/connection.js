const mongoose = require("mongoose");

const DB = process.env.db_url;

mongoose.connect(DB,{}).then(()=>{
    console.log("database connected")
})
.catch((e)=>{
    console.log(e);
})