export abstract class Exception extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
    if (Error.captureStackTrace) Error.captureStackTrace(this, new.target);
    Object.setPrototypeOf(this, new.target.prototype);
    Object.freeze(this);
  }
}
