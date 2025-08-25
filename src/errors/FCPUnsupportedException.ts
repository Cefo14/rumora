import { RumoraException } from "./RumoraException";

export class FCPUnsupportedException extends RumoraException {
  constructor() {
    super('FCP is not supported in this browser.');
  }
}
