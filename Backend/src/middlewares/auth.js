const AppError = require('../utils/AppError');
const { verifyAccessToken } = require('../utils/tokens');
const User = require('../models/User');

// Login user ko check karta hai. Token ke andar ka role nahi, DB ka role use hota hai.
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw new AppError('Not authenticated', 401);
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new AppError('User no longer exists or is disabled', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token', 401));
    }
    next(err);
  }
};

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  next();
};

module.exports = { protect, restrictTo };