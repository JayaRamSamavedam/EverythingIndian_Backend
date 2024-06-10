import mongoose from 'mongoose';
import Product from './productSchema.js';  // Adjust the path as necessary
import User from './userSchema.js';        // Adjust the path as necessary

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: Number,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: String,
    // ref: 'User',
    required: true,
  },
  items: [cartItemSchema],
});

cartSchema.pre('save', async function (next) {
  const cart = this;
  
  try {
    // Validate each productId in the cart items
    const us = User.findOne({email:cart.user});
    if(!us){
        throw new Error("no such user exists");
    }
    for (const item of cart.items) {
      const product = await Product.findOne({ productId: item.productId });
      if (!product) {
        throw new Error(`Product with productId ${item.productId} not found`);
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;


