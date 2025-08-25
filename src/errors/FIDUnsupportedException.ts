import { RumoraException } from "./RumoraException";

export class FIDUnsupportedException extends RumoraException {
  constructor() {
    super('FID is not supported in this browser.');
  }
}
