import mongoose from "mongoose";
import Brand from "./brandSchema.js";


const BrandSponsersSchema = mongoose.Schema({
    Brand:{
        type:String,
        required:true,
    },
    priority:{
        type:Number,
        required:true
    }
});

BrandSponsersSchema.pre("save",async function(next){
    const brand = this
    try{
        const Br= await Brand.findOne({name:brand.Brand});
        if(!Br){
            throw new Error("Brand not found");
        }
        next();
    }
    catch(error){
        throw new Error(error);
    }
})

const BrandSponser = mongoose.model("BrandSponsers",BrandSponsersSchema);

export default BrandSponser;