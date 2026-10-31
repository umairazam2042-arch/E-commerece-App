const asyncHandler = require('../utils/asyncHandler');
const uploadService = require('../services/uploadService');

const getUploadAuth = asyncHandler(async (req, res) => {
  const data = uploadService.getUploadAuth();
  res.json({ success: true, data });
});

module.exports = { getUploadAuth };