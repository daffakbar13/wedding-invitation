import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ObjectId } from 'mongodb';

// Thrown from handlers; the error handler turns it into `{ error, ...details }`.
export class HttpError extends Error {
  status: number;
  details: Record<string, unknown> | undefined;

  constructor(status: number, message: string, details?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const notFound = (what = 'Not found') => new HttpError(404, what);
export const forbidden = () => new HttpError(403, 'You do not have access to this resource.');

// A malformed id can never match a document, so it is a plain not-found.
export function parseId(value: unknown, what: string): ObjectId {
  if (typeof value !== 'string' || !ObjectId.isValid(value)) throw notFound(`${what} not found`);
  return new ObjectId(value);
}

export function str(body: Record<string, unknown>, key: string, opts: { required?: boolean; max?: number } = {}): string | undefined {
  const value = body[key];
  if (value === undefined || value === null) {
    if (opts.required) throw new HttpError(400, `${key} is required.`);
    return undefined;
  }
  if (typeof value !== 'string') throw new HttpError(400, `${key} must be a string.`);
  const trimmed = value.trim();
  if (opts.required && !trimmed) throw new HttpError(400, `${key} is required.`);
  if (opts.max && trimmed.length > opts.max) throw new HttpError(400, `${key} must be at most ${opts.max} characters.`);
  return trimmed;
}

export function body(req: { body?: unknown }): Record<string, unknown> {
  const b = req.body;
  if (!b || typeof b !== 'object' || Array.isArray(b)) throw new HttpError(400, 'Request body must be a JSON object.');
  return b as Record<string, unknown>;
}

export const unknownRoute: RequestHandler = (_req, _res, next) => next(notFound());

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, ...err.details });
    return;
  }
  // express.json() parse errors carry a 4xx status
  if (typeof err?.status === 'number' && err.status >= 400 && err.status < 500) {
    res.status(err.status).json({ error: 'Invalid request body.' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong.' });
};
