import { RumoraException } from "./RumoraException";

export class LCPUnsupportedException extends RumoraException {
  constructor() {
    super('LCP is not supported in this browser.');
  }
}
