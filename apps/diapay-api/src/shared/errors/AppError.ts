export class AppError extends Error {
  constructor(message: string, public readonly status = 500, public readonly code = 'APP_ERROR', public readonly details: Record<string, unknown> = {}) {
    super(message);
  }
}
