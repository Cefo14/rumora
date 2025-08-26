import { RumoraException } from "./RumoraException";

export class UnsupportedMetricException extends RumoraException {
  constructor(metric: string) {
    super(`The ${metric} metric is not supported in this browser.`);
  }
}