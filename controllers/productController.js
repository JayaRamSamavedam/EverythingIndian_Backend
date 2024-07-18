import Product from '../schema/productSchema.js';
import Category from '../schema/categorySchema.js';
import ItemType from '../schema/itemtypeSchema.js';
// import { Promise, Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import { query } from 'express';
import Review from '../schema/reviewSchema.js';
import Users from '../schema/userSchema.js';
// import Brand from '../schema/brandSchema.js';
import RecentlyViewed from '../schema/recentlyViewedSchema.js';
import BrandSponser from '../schema/BrandSponsersSchema.js';
import Brand from '../schema/brandSchema.js';
import Subcategory from '../schema/subcategorySchema.js';
import Favourites from '../schema/favouritesSchema.js';
// import Category from '../schema/categorySchema.js';
// import Product from '../schema/productSchema.js';


export const createCategory = async (req, res) => {
  const { name ,proImage,discount} = req.body;
  try {
    const precat = await Category.findOne({ name });
    if (precat) {
      return res.status(400).json({ error: "This category already exists in our database" });
    }
    const cat = new Category({ name,proImage,discount });
    const savecat = await cat.save();
    return res.status(201).json(savecat);
  } catch (error) {
    return res.status(400).json({ error: "Please provide the name", details: error.message });
  }
};

export const setPriorityByBrand = async (req, res) => {
  const { brandname, priority } = req.body;
  
  try {
    const brand = await Brand.findOne({ name: brandname });
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    const products = await Product.find({ brandname: brandname });
    const updatedProducts = await Promise.all(products.map(async product => {
      
      
      product.priority = priority;
      await product.save();
      return product;
    }));

    res.status(200).json({ message: 'Priority updated for all products', updatedProducts });
  } catch (error) {
    console.error('Error updating products:', error);
    res.status(500).json({ message: 'An error occurred', error });
  }
};
export const resetPriorityByBrand = async (req, res) => {
  const { brandname, priority } = req.body;
  
  try {
    const brand = await Brand.findOne({ name: brandname });
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    if(!priority){
      priority = 0;
    }
    const products = await Product.find({ brandname: brandname });
    const updatedProducts = await Promise.all(products.map(async product => {
      product.priority = priority;
      await product.save();
      return product;
    }));

    res.status(200).json({ message: 'Priority updated for all products', updatedProducts });
  } catch (error) {
    console.error('Error updating products:', error);
    res.status(500).json({ message: 'An error occurred', error });
  }
};


export const createItemType = async (req, res) => {
  const { name } = req.body;
  try {
    const preItemType = await ItemType.findOne({ name });
    if (preItemType) {
      return res.status(400).json({ error: "This item type already exists in our database" });
    }
    const itemType = new ItemType({ name });
    const saveItemType = await itemType.save();
    return res.status(201).json(saveItemType);
  } catch (error) {
    return res.status(400).json({ error: "Please provide the name", details: error.message });
  }
};



export const createProduct = async (req, res) => {
// console.log(req);
  const { name, coverImage, images,category,description,subcategories, price, discount, itemType ,quantity,brandname} = req.body;
  try {
    
    // Find category and item type

    // Create new product
    const newProduct = new Product({
      name:name,
      coverImage: coverImage,
      images: images,  
      category: category,
      description:description,
      price:price,
      discount:discount,
      discountedPrice: price - (price * discount / 100),
      itemType: itemType,
      quantity:quantity,
      brandname:brandname,
      subcategories:subcategories
    });
    const savedProduct = await newProduct.save();
    return res.status(201).json(savedProduct);
  } catch (error) {
    return res.status(500).json({ error: 'Error creating product', details: error.message });
  }
};


export const getAllItemTypes = async(req,res)=>{
  try{
   const Items = await ItemType.find();
   return res.status(200).json({Items});
  }
  catch(error){
    return res.json({error});
  }
}

export const createBrand = async(req,res)=>{
  const {name,proImage,discount,} = req.body;
  if(!name) return res.json({error:"kindly fill all the details"});
  try{
    const cb = new Brand({name,proImage,discount});
    await cb.save();
    return res.status(200).json("brand created sucssfully");
  }
  catch(error){
    return res.json({error});
  }
}
export const getAllBrands = async (req,res)=>{
  try{
    const Brands = await Brand.find();
    return res.status(200).json(Brands)
  }
  catch(error){
    return res.json({error:error});
  }
}
export const getProductsByBrand = async(req,res)=>{
  // console.log(req.body)
  const {brandname} = req.params;
  console.log(brandname)
  // console.log(brandname)
  try{
    const brand = await Brand.findOne({name:brandname});
    console.log(brand)
    if(!brand){
      return res.json({error:"brand not found"});
    }
    const products = await Product.find({brandname:brandname});
    console.log(products)
    const updatedProducts = products.map(product => {
      const updatedProduct = product.toObject();
      updatedProduct.price = updatedProduct.price * req.Currency;
      return updatedProduct;
  });
  console.log(updatedProducts)
  return res.status(200).json(updatedProducts);
  }
  catch(error){
    return res.json({error:error});
  }
}


export const getAllCategories  = async (req,res)=>{
  try{
    const categories = await Category.find();
    return res.status(200).json({categories});
  }
  catch(error){
    return res.json(error);
  }
}
export const editProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category,description, price, discount, itemType, imagesToDelete, newImages, coverImage ,quantity,brandname,priority,subcategories} = req.body;
  try {
    // Find the product by ID
    const product = await Product.findOne({ productId: Number(id) });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Prepare updates object
    const updates = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (price) updates.price = price;
    if (discount) updates.discount = discount;
    if (coverImage) updates.coverImage = coverImage;
    if(quantity)updates.quantity=quantity;
    if(brandname){
      const brand = await Brand.findOne({name:brandname});
      if(brand){
        updates.brandname = brandname;
      }
    }
    if(priority){
      updates.priority = priority;
    }

    // Update category if provided
    if (category) {
      const cat = await Category.findOne({ name: category });
      if (cat) {
        updates.category = category; // Assuming category has an _id field
      } else {
        return res.status(404).json({ error: 'Category not found' });
      }
    }

    // Update item type if provided
    if (itemType) {
      const ite = await ItemType.findOne({ name: itemType });
      if (ite) {
        updates.itemType = itemType; // Assuming itemType has an _id field
      } else {
        return res.status(404).json({ error: 'Item type not found' });
      }
    }

    // Handle image deletion
    if (imagesToDelete && imagesToDelete.length > 0) {
      // Filter out images marked for deletion
      updates.images = product.images.filter(image => !imagesToDelete.includes(image));
    }

    if(subcategories){
      updates.subcategories = subcategories
     }
    // if(newsubcategories && newsubcategories.length > 0){
    //   updates.subcategories = [...product.subcategories,...newsubcategories];
    // }
    // Upload new images if any and add to the product's image array
    if (newImages && newImages.length > 0) {
      // Assuming newImages are URLs or identifiers for new images
      updates.images = [...product.images, ...newImages];
    }

    if (price || discount) {
      const updatedPrice = price || product.price;
      const updatedDiscount = discount || product.discount;
      updates.discountedPrice = updatedPrice - (updatedPrice * updatedDiscount) / 100;
    }

    // Apply updates to the product
    Object.assign(product, updates);
    const updatedProduct = await product.save();

    return res.status(200).json(updatedProduct);
  } catch (error) {
    return res.status(500).json({ error: 'Error editing product', details: error.message });
  }
};



export const getAllProducts= async(req,res)=>{
   let query = {}
  try{
    const {category} = req.body;
  if(category){
    const cat = await Category.findOne({name:category});
    if(cat)
    query.category = category;
  else{
    return res.status(400).json({error:"category is invalid"});
  }   
  }
console.log("I am safe")
  const products = await Product.find(query);
  const updatedProducts = products.map(product => {
    const updatedProduct = product.toObject();
    updatedProduct.price = updatedProduct.price * req.Currency;
    return updatedProduct;
});
  console.log("i am invoked");
  return res.status(200).json(updatedProducts);
  }
  catch(e){
    res.status(400).json({error:e});
  }
};

export const getProductById = async(req,res)=>{
  try{
    const {id} = req.params;
    
    console.log("id",id);
    if (!id){
      return res.status(400).json({error:"id not found "});
    }
    console.log("abcd")
    const product = await Product.findOne({"productId":id});
    console.log("pqrst")
    if(!product){
      return res.status(400).json({error:"invalid product id"});
    }
    if(req.user){
      const abcd = await RecentlyViewed.createOrUpdate(req.user.email,product);
    }
    const updatedProduct = product.toObject();
        updatedProduct.price = updatedProduct.price * req.Currency;
    return res.status(200).json(updatedProduct);
  }
  catch(e){
    return res.status(500).json(e);
  }
}


export const deleteProductByID = async(req,res)=>{
  try{
const id = req.params.id;
if(!id){
  return res.json({error:"id not found"});
}
console.log(id);
const prod = await Product.findOneAndDelete({productId:Number(id)});
return res.json({message:"product successfully deleted"});
  }
  catch(error){
    return res.json({error:"product not found"});
  }
}
export const sortPriceProduct = async(req, res) => {
  try {
    const { order, category } = req.body;
    let filters = {};
    
    if (category) {
      const cat = await Category.findOne({ name: category });
      if (cat) {
        filters.category = category;
      } else {
        return res.status(400).json({ error: "Invalid category" });
      }
    }
    
    let sortCriteria = {};
    if (order === 'asc') {
      sortCriteria.price = 1; // Ascending order
    } else if (order === 'desc') {
      sortCriteria.price = -1; // Descending order
    }
    
    const products = await Product.find(filters).sort(sortCriteria);
    const updatedProducts = products.map(product => {
      const updatedProduct = product.toObject();
      updatedProduct.price = updatedProduct.price * req.Currency;
      return updatedProduct;
  });
    return res.status(200).json(updatedProducts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};




export const fetchProducts = async (req, res) => {
  const { category, minPrice, maxPrice, sortBy, orderBy } = req.query;

  // Construct the filter object
  const filter = {};
  if (category) {
    filter.category = category;
  }
  if (minPrice !== undefined) {
    filter.price = { ...filter.price, $gte: Number(minPrice) };
  }
  if (maxPrice !== undefined) {
    filter.price = { ...filter.price, $lte: Number(maxPrice) };
  }

  // Construct the sort object
  const sort = {};
  if (sortBy) {
    const sortOrder = orderBy && orderBy.toLowerCase() === 'desc' ? -1 : 1;
    sort[sortBy] = sortOrder;
  }
  console.log(filter)

  try {
    const products = await Product.find().sort(sort);
    console.log(products)
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//review 
export const createReview=async (req,res)=>{
  const {email,productId,image,text,rating} = req.body;
  
  if(!email || !productId){
    return res.json({error:"missing values "})
  }
  try{
    const user = await Users.findOne({email:email});
    if(!user){
      return res.status(400).json({error:"user not found"});
    }
    if(req.user !== user && req.user.role !== "admin"){
      return res.status(400).json({error:"forbidden"});
    }
    const prod = await Product.findOne({productId:id});
    if(!prod){
      return res.status(400).json({error:"product not found"});
    }
    // const ratings = Review.find({productId:productId})

    const rev = new Review({
      email:email,
      productId:productId,
      text:text,
      rating:rating
    });
    const review = await rev.save();
    res.status(200);
  }
  catch(Error){
    res.status(500).json({error:Error});
  }
}

export const deleteReview = async(req,res)=>{
  const {email,productId} = req.body;
  if(!email || !productId){
    return res.status(404).json({error:"missing details"});
  }

  try{
    const user = await Users.findOne({email:email});
    if(!user){
      return res.status(400).json({error:"user not found"});
    }
    if(req.user !== user && req.user.role!=="admin" ){
      return res.status(400).json({error:"forbidden"});
    }
    const product = await Product.findOne({productId:productId});
    if(!product){
      return res.status(400).json({error:"product not found"});
    }
    const rev = await Review.findOneAndDelete({email:email,productId:productId});
    return res.status(200).json({message:"Review Deleted SucessFully"});
  }
  catch(error){
    return res.status(500).json({error:error});
  }
}

export const deleteComment = async(req,res)=>{
  const {email,productId} = req.body;
  
  if(!email || !productId){
    return res.status(404).json({error:"missing details"});
  }

  try{
    const user = await Users.findOne({email:email});
    if(!user){
      return res.status(400).json({error:"user not found"});
    }
    if(req.user !== user && req.user.role!=="admin" ){
      return res.status(400).json({error:"forbidden"});
    }
    const product = await Product.findOne({productId:productId});
    if(!product){
      return res.status(400).json({error:"product not found"});
    }
    const rew = await Review.findOneAndUpdate({email:email,productId:productId},{text:""})
    return res.status(200).json({message:"comment deleted sucessfully"});
  }
  catch(Error){
    return res.status(500).json({error:Error});
  }

}

export const getReviewByUser = async(req,res)=>{
  const {productId} = req.body;
   
  if( !productId){
    return res.status(404).json({error:"missing details"});
  }

  try{
    
    if(req.user  ||  req.user.role!=="admin" ){
      return res.status(400).json({error:"forbidden"});
    }
    const product = await Product.findOne({productId:productId});
    if(!product){
      return res.status(400).json({error:"product not found"});
    }
    const review = await Review.findOne({email:req.user.email,productId:productId})
    return res.status(200).json({review});
  }
  catch(Error){
    return res.status(500).json({error:Error});
  }
}

// get reviews by product

export const getReviewsByProduct = async(req,res)=>{
  const p = req.params.productId;
  console.log(p)
 const productId = Number(p);
  if(!productId){
    return res.status(400).json({error:"product id not found"});
  }
  try{
    const review = await Review.findOne({productId:productId});
    if(!review){
      return res.status(200).json({error:"no comments to load"});
    }
    return res.status(200).json({review});
  }
  catch(error){
    return res.status(500).json({error});
  }
} 

// edit comment
export const editComment = async(req,res)=>{
  const {productId} = req.params;
  const {rating , comment} = req.body;
  if(!productId) return res.status(400).json({error:"product id not found"});
  try{
    const updates = {};
    if(rating){
      updates[rating] = rating;
    }
    if(comment){
      updates[comment]= comment;
    }
    const product=  await Product.findOne({productId:productId});
    if(!product){
      return res.status(400).json({error:"product not found"});
    }
    const review = await Review.findOneAndUpdate({email:req.user.email,productId:productId});
    if(!review){
      return res.status(400).json({error:"no comments exist assocaited with user"});
    }
    return res.status(200).json({message:"Review edited sucessfully"});
  }
  catch(error){
    return res.status(500).json({error});
  }
}

export const createBrandSponsers = async (req,res)=>{
  const {brand,priority} = req.body;
  try{
    const br = new BrandSponser({ brand,priority });
    const savebrand = await brand.save();
    const products = await Product.find({brandname:brand});
    const updatedProducts = await Promise.all(products.map(async product => {
      product.priority = priority;
      await product.save();
      return product;
    }));
  }
  catch(Error){
    return res.json(Error);
  }
};

export const removeBrandSponsers = async(req,res)=>{
  const {brand} = req.body;
  try{
    const br = await BrandSponser.findOne({Brand:brand});
    if(!br){
      return res.status(400).json({error:"brand not found"});
    }
    const products = await Product.find({brandname:brand});
    const updatedProducts = await Promise.all(products.map(async product => {
      product.priority = 0;
      await product.save();
      return product;
    }));
    const del = await BrandSponser.findOneAndDelete({Brand:brand});
    return res.status(200).json({message:"removed the brand sponsers sucessfully"});
  }
  catch(error){
    return res.status(500).json({error});
  }
}


export const makeProductHotDeal = async (req,res)=>{
  const {id} = req.body;
  try{
    const product = await Product.findOneAndUpdate({productId:id},{hotDeals:true});
    if(!product){
      return res.json({error:"product not found"});
    }
    
  }
  catch(error){
    return res.status(500).json(error);
  }
}

export const removeHotDeal = async(req,res)=>{
  const {id} = req.body;
  try{
    const product = await Product.findOneAndUpdate({productId:id},{hotDeals:false});
    if(!product){
      return res.json({error:"product not found"});
    }
    
  }
  catch(error){
    return res.status(500).json(error);
  }
}


export const editBrand = async (req, res) => {
  let { brandname, newbrandname, proImage, discount } = req.body;
  const updates = {};

  try {
    if (brandname && newbrandname) {
      const products = await Product.find({ brandname: brandname });

      const B = await Brand.findOneAndUpdate({ name: brandname }, { name: newbrandname });
      
      if (!B) {
        return res.json({ error: "Brand not found" });
      }
      brandname=newbrandname;

      if (products.length > 0) {
        const updatedProducts = await Promise.all(
          products.map(async product => {
            product.brandname = newbrandname;
            await product.save();
            return product;
          })
        );
      }

      brandname = newbrandname;
    }

    const brand = await Brand.findOne({ name: brandname });
    if (!brand) {
      return res.json({ error: "Brand not found" });
    }

    if (proImage) updates.proImage = proImage;
    if (discount) updates.discount = discount;

    const updatedBrand = await Brand.findOneAndUpdate({ name: brandname }, updates);

    return res.json({ message: "Products are updated successfully", updatedBrand });
  } catch (error) {
    return res.json({ error: error.message });
  }
};


// export const editBrandName= async (req,res)=>{
  
//   try{

    
//     return res.status(200).json({message:"brandname sucessfully edited"});
//   }
//   catch(error){
//     return res.json(error);
//   }
// };
export const deleteBrand = async (req, res) => {
  console.log("Received request to delete brand");
  const { brandname } = req.body;

  if (!brandname) {
    console.log("Brand name not provided");
    return res.status(400).json({ message: 'Brand name is required' });
  }

  try {
    const brand = await Brand.findOneAndDelete({ name: brandname });

    if (brand) {
      console.log("Brand found and deleted:", brandname);
      const products = await Product.find({ brandname: brandname });
      console.log("Products associated with the brand:", products.length);

      const deletedProducts = await Promise.all(products.map(async product => {
        await product.deleteOne();
        return product.productId; // Returning the ID of the deleted product
      }));

      console.log("All associated products deleted");

      return res.status(200).json({
        message: 'Brand and its products deleted successfully',
        deletedProducts: deletedProducts,
      });
    } else {
      console.log("Brand not found:", brandname);
      return res.status(404).json({ message: 'Brand not found' });
    }
  } catch (error) {
    console.log("Error occurred during deletion:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCategory = async(req,res)=>{
  const {name}= req.params;
  console.log(typeof(name))
  if(!name) return res.status(400).json({"message":"name is not present"});
  try{
    const category = await Category.findOne({name:name});
    console.log(category)
    return res.status(200).json({category});
  }
  
  catch(error){
    console.log("hi")
    return res.status(500).json({error});
  }
}

export const editCategory = async (req, res) => {
  console.log("Endpoint hit: editCategory");

  let { category, newcategory, proImage, discount } = req.body;
  console.log("Request body:", req.body);

  if (!category) {
    console.log("Error: category not provided");
    return res.status(400).json({ error: "Category not provided" });
  }

  try {
    if (category && newcategory) {
      console.log(`Updating category name from ${category} to ${newcategory}`);
      const cate = await Category.findOneAndUpdate({ name: category }, { name: newcategory });
      category = newcategory;
      if (!cate) {
        console.log("Error: category not found");
        return res.json({ error: "Category not found" });
      }

      console.log(`Finding products with category: ${category}`);
      const prods = await Product.find({ category: category });
      
      if (prods.length > 0) {
        console.log(`Found ${prods.length} products. Updating categories...`);
        
        const updatedproducts = await Promise.all(prods.map(async prod => {
          prod.category = newcategory;
          await prod.save();
          return prod;
        }));
        console.log("Products updated successfully");
      } else {
        console.log("No products found with the given category");
      }
    }

    const updates = {};
    if (proImage) updates.proImage = proImage;
    if (discount) updates.discount = Number(discount);

    if (Object.keys(updates).length > 0) {
      console.log("Updating category with additional fields:", updates);
      const newcat = await Category.findOneAndUpdate({ name: category }, updates);
    }

    console.log("Category updated successfully");
    return res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    console.log("Error occurred:", error);
    return res.status(500).json({ error });
  }
};



// subcategories

// create
export const creatSubcategory = async (req,res)=>{
  const {category,name,proImage,discount}=req.body;

  try{
    if(!discount){
      discount=0;
    }
    const sub = new Subcategory({category,name,proImage,discount});
    const savesub = await sub.save();
    return res.status(200).json(savesub);
  }
  catch(error){
    return res.status(500).json({error});
  }
}

// update
export const editSubcategory = async (req,res)=>{
  let {oldname,newname,proimage,discount,category}=req.body;
  try{
    const updates={}
    if(proimage) updates.proimage = proimage;
    if(discount) updates.discount = discount;
    if(category) updates.category = category;
    if(oldname && newname){
      await Subcategory.updateSubcategoryName(oldname,newname);
      oldname=newname;
      const sub = await Subcategory.findOneAndUpdate({name:newname},updates);
    }
    const sub = await Subcategory.findOneAndUpdate({name:newname},updates);
    return res.status(200).json({message:"subcategory changed sucessfully"});
  }
  catch(error){
    return res.json(error);
  }
}

// delete
export const deletedsubcategories = async(req,res)=>{
  const {name} = req.body;
  try{
    const sub = await Subcategory.findOneAndDelete({name:name});
 return res.status(200).json({message:"deleted the subcategory successfully"})
  }
  catch(error){
return res.status(500).json({error});
  }
}

// get all subcategories

export const getAllSubCategories = async(req,res)=>{
  try{
    const subcategories = await Subcategory.find();
    return res.status(200).json({subcategories})
  }
  catch(error){
    return res.status(500).json({error})
  }
}

export const productsWithHotdeal = async (req,res)=>{
  try{
    const products = await Product.find({hotDeals:true});
    const updatedProducts = products.map(product => {
      const updatedProduct = product.toObject();
      updatedProduct.price = updatedProduct.price * req.Currency;
      return updatedProduct;
  });
  return res.status(200).json(updatedProducts)
  }
  catch(error){
    return res.json({error});
  }
}

// export const RecentlyViewedProducts = async(req,res)=>{
//   try{

//   }
// }

export const getAllbrandsponsers = async(req,res)=>{
  try{
    const brandsponsers = await BrandSponser.find();
    return res.status(200).json({brandsponsers});
  }
  catch(error){
    return res.status(500).json({error})
  }
}

export const getallroles = async(req,res)=>{
  try{

  }
  catch(error){

  }
}


export const deleteCategory = async (req, res) => {
  const { category } = req.body;
  
  try {
    const cat = await Category.findOneAndDelete({ name: category });
    
    if (cat) {
      const products = await Product.find({ category: category });
      
      const deletedProducts = await Promise.all(products.map(async product => {
        await product.deleteOne();
        return product.productId; // Returning the ID of the deleted product
      }));

      return res.status(200).json({
        message: 'Category and its products deleted successfully',
        deletedProducts: deletedProducts,
      });
    } else {
      return res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const getBrandByName = async(req,res)=>{
  const {name} = req.params;
  try{
    const brand = await Brand.findOne({name:name});
    if(!brand){
      return res.json({error:"brand not found"});
    }
    return res.json(brand);
  }
  catch{
    return res.json({error:"catched error"});
  }
}

export const getSubCategoryByCategory = async(req,res)=>{
  const {category} = req.params;
  if(!category) return res.json({error:"category not found"});
  try{
    const subcategories = await Subcategory.find({category:category});
    return res.json(subcategories);
  }
  catch(Error){
    return res.json({error:Error.message});
  }
}

export const getProductsByCategory = async(req,res)=>{
  let {cate} = req.params;
  if(!cate){
    return res.json({"error":"category not found"});
  }
  try{
    const cat = await Category.findOne({name:cate});
    if(!cat){ return res.json({error:"category not found"});}
    const products = await Product.find({category:cat.name});
    
      const updatedProducts = products.map(product => {
        const updatedProduct = product.toObject();
        updatedProduct.price = updatedProduct.price * req.Currency;
        return updatedProduct;
    });
    return res.json(updatedProducts);
  }
  catch(error){
    return res.json({"error":error});
  }
}

export const AddAndRemoveFavourites = async(req,res)=>{
  const {productId} = req.params;
  console.log("Hellow major")
  if(!productId)return res.json({error:"product Id not found"});
  try{
    console.log("hello surya");
   let message =  await Favourites.AddandDelete(req.user.email,productId);
   console.log(message);
   console.log("hello surya")
   return res.json({message:message})

  }
  catch(error){
    return res.status(500).json({"error":error.message});
  }
}



export const FavouriteProducts = async (req, res) => {
  try {
      const fav = await Favourites.findOne({ email: req.user.email });
      if (!fav || !fav.products.length) {
          return res.status(404).json({ message: "No favourite products found" });
      }

      // Fetch the product details for each product ID in the favourites
      const products = await Promise.all(fav.products.map(async (productId) => {
          const product = await Product.findOne({productId:productId});
          const updatedProduct = product.toObject();
          updatedProduct.price = updatedProduct.price * req.Currency;
          return updatedProduct;
      }));


      res.status(200).json( products );
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const filters = async (req, res) => {
  try {
    const {
      minPrice,
      maxPrice,
      rating,
      brand,
      category,
      subcategory, // Added subcategory
      minDiscount,
      maxDiscount,
      hotDeals,
      sortBy,
      order
    } = req.query;
    console.log(req.query);
    let filter = {};
    
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (rating) filter.rating = { $gte: Number(rating) };
    if (brand) filter.brandname = brand;
    if (category) filter.category = category;
    if (subcategory) filter.subcategories = { $in: subcategory.split(',') }; 
    // console.log("hello filter")
    if (minDiscount) filter.discount = { ...filter.discount, $gte: Number(minDiscount) };
    if (maxDiscount) filter.discount = { ...filter.discount, $lte: Number(maxDiscount) };
    if (hotDeals && hotDeals !== 'false') filter.hotDeals = true;

    let sort = {};
    if (sortBy) sort[sortBy] = order === 'desc' ? -1 : 1;
    console.log(filter);
    const products = await Product.find(filter).sort(sort);

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const searchProducts = async (searchTerm) => {
  try {
    const regex = new RegExp(searchTerm, 'i'); // 'i' makes it case-insensitive
    const results = await Product.find({
      $or: [
        { name: regex },
        { category: regex },
        { subcategories: regex },
        { description: regex },
        { brandname: regex }
      ]
    });
    return results;
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
};


export const search =  async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).send('Query parameter "q" is required');
  }
  try {
    const products = await searchProducts(q);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while searching for products' });
  }
};
