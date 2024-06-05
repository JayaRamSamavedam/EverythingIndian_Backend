const mongoose = require('mongoose');

// Category Schema

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
});


const Category = mongoose.model('Category', categorySchema);

module.exports=Category;