import { RumoraException } from './RumoraException';

export class PerformanceObserverException extends RumoraException {};

export class PerformanceHandlerException extends PerformanceObserverException {
  constructor(cause?: unknown) {
    super('Error occurred in performance handler', { cause });
  }
}
