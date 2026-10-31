const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/tokens');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Refresh token ka hash DB mein save hota hai (rotation ke liye)
const issueTokens = async (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await User.updateOne({ _id: user._id }, { refreshTokenHash: hashToken(refreshToken) });

  return { accessToken, refreshToken };
};

const register = async ({ name, email, password }) => {
  const exists = await User.exists({ email });
  if (exists) {
    throw new AppError('Email already registered', 409);
  }

  const user = await User.create({ name, email, password });
  const tokens = await issueTokens(user);

  return { user: user.toSafeObject(), ...tokens };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is disabled', 403);
  }

  const tokens = await issueTokens(user);
  return { user: user.toSafeObject(), ...tokens };
};

const refresh = async (token) => {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const user = await User.findById(payload.sub).select('+refreshTokenHash');

  if (!user || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(token)) {
    throw new AppError('Invalid refresh token', 401);
  }

  return issueTokens(user);
};

const logout = async (userId) => {
  await User.updateOne({ _id: userId }, { $unset: { refreshTokenHash: 1 } });
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user.toSafeObject();
};

module.exports = { register, login, refresh, logout, getMe };