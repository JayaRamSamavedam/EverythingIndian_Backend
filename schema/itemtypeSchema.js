const mongoose = require('mongoose');




const itemTypeSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
  });


const ItemType = mongoose.model('ItemType', itemTypeSchema);
module.exports =  ItemType;
