// const { createLogger, format, transports } = require('winston');

import {createLogger,format,transports} from 'winston'
import {MongoDB} from 'winston-mongodb'
import 'winston-daily-rotate-file'


// const mongoose = require('mongoose'); // Import the existing mongoose connection
// const winston = require('winston/lib/winston/config');
import mongoose from 'mongoose';
import winston from 'winston/lib/winston/config/index.js';
// logger.js
// const { createLogger, transports, format } = require('winston');
// const { MongoDB } = require('winston-mongodb');
// const mongoose = require('mongoose');

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

mongoose.connect('mongodb://localhost:27017/yourdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

const logger = createLogger({
  format: logFormat,
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    }),
    new MongoDB({
      level: 'info',
      db: mongoose.connection.db, // Use mongoose connection
      options: {
        useUnifiedTopology: true
      },
      collection: 'log',
      format: format.combine(
        format.timestamp(),
        format.json()
      )
    })
  ]
});

export default logger;
