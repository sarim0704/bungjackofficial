import { ZodError } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        issues: error.errors.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    next(error);
  }
};
