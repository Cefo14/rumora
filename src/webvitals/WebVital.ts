/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { RumoraException } from "@/errors/RumoraException";
import { Observer } from "@/Observer";
import type { WebVitalReport } from "@/reports/WebVitalReport";

type Callback = () => void;
export type ObserverCallback<T> = (error: Error | null, value: T | null) => void;

const scheduleCallback = (callback: Callback) => {
  setTimeout(callback, 0);
};

export abstract class WebVital<T extends WebVitalReport> extends Observer<T> {
  protected report?: T;
  protected error?: Error;
  private isInitialized = false;

  protected onSubscribe(): void {
    if (!this.isInitialized) {
      this.initialize();
      this.isInitialized = true;
    }
    if (this.report) scheduleCallback(() => this.notifyChange(this.report!));
    else if (this.error) scheduleCallback(() => this.notifyError(this.error!));
  }

  private initialize(): void {
    try {
      if (this.isPerformanceObservationSupported()) {
        this.handlePerformanceObservation();
      }
      else throw new RumoraException(`${this.constructor.name} is not supported in this browser.`);
    } catch (error) {
      this.error = error instanceof Error ? error : new Error(String(error));
      this.notifyError(this.error);
    }
  }

  protected abstract isPerformanceObservationSupported(): boolean;

  protected abstract handlePerformanceObservation(): void;
}
