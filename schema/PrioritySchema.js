import mongoose from "mongoose";

const prioritySchema = mongoose.Schema({
    priority:{
        type:Number,
    }
});

const Priority = mongoose.model('Priority',prioritySchema);
export default Priority;