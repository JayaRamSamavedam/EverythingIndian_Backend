import express from 'express';
import verifyAuthToken from '../middlewares/verifyAuthToken.js';
import  checkRoleAccess from '../middlewares/checkroleaccess.js';
import * as controller from '../controllers/productController.js';
import currencyHandler from '../middlewares/currencyHandler.js';
const router = express.Router();

router.put("/admin/prod/edit/:id",verifyAuthToken,checkRoleAccess,controller.editProduct);
router.post("/admin/prod/cat",verifyAuthToken,checkRoleAccess,controller.createCategory);
router.post("/admin/prod/item",verifyAuthToken,checkRoleAccess,controller.createItemType);
router.post ("/admin/prod/create",verifyAuthToken,checkRoleAccess,controller.createProduct);
router.get("/prod/get",verifyAuthToken,checkRoleAccess,controller.getAllProducts);
router.get("/prod/getByID/:id",verifyAuthToken,checkRoleAccess,currencyHandler,controller.getProductById);
router.get("/prod",controller.fetchProducts);
router.get("/admin/getAllItemTypes",verifyAuthToken,checkRoleAccess,controller.getAllItemTypes);
router.get("/admin/getAllCategories",verifyAuthToken,checkRoleAccess,controller.getAllCategories);
router.post("/prod/create-review",verifyAuthToken,checkRoleAccess,controller.createReview);
router.post("/prod/delete-review",verifyAuthToken,checkRoleAccess,controller.deleteReview);
router.post("/prod/delete-comment",verifyAuthToken,checkRoleAccess,controller.deleteComment);
router.get("/prod/getReviewByUser",verifyAuthToken,checkRoleAccess,controller.getReviewByUser);
router.get("/prod/getByProduct/:productId",verifyAuthToken,controller.getReviewsByProduct);
router.post("/prod/editComment",verifyAuthToken,checkRoleAccess,controller.editComment);
router.delete("/admin/prod/delete/:id",verifyAuthToken,checkRoleAccess,controller.deleteProductByID);
// productswithhotdeal
router.get("/prod/gethotdeals",controller.productsWithHotdeal);
// getallsubcategories
router.get("/prod/getsubcategories",controller.getAllSubCategories);
// deletesubcategories
router.delete("/admin/prod/deletesubcat",verifyAuthToken,checkRoleAccess,controller.deletedsubcategories)
// editsubcategories
router.put("/admin/prod/editsubcat",verifyAuthToken,checkRoleAccess,controller.editSubcategory);
// createsubcategory
router.post("/admin/prod/createsubcat",verifyAuthToken,checkRoleAccess,controller.creatSubcategory);
// editcategoryname
router.put("/admin/prod/editcat",verifyAuthToken,checkRoleAccess,controller.editCategory);
// edit brand
router.put("/admin/prod/editbrand",verifyAuthToken,checkRoleAccess,controller.editBrand);
// getproductsby brand
router.get("/prod/getproductsbybrand",controller.getProductsByBrand);
// getall brands
router.get("/prod/getallbrands",controller.getAllBrands);
// resetprioritybybrand
router.put("/admin/prod/resetprioritybybrand",verifyAuthToken,checkRoleAccess,controller.resetPriorityByBrand);
// setprioritybybrand
router.put("/admin/prod/setpriority",verifyAuthToken,checkRoleAccess,controller.setPriorityByBrand);
// deletebrand
router.delete("/admin/prod/deletebrand",verifyAuthToken,checkRoleAccess,controller.deleteBrand);
// editbrandname
// router.put("/admin/prod/editbrandname",verifyAuthToken,checkRoleAccess,controller.editBrandName);
// remove hot deal
router.put("/admin/prod/removehotdeal",verifyAuthToken,checkRoleAccess,controller.removeHotDeal);
// make product hotdeal
router.put("/admin/prod/makeproducthotdeal",verifyAuthToken,checkRoleAccess,controller.makeProductHotDeal);
// remove brand sponsers
router.delete("/admin/prod/removebrandsponsers",verifyAuthToken,checkRoleAccess,controller.removeBrandSponsers);
// create brandsponsers
router.post("/admin/prod/createbrandsponsers",verifyAuthToken,checkRoleAccess,controller.createBrandSponsers);
// getall brandsponsers
router.get("/prod/getAllbrandsponsers",controller.getAllbrandsponsers);
// create brand
router.post("/admin/prod/createbrand",verifyAuthToken,checkRoleAccess,controller.createBrand);
// delete the category
router.delete("/admin/prod/deleteCategory",verifyAuthToken,checkRoleAccess,controller.deleteCategory);

router.get("/prod/getBrand/:name",verifyAuthToken,checkRoleAccess,controller.getBrandByName);

router.get("/admin/getCategory/:name",verifyAuthToken,checkRoleAccess,controller.getCategory);
router.get("/admin/getSubcatbycat/:category",verifyAuthToken,checkRoleAccess,controller.getSubCategoryByCategory);
export default router;