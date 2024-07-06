import mongoose from "mongoose";
import Product from "./productSchema";
const favourites = mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:truess
    },
    products:{
        type:[String],
    }
});
// Add a product to the favourites
favouritesSchema.statics.addToFavourites = async function(email, productId) {
    try {
        let favourites = await this.findOne({ email });

        if (!favourites) {
            favourites = new this({ email, products: [productId] });
        } else {
            if (favourites.products.includes(productId)) {
                throw new Error("Product already in favourites");
            }
            favourites.products.push(productId);
        }

        await favourites.save();
        return favourites;
    } catch (error) {
        throw error;
    }
};

// Remove a product from the favourites
favouritesSchema.statics.removeFromFavourites = async function(email, productId) {
    try {
        const favourites = await this.findOne({ email });

        if (!favourites) {
            throw new Error("No favourites found for this user");
        }

        favourites.products = favourites.products.filter(p => p !== productId);

        await favourites.save();
        return favourites;
    } catch (error) {
        throw error;
    }
};

const Favourites = mongoose.model("Favourites",favourites);
export default Favourites;