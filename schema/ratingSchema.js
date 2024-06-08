import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Assuming you have a User model
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',  // Assuming you have a Product model
    required: true,
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

const Rating = mongoose.model('Rating', ratingSchema);
export default Rating;
