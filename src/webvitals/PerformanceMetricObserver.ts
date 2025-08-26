/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { PerformanceReport } from "@/reports/PerformanceReport";
import { Observer } from "@/shared/Observer";

export type ObserverCallback<T> = (error: Error | null, value: T | null) => void;

const scheduleCallback = (callback: () => void) => {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(callback);
  } else {
    Promise.resolve().then(callback).catch(console.error);
  }
};

export abstract class PerformanceMetricObserver<T extends PerformanceReport> extends Observer<T> {
  private report?: T;
  private error?: Error;
  private observer?: PerformanceObserver;
  private isInitialized = false;

  protected addReport(report: T): void {
    this.report = report;
    this.notifyChange(report);
  }

  protected addError(error: Error): void {
    this.error = error;
    this.notifyError(error);
  }

  protected setObserver(observer: PerformanceObserver): void {
    this.observer = observer;
  }

  protected override onSubscribe(): void {
    if (!this.isInitialized) {
      this.initialize();
      this.isInitialized = true;
    }
    if (this.report) scheduleCallback(() => this.notifyChange(this.report!));
    else if (this.error) scheduleCallback(() => this.notifyError(this.error!));
  }

  public dispose(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
    this.clearSubscribers();
    this.report = undefined;
    this.error = undefined;
    this.isInitialized = false;
  }

  protected abstract initialize(): void;
}

export const isPerformanceObservationSupported = (type: string): boolean => {
  return (
    typeof window !== 'undefined' &&
    'PerformanceObserver' in window &&
    PerformanceObserver.supportedEntryTypes.includes(type)
  );
};
