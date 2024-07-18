// import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import Logger from '../loggers/logger.js';
// Load environment variables from .env file
dotenv.config();


// const PORT = process.env.PORT || 4002;
const DB = process.env.db_url;

// Connect to MongoDB
mongoose.connect(DB)
  .then(() => {
    console.log("Database connected");
    // Logger.info('Connected to MongoDB');
    // Start the server after successfully connecting to the databas
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);

    // Logger.error(`Failed to connect to MongoDB: ${err.message}`);
  });

// Your routes and other middleware configurations here
