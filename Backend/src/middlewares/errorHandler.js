const AppError = require('../utils/AppError');

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || err.status || 500;
  let message = err.isOperational ? err.message : 'Something went wrong';

  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON body';
  }
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID';
  }
  if (err.code === 11000) {
    status = 409;
    message = 'Duplicate value';
  }

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ success: false, message });
};

module.exports = { notFound, errorHandler };