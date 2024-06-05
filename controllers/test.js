const Product = require("../schema/productSchema");
const Category = require("../schema/categorySchema");
const ItemType = require("../schema/itemtypeSchema");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Initialize upload variable
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Create Category
exports.createCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const precat = await Category.findOne({ name });
    if (precat) {
      return res.status(400).json({ error: 'This category already present in our database' });
    } else {
      const cat = new Category({ name });
      const savecat = await cat.save();
      return res.status(200).json(savecat);
    }
  } catch (error) {
    return res.status(400).json({ error: 'Please provide the name', error });
  }
};

// Create ItemType
exports.createItemType = async (req, res) => {
  const { name } = req.body;
  try {
    const preItemType = await ItemType.findOne({ name });
    if (preItemType) {
      return res.status(400).json({ error: 'This item type already present in our database' });
    } else {
      const itemType = new ItemType({ name });
      const saveItemType = await itemType.save();
      return res.status(200).json(saveItemType);
    }
  } catch (error) {
    return res.status(400).json({ error: 'Please provide the name', error });
  }
};

// Create Product
// Create Product
exports.createProduct = async (req, res) => {
    const uploadMiddleware = upload.fields([
      { name: 'coverImage', maxCount: 1 },
      { name: 'images', maxCount: 5 },
    ]);
  
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
  
      const { name, category, description, price, discount, itemType } = req.body;
  
      if (!req.files || !req.files.coverImage || req.files.coverImage.length === 0) {
        return res.status(400).json({ error: 'Cover image is required' });
      }
  
      const coverImage = req.files.coverImage[0].path;
      const images = req.files.images ? req.files.images.map((file) => file.path) : [];
  
      try {
        const cat = await Category.findOne({ name: category });
        const ite = await ItemType.findOne({ name: itemType });
  
        if (!cat || !ite) {
          return res.status(400).json({ error: 'Invalid category or item type' });
        }
  
        const newProduct = new Product({
          name,
          coverImage,
          images,
          category: cat._id,
          description,
          price,
          discount,
          itemType: ite._id,
          discountedPrice: price - (price * discount) / 100,
        });
  
        const savedProduct = await newProduct.save();
        return res.status(201).json(savedProduct);
      } catch (error) {
        return res.status(500).json({ error: 'Error creating product', details: error });
      }
    });
  };
  

// Edit Product
exports.editProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, description, price, discount, itemType } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (name) product.name = name;
    if (category) {
      const cat = await Category.findOne({ name: category });
      if (cat) {
        product.category = cat._id;
      } else {
        return res.status(404).json({ error: 'Category not found' });
      }
    }
    if (description) product.description = description;
    if (price) product.price = price;
    if (discount) product.discount = discount;
    if (itemType) {
      const ite = await ItemType.findOne({ name: itemType });
      if (ite) {
        product.itemType = ite._id;
      } else {
        return res.status(404).json({ error: 'Item type not found' });
      }
    }
    product.discountedPrice = product.price - (product.price * product.discount) / 100;

    const updatedProduct = await product.save();
    return res.status(200).json(updatedProduct);
  } catch (error) {
    return res.status(500).json({ error: 'Error editing product', details: error });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.remove();
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Error deleting product', details: error });
  }
};

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category').populate('itemType');
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching products', details: error });
  }
};

// Get Products by Category
exports.getProductsByCategory = async (req, res) => {
  const { categoryName } = req.params;

  try {
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const products = await Product.find({ category: category._id }).populate('category').populate('itemType');
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching products by category', details: error });
  }
};

// Universal Sort Products
exports.sortProducts = async (req, res) => {
  const { sortBy, order, category } = req.query; // sortBy: 'price' or 'discount', order: 'asc' or 'desc'

  try {
    let filter = {};
    if (category) {
      const cat = await Category.findOne({ name: category });
      if (cat) {
        filter.category = cat._id;
      } else {
        return res.status(404).json({ error: 'Category not found' });
      }
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const products = await Product.find(filter)
      .populate('category')
      .populate('itemType')
      .sort({ [sortBy]: sortOrder });

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Error sorting products', details: error });
  }
};

// Update Product Images
exports.updateProductImages = async (req, res) => {
  const { id } = req.params;

  const uploadMiddleware = upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 5 },
  ]);

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (req.files.coverImage) {
        const coverImage = req.files.coverImage[0].path;
        // Optionally delete old cover image
        if (product.coverImage) {
          fs.unlinkSync(product.coverImage);
        }
        product.coverImage = coverImage;
      }

      if (req.files.images) {
        const images = req.files.images.map((file) => file.path);
        // Optionally delete old additional images
        product.images.forEach((image) => {
          fs.unlinkSync(image);
        });
        product.images = images;
      }

      const updatedProduct = await product.save();
      return res.status(200).json(updatedProduct);
    } catch (error) {
      return res.status(500).json({ error: 'Error updating product images', details: error });
    }
  });
};

// Delete Product Image
exports.deleteProductImage = async (req, res) => {
  const { id } = req.params;
  const { imagePath } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const imageIndex = product.images.indexOf(imagePath);
    if (imageIndex > -1) {
      product.images.splice(imageIndex, 1);
      // Optionally delete the image file
      fs.unlinkSync(imagePath);
    } else {
      return res.status(404).json({ error: 'Image not found in product' });
    }

    const updatedProduct = await product.save();
    return res.status(200).json(updatedProduct);
  } catch (error) {
    return res.status(500).json({ error: 'Error deleting product image', details: error });
  }
};
