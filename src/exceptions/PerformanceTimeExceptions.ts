import { RumoraException } from '@/exceptions/RumoraException';

export class PerformanceTimeException extends RumoraException {}

export class InvalidPerformanceTimeException extends PerformanceTimeException {
  constructor() {
    super('Invalid performance timestamp: must be a non-negative finite number');
  }
}
