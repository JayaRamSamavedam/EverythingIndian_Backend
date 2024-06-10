import mongoose from 'mongoose';
import Counter from './productCounterSchema.js';
import ItemType from './itemtypeSchema.js';
import Category from './categorySchema.js';

const productSchema = new mongoose.Schema({
  productId: {
    type: Number,
    unique: true, // Ensure unique product IDs
  },
  name: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: false,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  discountedPrice: {
    type: Number,
    required: true,
    default: function () {
      return this.price - (this.price * this.discount / 100);
    },
  },
  itemType: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
  numRatings: {
    type: Number,
    required: true,
    default: 0,
  },
});

productSchema.pre('save', async function (next) {
  const product = this;
  if (!product.isNew) {
    return next();
  }
  try {
    // const cat = await Category.findOne({ name: product.category });
    // if (!cat) {
    //   throw new Error("Category is invalid");
    // }
    // const ite = await ItemType.findOne({ name: product.itemType });
    // if (!ite) {
    //   throw new Error("Item Type is invalid");
    // }
    const counter = await Counter.findOneAndUpdate(
      { _id: 'productId' }, 
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    product.productId = counter.seq;
    next();
  } catch (error) {
    console.error("Error generating product ID:", error);
    next(error);
  }
});

const Product = mongoose.model('Product', productSchema);

export default Product;
