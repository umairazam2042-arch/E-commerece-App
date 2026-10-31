export const getErrorMessage = (err) =>
  err.response?.data?.message || 'Kuch masla aa gaya, dobara koshish karein';