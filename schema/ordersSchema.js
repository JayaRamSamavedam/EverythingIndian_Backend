import mongoose from 'mongoose';
import Product from './productSchema.js';
import User from './userSchema.js';

const orderStatusEnum = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: Number,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const paymentDetailsSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Completed', 'Failed'],
  },
});

const shipmentAddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    enum: orderStatusEnum,
    default: 'Pending',
  },
  orderStatusMessage:{
    type:String,
    required:true,
  },
  paymentDetails: paymentDetailsSchema,
  shipmentAddress: shipmentAddressSchema,
  shipmentCharges: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
},{timestamps:true});

orderSchema.pre('save', async function (next) {
  try {
    const order = this;

    // Validate each productId in the order items
    for (const item of order.items) {
      const product = await Product.findOne({ productId: item.productId });
      if (!product) {
        throw new Error(`Product with productId ${item.productId} not found`);
      }
      item.price = product.discountedPrice * item.quantity;
    }
    order.totalAmount = order.items.reduce((total, item) => total + item.price, 0);
    next();
  } catch (error) {
    next(error);
  }
});
orderSchema.statics.getUniqueProductsPurchasedByUser = async function (userId) {
  try {
    const orders = await this.find({ user: userId });
    const productIds = new Set();

    orders.forEach(order => {
      order.items.forEach(item => {
        productIds.add(item.productId);
      });
    });

    const uniqueProducts = await Product.find({ productId: { $in: Array.from(productIds) } });
    return uniqueProducts;
  } catch (error) {
    throw new Error(error.message);
  }
};
const Order = mongoose.model('Order', orderSchema);
export default Order;
