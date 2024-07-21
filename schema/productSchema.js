import mongoose from 'mongoose';
import Counter from './productCounterSchema.js';
import ItemType from './itemtypeSchema.js';
import Category from './categorySchema.js';
import { noSniff } from 'helmet';
import Brand from './brandSchema.js';
import SubcategorySchema from './subcategorySchema.js';
const productSchema = new mongoose.Schema({
  brandname:{
    type:String,
    unique:true,
  },
  priority:{
    type:Number,
    default:0,
  },
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
  views:{
    type:Number,
    default:0,
  },
  purchases:{
    type:Number,
    default:0,
  },
  quantity:{
    type:Number,
    required:true,
  },
  itemType: {
    type: String,
    required: true,
  },
  subcategories:{
    type:[String],
    required:false,
  },
  hotDeals:{
    type:Boolean,
    default:false,
  },
  rating:{
    type:Number,
    default:5,
  }
},{timestamps:true});

productSchema.index({ 
  name: 'text', 
  category: 'text', 
  subcategories: 'text', 
  description: 'text', 
  brandname: 'text' 
});

productSchema.pre('save', async function (next) {
  const product = this;
  if (!product.isNew) {
    return next();
  }
  try {
    const cat = await Category.findOne({ name: product.category });
    if (!cat) {
      throw new Error("Category is invalid");
    }
    const ite = await ItemType.findOne({ name: product.itemType });
    if (!ite) {
      throw new Error("Item Type is invalid");
    }
    const brand = await Brand.findOne({name:product.brandname});
    if(!brand){
      throw new Error("brand is invalid");
    }
    // const subcat = await SubcategorySchema.find({category:product.category});
    if (product.subcategories.length !== 0) {
      try {
        const subcat = await SubcategorySchema.find({ category: product.category });
        const subcatNames = subcat.map(item => item.name); // Assuming 'name' is the field containing the subcategory string
    
        const allStringsPresent = product.subcategories.every(str => subcatNames.includes(str));
    
        if (allStringsPresent) {
          console.log('All strings are present in the subcategories.');
        } else {
          console.log('Not all strings are present in the subcategories.');
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    } else {
      console.log('No subcategories to check.');
    }

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
