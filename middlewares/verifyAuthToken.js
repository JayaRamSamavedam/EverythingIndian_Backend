const jwt = require("jsonwebtoken");
const UserGroup = require("../schema/usergroupsSchema")
const Role=require("../schema/roleSchema");
const users = require("../schema/userSchema");
// const { findOne } = require("../schema/roleCounterSchema");
const verifyAuthToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer <token>' format

    if (!token) {
      return res.status(401).send({ error: "Unauthorized: Missing access token" });
    }
    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
     // Verify token using secret key
     const user = await users.findOne({ _id: decoded._id});
     req.user = user; // Attach decoded user information to the request object
    console.log(req.user);
    const usergrps = await UserGroup.findOne({name:user.userGroup});
    console.log(usergrps);
    console.log(req.path);
    console.log(req.original)
    next(); // Proceed with the request handler
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).send({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = verifyAuthToken;