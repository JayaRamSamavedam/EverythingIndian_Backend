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


// admin create custome user
router.post("/admin/user/create",admin.createCustomUser);

// admin delete any user
router.post("/admin/user/delete",admin.deleteUser);

// admin create role
router.post("/admin/role/create",admin.createRole);

// admin create usergrp
router.post("/admin/usergroup/create",admin.createUserGroups);

// admin edit usergrp
router.post("/admin/usergroup/edit",admin.updateUserGroup);

// admin edit role
router.post("/admin/role/edit",admin.updateRole);

































export default router;