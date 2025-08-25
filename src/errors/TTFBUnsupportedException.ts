import { RumoraException } from "./RumoraException";

export class TTFBUnsupportedException extends RumoraException {
  constructor() {
    super('TTFB is not supported in this browser.');
  }
}
