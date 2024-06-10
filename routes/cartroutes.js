import express from 'express';
import verifyAuthToken from '../middlewares/verifyAuthToken.js';
import  checkRoleAccess from '../middlewares/checkroleaccess.js';
import * as controller from "../controllers/cartController.js";
const router = express.Router();


router.get("/cart/getproducts",verifyAuthToken,checkRoleAccess,controller.getCartDetails);
router.post("/cart/clear",verifyAuthToken,checkRoleAccess,controller.clearTheCart);
router.delete("/cart/remove/:productId",verifyAuthToken,checkRoleAccess,controller.removeFromCart);
router.put("/cart/decrement/:productId",verifyAuthToken,checkRoleAccess,controller.decrement);
router.put("/cart/increment/:productId",verifyAuthToken,checkRoleAccess,controller.increment);
router.post("/cart/add/:productId",verifyAuthToken,checkRoleAccess,controller.addToCart);


export default router;

