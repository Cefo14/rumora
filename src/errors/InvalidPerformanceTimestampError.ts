import { RumoraException } from "@/errors/RumoraException";

export class InvalidPerformanceTimestampError extends RumoraException {
  constructor() {
    super("Invalid performance timestamp: must be a non-negative finite number");
  }
}
