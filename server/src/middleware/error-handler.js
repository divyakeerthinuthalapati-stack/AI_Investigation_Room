export class AppError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.status ?? (error.name === 'ZodError' || error.type === 'entity.parse.failed' ? 400 : error.type === 'entity.too.large' ? 413 : 500);
  const code = error.code ?? (status === 400 ? 'INVALID_REQUEST' : 'INTERNAL_ERROR');
  if (status >= 500) console.error('Request failed:', error.message);
  res.status(status).json({ success: false, error: { code, message: status >= 500 ? 'The request could not be processed. Please try again.' : error.message } });
}
