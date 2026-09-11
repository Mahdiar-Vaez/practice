export class HandleError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: Record<string, string>;

  constructor(message: string, statusCode: number = 400, errors?: Record<string, string>) {
    super(message);
    this.name = 'HandleError';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: Record<string, string>) {
    return new HandleError(message, 400, errors);
  }

  static unauthorized(message: string = 'برای دسترسی به این بخش لطفاً وارد شوید') {
    return new HandleError(message, 401);
  }

  static notFound(message: string = 'آیتم مورد نظر یافت نشد') {
    return new HandleError(message, 404);
  }

  static internal(message: string = 'خطای غیرمنتظره سرور رخ داده است') {
    return new HandleError(message, 500);
  }
}
