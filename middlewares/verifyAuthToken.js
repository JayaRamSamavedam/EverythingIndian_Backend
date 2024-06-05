const jwt = require("jsonwebtoken");
const UserGroup = require("../schema/usergroupsSchema")
const Role=require("../schema/roleSchema")
const verifyAuthToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer <token>' format

    if (!token) {
      return res.status(401).send({ error: "Unauthorized: Missing access token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token using secret key
    req.user = decoded; // Attach decoded user information to the request object
    
    next(); // Proceed with the request handler
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).send({ error: "Unauthorized: Invalid token" });
  }
};

module.exports = verifyAuthToken;