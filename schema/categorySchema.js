// const mongoose = require('mongoose');
import mongoose from 'mongoose';

// Category Schema

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true ,
  },
  proImage:{
    type:String,
  },
  discount:{
    type:Number,
  },
  link:{
    type:String,
  },
});
categorySchema.pre("save", async function (next) {
  this.link=`/${this.name}`;
  next();
});
const Category = mongoose.model('Category', categorySchema);

export default Category;