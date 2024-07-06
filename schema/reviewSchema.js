import mongoose from 'mongoose';
import Product from './productSchema.js';  // Adjust the path as necessary
import User from './userSchema.js';        // Adjust the path as necessary
import validator from 'validator';

const ReviewSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        validate(value) {
          if (!validator.isEmail(value)) {
            throw new Error("Not a valid email");
          }
        },
      },
      productId:{
        type:Number,
        required:true
      },
   image: {
    type: String,
   },
   text: {
    type: String,
   },
   rating: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return value >= 0 && value <= 5;
      },
      message: props => `${props.value} is not a valid rating. Rating must be between 0 and 5.`
    }
  }
});

ReviewSchema.pre('save', async function (next) {
  const comment = this;
  
  try {
    // Validate each productId in the cart items
    const us = User.findOne({email:comment.email});
    if(!us){
        throw new Error("no such user exists");
    }
    const pr = Product.findOne({productId:comment.productId});
    if(!pr){
        throw new Error("no such product exists");
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Review = mongoose.model('Review', ReviewSchema);

export default Review;


