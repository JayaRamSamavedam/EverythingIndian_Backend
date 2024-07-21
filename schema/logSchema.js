// models/Log.js
import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  level:{ 
    type:String
},
  message:{ type:String},
  meta:{ 
    type:mongoose.Schema.Types.Mixed
  }
});

const Log = mongoose.model('Log', logSchema);

export default Log;
