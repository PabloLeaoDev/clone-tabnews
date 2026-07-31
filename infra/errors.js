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

export class ValidationError extends Error {
  constructor({ cause, message, action }) {
    super(message || "A validation error occurred", { cause });
    this.name = "ValidationError";
    this.action = action || "Verify sent data and try again";
    this.statusCode = 400;
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

export class NotFoundError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Not possible to find this resource in the system", {
      cause,
    });
    this.name = "NotFoundError";
    this.action = action || "Verify if the sent data is rigth and try again";
    this.statusCode = 404;
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
