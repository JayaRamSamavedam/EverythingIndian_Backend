import Product from '../schema/productSchema.js';
import Category from '../schema/categorySchema.js';
import ItemType from '../schema/itemtypeSchema.js';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import { query } from 'express';


export const createCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const precat = await Category.findOne({ name });
    if (precat) {
      return res.status(400).json({ error: "This category already exists in our database" });
    }
    const cat = new Category({ name });
    const savecat = await cat.save();
    return res.status(201).json(savecat);
  } catch (error) {
    return res.status(400).json({ error: "Please provide the name", details: error.message });
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
console.log(req);
  const { name, coverImage, images,category,description, price, discount, itemType } = req.body;
  // const name = req.body.name;
  // const coverImage= req.body.coverImage;
  // const images=req.body.images;
  // const description=req.body.description;
  // const category=req.body.category;
  // const price=req.body.discount;
  // const itemType=req.body.itemType;
  // const discount=req.body.discount;
  try {
    
    // Find category and item type
    console.log(category)
    const cat = await Category.findOne({ name: category });
    const ite = await ItemType.findOne({ name: itemType });

    // Validate category and item type
    if (!cat) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    if (!ite) {
      return res.status(400).json({ error: 'Invalid item type' });
    }

    // Create new product
    const newProduct = new Product({
      name:name,
      coverImage: coverImage,
      images: images,  
      category: cat._id,
      description:description,
      price:price,
      discount:discount,
      discountedPrice: price - (price * discount / 100),
      itemType: ite._id
    });
    const savedProduct = await newProduct.save();
    return res.status(201).json(savedProduct);
  } catch (error) {
    return res.status(500).json({ error: 'Error creating product', details: error.message });
  }
};

export const editProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, description, price, discount, itemType, imagesToDelete, newImages } = req.body;

  try {
    // Validate product ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Find the product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Prepare updates object
    const updates = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (price) updates.price = price;
    if (discount) updates.discount = discount;

    // Update category if provided
    if (category) {
      const cat = await Category.findOne({ name: category });
      if (cat) {
        updates.category = cat._id;
      } else {
        return res.status(404).json({ error: 'Category not found' });
      }
    }

    // Update item type if provided
    if (itemType) {
      const ite = await ItemType.findOne({ name: itemType });
      if (ite) {
        updates.itemType = ite._id;
      } else {
        return res.status(404).json({ error: 'Item type not found' });
      }
    }

    // Handle image deletion and replacement
    if (imagesToDelete && imagesToDelete.length > 0) {
      product.images = product.images.filter(image => !imagesToDelete.includes(image));
    }

    // Upload new images if any and add to the product's image array
    if (newImages && newImages.length > 0) {
      for (const newImage of newImages) {
        const newImageUrl = await uploadImageToCloudinary(newImage);
        product.images.push(newImageUrl);
      }
    }

    // Calculate discounted price if necessary
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
  const result = await Product.find(query);
  console.log("i am invoked");
  return res.status(200).json(result);
  }
  catch(e){
    res.status(400).json({error:e});
  }
};

export const getProductById = async(req,res)=>{
  try{
    const {id} = req.body;
    if (!id){
      return res.status(400).json({error:"id not found "});
    }
    const product = Product.findById({productId:id});
    if(!product){
      return res.status(400).json({error:"invalid product id"});
    }
    return res.status(200).json(product);
  }
  catch(e){
    return res.status(500).json(e);
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
    
    const result = await Product.find(filters).sort(sortCriteria);
    return res.status(200).json(result);
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