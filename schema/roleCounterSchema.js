import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, required: true, default: 0 }, 
});

const RoleCounter = mongoose.model('RoleCounter', counterSchema);

export default RoleCounter;