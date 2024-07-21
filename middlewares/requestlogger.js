// middlewares/requestLogger.js
import logger from '../loggers/logger.js';

const requestLogger = async (req, res, next) => {
  const logData = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user // Add user info if available
  };

  await logger.info('Request received', logData);
  next();
};

export default requestLogger;
