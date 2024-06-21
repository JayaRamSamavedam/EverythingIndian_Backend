// const users = require("../schema/userSchema");
import users from "../schema/userSchema.js";
import nodemailer from "nodemailer";
// const nodemailer = require("nodemailer");
import bcrypt from "bcryptjs"
// const bcrypt = require("bcryptjs");
import userotp from "../schema/userOtp.js";
// const userotp = require("../schema/userOtp");
import jwt from "jsonwebtoken"
// const jwt = require("jsonwebtoken");
  
const SECRECT_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET;

// Email config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});


export const userRegister = async (req, res) => {
  const { uname, email, phonenumber, password } = req.body;

  if (!uname || !email || !password || !phonenumber) {
    return res.status(400).json({ error: "Please enter all the inputs" });
  }

  try {
    const preuser = await users.findOne({ email: email });
    if (preuser) {
      return res.status(400).json({ error: "This user already exists in our organization" });
    } else {
      const userregister = new users({ uname, email, phonenumber, password,userGroup:"customer" });
      const storedata = await userregister.save();
      res.status(200).json(storedata);
    }
  } catch (error) {
    res.status(500).json({ error: "Invalid details", error });
  }
};

export const userOtpSend = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ error: "Please Enter Your Email" })
    }
    try {
        const presuer = await users.findOne({ email: email });
        if (presuer) {
            const OTP = Math.floor(100000 + Math.random() * 900000);

            const existEmail = await userotp.findOne({ email: email });


            if (existEmail) {
                const updateData = await userotp.findByIdAndUpdate({ _id: existEmail._id }, {
                    otp: OTP
                }, { new: true }
                );
                await updateData.save();

               const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: "Sending Eamil For Otp Validation",
                    text: `OTP:- ${OTP}`
                }

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log("error", error);
                        res.status(400).json({ error: "email not send" })
                    } else {
                        console.log("Email sent", info.response);
                        res.status(200).json({ message: "Email sent Successfully" })
                    }
                })

            } else {

                const saveOtpData = new userotp({
                    email, otp: OTP
                });

                await saveOtpData.save();
                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: "Sending Eamil For Otp Validation",
                    text: `OTP:- ${OTP}`
                }

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log("error", error);
                        res.status(400).json({ error: "email not send" })
                    } else {
                        console.log("Email sent", info.response);
                        res.status(200).json({ message: "Email sent Successfully" })
                    }
                })
            }
        } else {
            res.status(400).json({ error: "This User Not Exist In our Db" })
        }
    } catch (error) {
        res.status(400).json({ error: "Invalid Details", error })
    }
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log("I am invoked");
  console.log(email,password)
  if (!password || !email) {
    return res.status(400).json({ error: "Please enter your password and email" });
  }

  try {
    const preuser = await users.findOne({ email: email });
    if (preuser) {
      const isMatch = await bcrypt.compare(password, preuser.password);
      if (isMatch) {
        const tokens = await preuser.generateAuthToken();
        console.log(tokens);
        const refreshToken = tokens.refreshToken;
        const accessToken = tokens.accessToken;

        // secure : true
        // httpOnly: true,
      //   res.cookie('jwt', refreshToken, {
      //     // sameSite: 'Lax', 
      //     sameSite: 'None',
      //     secure: true, // Secure flag must be true when sameSite is 'None'
      //     maxAge: 24 * 60 * 60 * 1000,
      //     httpOnly: true, // Recommended for security reasons
      //     domain: 'reimagined-fishstick-sigma.vercel.app',
      //     path: '/' // Ensure this matches your application route structure
      // });
      res.setHeader('Set-Cookie', [
        `jwt=${refreshToken}`,
        // 'type=ninja; Path=/'
    ]);
    res.setHeader("Access-Control-Allow-Credentials","true");
res.status(200).json({ message: "User login successfully done", accessToken:accessToken });
      } else {
        res.status(400).json({ error: "Invalid password" });
      }
    } else {
      res.status(400).json({ error: "Invalid email" });
    }
  } catch (error) {
    console.error("Login failed:", error);
    res.status(400).json({ error: "Server details", error });
  }
};

export const refreshToken = async (req, res) => {
  // console.log(req.cookies);
  console.log('hellow logout')
  if (req.cookies.jwt) {

  const refreshToken = req.cookies.jwt
  
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
    const user = await users.findOne({ _id: decoded._id, 'tokens.token': refreshToken });

    if (!user) {
      return res.status(400).json({ error: "Invalid refresh token" });
    }

    const accessToken = jwt.sign({ _id: user._id.toString() }, SECRECT_KEY, { expiresIn: '15m' });
    res.status(200).json({ accessToken });
  } catch (error) {

    res.status(400).json({ error: "Invalid refresh token", details: error });
  }
}
else{
  res.status(400).json({error:"please login again ivalid token"});
}
};

export const logout = async (req, res) => {
  console.log("Hi from logout")
  console.log(req.cookies.jwt)
  if (req.cookies.jwt) {

    const refreshToken = req.cookies.jwt;

    console.log(refreshToken)

  if (!refreshToken) {
    return res.status(400).json({ error: "Please provide a refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
    const user = await users.findOne({ _id: decoded._id, 'tokens.token': refreshToken });
    if (!user) {
      return res.status(400).json({ error: "Invalid refresh token" });
    }

    user.tokens = user.tokens.filter(token => token.token !== refreshToken);
    // user.tokens = [];
    user.accessToken=user.accessToken.filter(accessToken => accessToken.token !== req.token);
    await user.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token", details: error });
  }
}
  else{
    res.status(401).json({ error: "No refresh token" });
  }
};

export const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ error: "Please provide email, old password, and new password" });
  }

  try {
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // console.log("Old password from request:", oldPassword);
    // console.log("Hashed password from database:", user.password);

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    // console.log("Matching old password");

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    // console.log("New password hashed:", hashedNewPassword);

    user.password = newPassword;
    user.tokens = []; // Invalidate all existing tokens

    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(400).json({ error: "Error changing password", details: error });
  }
};

  
  export const forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ error: "Please provide your email" });
    }
  
    try {
      const user = await users.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }
  
      const OTP = Math.floor(100000 + Math.random() * 900000).toString();
  
      let otpEntry = await userotp.findOne({ email });
  
      if (otpEntry) {
        otpEntry.otp = OTP;
        await otpEntry.save();
      } else {
        otpEntry = new userotp({ email, otp: OTP });
        await otpEntry.save();
      }
  
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Password Reset OTP",
        text: `Your password reset OTP is: ${OTP}`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(400).json({ error: "Email not sent", details: error });
        } else {
          return res.status(200).json({ message: "Email sent successfully" });
        }
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid details", details: error });
    }
  };

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Please provide email and OTP" });
    }
    try {
      const otpEntry = await userotp.findOne({ email, otp });
      if (!otpEntry) {
        return res.status(400).json({ error: "Invalid OTP" });
      }
  
      res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
      res.status(400).json({ error: "Invalid details", details: error });
    }
  };
  
  
  export const changePhoneNumber = async (req, res) => {
    const {  newPhoneNumber } = req.body;
  
    if (!newPhoneNumber) {
      return res.status(400).json({ error: "Please provide  new phone number" });
    }
  
    try {
      // Verify access token
      const decoded = jwt.verify(accessToken, SECRECT_KEY);
      const user = await users.findOne({ _id: decoded._id, 'tokens.token': accessToken });
  
      if (!user) {
        return res.status(401).json({ error: "Invalid access token" });
      }
  
      // Update phone number
      user.phonenumber = newPhoneNumber;
      await user.save();
  
      res.status(200).json({ message: "Phone number changed successfully" });
    } catch (error) {
      res.status(400).json({ error: "Invalid details", details: error });
    }
  };
  

  export const changeUname = async(req,res)=>{
    const { newuname } = req.body;
  
    if (!newuname) {
      return res.status(400).json({ error: "Please provide  new user name" });
    }
  
    try {
      // Verify access token
      const decoded = jwt.verify(accessToken, SECRECT_KEY);
      const user = await users.findOne({ _id: decoded._id, 'tokens.token': accessToken });
  
      if (!user) {
        return res.status(401).json({ error: "Invalid access token" });
      }
  
      // Update phone number
      user.uname = newuname;
      await user.save();
  
      res.status(200).json({ message: "uname changed successfully" });
    } catch (error) {
      res.status(400).json({ error: "Invalid details", details: error });
    }
  }
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: "Please provide email, OTP, and new password" });
  }

  try {
    const otpEntry = await userotp.findOne({ email, otp });

    if (!otpEntry) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const user = await users.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    // Optionally, you can delete the OTP entry after successful password reset
    await userotp.deleteOne({ email, otp });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ error: "Invalid details", details: error });
  }
};

export const verifyToken = async (req,res)=>{
  try{
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    if(token){
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await users.findOne({ _id: decoded._id, 'accessToken.token': token });
    if(user){
    return res.status(200).json({message:"token verified"});
  }
  else{ return res.status(400)}
    }
  }
  catch(e){
    return res.status(500).json({error:"invalid token"});
  }
};