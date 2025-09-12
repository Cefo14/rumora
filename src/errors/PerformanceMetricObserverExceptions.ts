import { RumoraException } from "@/errors/RumoraException";

export class PerformanceMetricObserverException extends RumoraException {}

export class ObserverNotStartedException extends PerformanceMetricObserverException {
  constructor(cause?: unknown) {
    super("PerformanceMetricObserver has not been started. Ensure there is at least one subscriber.", { cause });
  }
}

export class PerformanceMetricObserverError extends PerformanceMetricObserverException {
  constructor(cause?: unknown) {
    super("Error processing performance entries", { cause });
  }
}
