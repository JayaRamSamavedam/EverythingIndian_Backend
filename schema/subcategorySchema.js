import mongoose from 'mongoose';
import Category from './categorySchema.js';
import Product from './productSchema.js';

const subcategorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    unique: true,
    required: true,
  },
  proImage: {
    type: String,
  },
  discount: {
    type: Number,
    default:0,
  },
  link: {
    type: String,
  },
}, { timestamps: true });

subcategorySchema.pre("save", async function (next) {
  try {
    const category = await Category.findOne({ name: this.category });
    if (!category) {
      throw new Error("Category not found");
    }
    this.link = `/${this.category}/${this.name}`;
  } catch (error) {
    next(error);
  }
  next();
});

// Middleware to handle the deletion of subcategory references in products
subcategorySchema.pre('findOneAndDelete', async function (next) {
  try {
    const subcategory = await this.model.findOne(this.getFilter());
    if (!subcategory) {
      throw new Error("Subcategory not found");
    }

    // Remove subcategory reference from all products
    await Product.updateMany(
      { subcategories: subcategory.name },
      { $pull: { subcategories: subcategory.name } }
    );

    next();
  } catch (error) {
    next(error);
  }
});

// Static method to update the subcategory name
subcategorySchema.statics.updateSubcategoryName = async function (oldName, newName) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const subcategory = await this.findOne({ name: oldName }).session(session);
    if (!subcategory) {
      throw new Error("Subcategory not found");
    }

    subcategory.name = newName;
    await subcategory.save({ session });

    await Product.updateMany(
      { subcategories: oldName },
      { $set: { "subcategories.$": newName } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

export default Subcategory;
