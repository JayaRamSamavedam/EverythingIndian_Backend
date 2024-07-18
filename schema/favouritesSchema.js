import mongoose from "mongoose";
import Product from "./productSchema.js";
const favouritesSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    products:{
        type:[Number],
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
            const product = Product.findOne({productId:productId});
            if(product){
            favourites.products.push(productId);
            }
            else{
                throw new Error("In valid Product Id");
            }
        }

        await favourites.save();
        return favourites;
    } catch (error) {
        throw error;
    }
};


favouritesSchema.statics.AddandDelete = async function(email, productId) {
    console.log("I have been called");
    let message = "";
    try {
        let favourites = await this.findOne({ email });
        if (!favourites) {
            const product = await Product.findOne({productId:productId});
            if (product) {
                favourites = new this({ email, products: [productId] });
                message = "added product to favourites";
                await favourites.save();
            } else {
                throw new Error("Invalid Product Id");
            }
        } else {
            const productIndex = favourites.products.indexOf(productId);
            if (productIndex > -1) {
                favourites.products.splice(productIndex, 1);
                message = "product removed from favourites";
            } else {
                const product = await Product.findOne({productId:productId});
                if (product) {
                    favourites.products.push(Number(productId));
                    message = "added product to favourites";
                } else {
                    throw new Error("Invalid Product Id");
                }
            }
            await favourites.save();
        }
        return message;
    } catch (error) {
        throw error;
    }
};


favouritesSchema.statics.isFavourite = async function(email,productId){
    try{
        const favourites = await this.findOne({email});
        if(!favourites) return false;
        else{
            if(favourites.products.includes(productId)){
                return true;
            }
            return false;
        }
    }catch(error){
        return false;
    }
    return false;
}
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

const Favourites = mongoose.model("Favourites",favouritesSchema);
export default Favourites;