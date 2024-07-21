// loggers/logger.js
import Log from '../schema/logSchema.js';

const log = async  (level, message, meta) => {
  const logEntry = new Log({
    level,
    message,
    meta
  });

  await logEntry.save();
};

const logger = {
  info: (message, meta) => log('info', message, meta),
  error: (message, meta) => log('error', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  debug: (message, meta) => log('debug', message, meta)
};

export default logger;
