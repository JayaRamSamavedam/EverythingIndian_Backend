import express from 'express';
import verifyAuthToken from '../middlewares/verifyAuthToken.js';
import  checkRoleAccess from '../middlewares/checkroleaccess.js';
import * as controller from '../controllers/productController.js';

const router = express.Router();

router.put("/prod/edit/:id",verifyAuthToken,checkRoleAccess,controller.editProduct);

router.post("/prod/cat",verifyAuthToken,checkRoleAccess,controller.createCategory);

router.post("/prod/item",verifyAuthToken,checkRoleAccess,controller.createItemType);

router.post ("/prod/create",verifyAuthToken,checkRoleAccess,controller.createProduct);


export default router;