const express = require("express");
const router = new express.Router();
const verify= require("../middlewares/verifyAuthToken")
const controllers = require("../controllers/userController");

// routes
const controller = require("../controllers/productController");

const admin = require("../controllers/adminController");
// routes
router.put("/prod/edit/:id",controller.editProduct);

router.post("/prod/cat",controller.createCategory);

router.post("/prod/item",verify,controller.createItemType);

router.post ("/prod/create",controller.createProduct);

// register 
router.post("/user/register",controllers.userRegister);

//login
router.post("/user/login",controllers.userLogin);

//refreshtoken
router.post("/user/refresh",controllers.refreshToken);

//logout
router.post("/user/logout",controllers.logout);

//password change
router.post("/user/changepassword",controllers.changePassword);

//forgot password
router.post("/user/forgotpassword",controllers.forgotPassword);

// otpsend
router.post("/user/otp",controllers.userOtpSend);

//verifyotp
router.post("/user/verifyotp",controllers.verifyOtp);

//reset password
router.post("/user/resetpassword",controllers.resetPassword);

//change the phone number
router.post("/user/changephonenumber", controllers.changePhoneNumber);


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

































module.exports=router;