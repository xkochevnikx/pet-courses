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
