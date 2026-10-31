const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const authService = require('../services/authService');

const REFRESH_COOKIE = 'refreshToken';

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);

  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  res.status(201).json({ success: true, data: { user, accessToken } });
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  res.json({ success: true, data: { user, accessToken } });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies[REFRESH_COOKIE];
  if (!token) {
    throw new AppError('No refresh token provided', 401);
  }

  const { accessToken, refreshToken } = await authService.refresh(token);

  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  res.json({ success: true, data: { accessToken } });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);

  res.clearCookie(REFRESH_COOKIE, { httpOnly: true, sameSite: 'lax' });
  res.json({ success: true, message: 'Logged out successfully' });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  res.json({ success: true, data: { user } });
});

module.exports = { register, login, refresh, logout, me };