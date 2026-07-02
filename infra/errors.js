export class InternalServerError extends Error {
  constructor({ cause, statusCode }) {
    super("A not handled error occurred", { cause });
    this.name = "InternalServerError";
    this.action = "Contact the support team";
    this.statusCode = statusCode || 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  constructor({ cause, message }) {
    super(message || "Service unavailable in this moment", { cause });
    this.name = "ServiceError";
    this.action = "Verify if the service is available";
    this.statusCode = 503;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor() {
    super("A not allowed method was used on this endpoint");
    this.name = "MethodNotAllowedError";
    this.action = "Verify your request method is valid for this endpoint";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
