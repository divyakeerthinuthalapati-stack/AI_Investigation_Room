import { AppError } from './error-handler.js';

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return next(new AppError(400, 'INVALID_REQUEST', result.error.issues.map((i) => i.message).join('. ')));
    req.validatedBody = result.data;
    next();
  };
}
