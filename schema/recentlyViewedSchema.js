import mongoose from "mongoose";

// Define a sub-schema for products
const productSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product' // Assuming you have a Product model
    },
    viewedAt: {
        type: Date,
        default: Date.now
    }
});

const recentlyViewedSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    products: {
        type: [productSchema],
        required: true
    }
});

// Static method to create or update recently viewed products
recentlyViewedSchema.statics.createOrUpdate = async function(email, productInfo) {
    try {
        const product = {
            productId: productInfo._id || productInfo.id, // Assuming the product info contains _id or id field
            viewedAt: new Date()
        };
        const record = await this.findOneAndUpdate(
            { email: email },
            { $push: { products: product } },
            { new: true, upsert: true }
        );
        return record;
    } catch (error) {
        throw new Error('Error creating or updating recently viewed products: ' + error.message);
    }
};

// Static method to get recently viewed products by email
recentlyViewedSchema.statics.getByEmail = async function(email) {
    try {
        const record = await this.findOne({ email: email });
        if (!record) {
            throw new Error('No recently viewed products found for this email');
        }
        return record;
    } catch (error) {
        throw new Error('Error retrieving recently viewed products: ' + error.message);
    }
};

const RecentlyViewed = mongoose.model('RecentlyViewed', recentlyViewedSchema);
export default RecentlyViewed;
