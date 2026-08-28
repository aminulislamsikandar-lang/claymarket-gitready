export function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found.', requestId: req.id });
}

export function errorHandler(err, req, res, next) {
  console.error(`[${req.id || 'no-request-id'}]`, err);
  if (err?.name === 'ValidationError') return res.status(400).json({ success: false, message: 'Validation failed.', details: Object.values(err.errors).map(e => e.message), requestId: req.id });
  if (err?.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid resource id.', requestId: req.id });
  if (err?.code === 11000) return res.status(409).json({ success: false, message: 'A record with that unique value already exists.', requestId: req.id });
  const status = Number(err?.statusCode) || 500;
  return res.status(status).json({ success: false, message: process.env.NODE_ENV === 'production' && status >= 500 ? 'Internal server error.' : (err.message || 'Internal server error.'), requestId: req.id });
}
