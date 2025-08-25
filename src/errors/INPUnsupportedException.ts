import { RumoraException } from "./RumoraException";

export class INPUnsupportedException extends RumoraException {
  constructor() {
    super('INP is not supported in this browser.');
  }
}
