import mongoose from 'mongoose';


const itemTypeSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
  });


const ItemType = mongoose.model('ItemType', itemTypeSchema);
export default ItemType;
