// const jwt = require("jsonwebtoken");
import jwt from "jsonwebtoken";
// Use uppercase for environment variable names to follow convention
const adminUsername = process.env.admin;
const adminPassword = process.env.pass;

const verifyAdminCredentials = (req, res, next) => {
  try {
    // Extract token from 'Bearer <token>' format
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).send({ error: "Unauthorized: Missing access token" });
    }

    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Check if user group is admin
    if (req.user.userGroup !== "admin") {
      return res.status(403).send({ error: "Forbidden: User is not an admin" });
    }

    // Extract admin credentials from headers
    const { admin, pass } = req.headers;

    // Verify admin credentials
    if (admin === adminUsername && pass === adminPassword) {
      console.log('Admin authenticated successfully');
      next(); // Proceed to the next middleware or route handler
    } else {
      console.log('Authentication failed');
      return res.status(401).json({ error: 'Unauthorized: Invalid credentials' });
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).send({ error: "Unauthorized: Invalid token" });
  }
};

export default verifyAdminCredentials;
