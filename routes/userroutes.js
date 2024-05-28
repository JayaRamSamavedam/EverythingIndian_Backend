const express = require("express");
const router = new express.Router();

const controllers = require("../controllers/userController");

// routes

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

module.exports =router;