import { RumoraException } from './RumoraException';

export class UnsupportedException extends RumoraException {};

export class UnsupportedMetricException extends UnsupportedException {
  constructor(metric: string) {
    super(`${metric} is not supported in this browser.`);
  }
}

export class UnsupportedPerformanceAPIException extends UnsupportedException {
  constructor() {
    super('Performance API is not supported in this browser.');
  }
}
