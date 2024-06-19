import express from 'express';
import verifyAuthToken from '../middlewares/verifyAuthToken.js';
import  checkRoleAccess from '../middlewares/checkroleaccess.js';
import * as controller from '../controllers/orderController.js';

const router = express.Router();

router.post("/orders/cart-buy-now",controller.CartBuyNow);
router.post("/orders/buy-now",controller.ProductBuyNow);
router.get("/order/:orderId/bill",controller.orderBill);

export default router;