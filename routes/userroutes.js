import express from 'express';
import verifyAuthToken from '../middlewares/verifyAuthToken.js';
import * as controllers from '../controllers/userController.js';
import  checkRoleAccess from '../middlewares/checkroleaccess.js';
import * as controller from '../controllers/productController.js';
import * as admin from '../controllers/adminController.js';

const router = express.Router();
// routes


// register 
router.post("/user/register",controllers.userRegister);
router.get("/user/validRefresh",controllers.hasValidRefreshToken);
//login
router.post("/user/login",controllers.userLogin);


//refreshtoken
router.post("/user/refresh",controllers.refreshToken);

//logout
router.post("/user/logout",verifyAuthToken,controllers.logout);

//password change
router.post("/user/changepassword",verifyAuthToken,controllers.changePassword);

//forgot password
router.post("/user/forgotpassword",controllers.forgotPassword);

// otpsend
router.post("/user/otp",controllers.userOtpSend);

//verifyotp
router.post("/user/verifyotp",controllers.verifyOtp);

//reset password
router.post("/user/resetpassword",controllers.resetPassword);

//change the phone number
router.post("/user/changephonenumber",verifyAuthToken,controllers.changePhoneNumber);

router.post("/user/changeusername",verifyAuthToken,controllers.changeUname);

router.post("/verify",controllers.verifyToken);

router.get("/user/getuser",verifyAuthToken,controllers.getUser);

export default router;