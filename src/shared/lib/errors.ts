export class AuthorizationError extends Error {
  constructor(message = "Authorization error") {
    super(message);
  }
}
export class NeedAuthError extends Error {
  constructor(message = "Need Auth error") {
    super(message);
  }
}

export class BadRequest extends Error {
  constructor(message = "BadRequest") {
    super(message);
  }
}

export class ParsingError extends Error {
  constructor(
    public surse: string,
    message = "ParsingError",
    cause?: unknown,
  ) {
    super(message, { cause });
  }
}

export class ValidationError extends Error {
  constructor(
    public errors: unknown[],
    message = "ValidationError",
  ) {
    super(message);
  }
}
