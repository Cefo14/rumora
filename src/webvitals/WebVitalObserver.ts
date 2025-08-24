/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { WebVitalReport } from "@/reports/WebVitalReport";
import { Observer } from "@/Observer";

export type ObserverCallback<T> = (error: Error | null, value: T | null) => void;

const scheduleCallback = (callback: () => void) => {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(callback);
  } else {
    Promise.resolve().then(callback).catch(console.error);
  }
};

export abstract class WebVitalObserver extends Observer<WebVitalReport> {
  private reports: WebVitalReport[] = [];
  private errors: Error[] = [];
  private observer?: PerformanceObserver;
  private isInitialized = false;

  protected addReport(report: WebVitalReport): void {
    this.reports.push(report);
    this.notifyChange(report);
  }

  protected addError(error: Error): void {
    this.errors.push(error);
    this.notifyError(error);
  }

  protected setObserver(observer: PerformanceObserver): void {
    this.observer = observer;
  }

  private hasReports(): boolean {
    return this.reports.length > 0;
  }

  private hasErrors(): boolean {
    return this.errors.length > 0;
  }

  private clearReports(): void {
    this.reports = [];
  }

  private clearErrors(): void {
    this.errors = [];
  }

  private getLastReport(): WebVitalReport | undefined {
    return this.reports.at(-1);
  }

  private getLastError(): Error | undefined {
    return this.errors.at(-1);
  }

  protected override onSubscribe(): void {
    if (!this.isInitialized) {
      this.initialize();
      this.isInitialized = true;
    }
    if (this.hasReports()) scheduleCallback(() => this.notifyChange(this.getLastReport()!));
    else if (this.hasErrors()) scheduleCallback(() => this.notifyError(this.getLastError()!));
  }

  public dispose(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
    this.clearSubscribers();
    this.clearReports();
    this.clearErrors();
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
