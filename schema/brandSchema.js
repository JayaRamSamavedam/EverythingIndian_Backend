import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
      },
      proImage:{
        type:String,
      },
      discount:{
        type:Number,
        default:0,
      },
      link:{
        type:String,
      }
});

brandSchema.pre("save", async function (next) {
  
    this.link=`/${this.name}`;
    next();
});

const Brand = mongoose.model('Brand', brandSchema);

export default Brand;