import { RumoraException } from "./RumoraException";

export class CLSUnsupportedException extends RumoraException {
  constructor() {
    super('CLS is not supported in this browser.');
  }
}
