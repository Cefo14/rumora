import { FallibleObserver } from '@/shared/FallibleObserver';
import { UnsupportedMetricException } from '@/errors/UnsupportedExceptions';
import { ObserverNotStartedException, PerformanceMetricObserverError } from '@/errors/PerformanceMetricObserverExceptions';
import type { PerformanceObserverConfig } from '@/types/PerformanceObserverTypes';

export abstract class PerformanceMetricObserver<T> extends FallibleObserver<T> {
  private performanceObserver: PerformanceObserver;
  private readonly performanceObserverConfig: PerformanceObserverConfig;
  private readonly entryType: string;
  private isListening: boolean;

  constructor(entryType: string, performanceObserverConfig: PerformanceObserverConfig = {}) {
    super();
    this.entryType = entryType;
    this.performanceObserverConfig = {
      type: this.entryType,
      buffered: true,
      ...performanceObserverConfig
    };
    this.performanceObserver = new PerformanceObserver(
      this.handleOnPerformanceObserver.bind(this)
    );
    this.isListening = false;
  }

  public dispose(): void {
    if (this.isListening) return;
    this.stop();
    this.clearSubscribers();
    this.isListening = false;
  }

  protected stop(): void {
    this.performanceObserver.disconnect();
  }

  protected override onSubscribe(): void {
    if (!this.isSupported()) {
      const error = new UnsupportedMetricException(this.entryType);
      this.notifyError(error);
      return;
    }
    if (this.isListening) return;
    this.start();
  }

  protected abstract onPerformanceObserver(entry: PerformanceObserverEntryList): void;

  private handleOnPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    try {
      this.onPerformanceObserver(entryList);
    }
    catch (error) {
      const wrappedError = new PerformanceMetricObserverError(error);
      this.notifyError(wrappedError);
    }
  }

  private start(): void {
    try {
      this.performanceObserver.observe(this.performanceObserverConfig);
    } catch (error) { 
      this.stop();
      const newError = new ObserverNotStartedException(error);
      this.notifyError(newError);
    }
  }

  private isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'PerformanceObserver' in window &&
      PerformanceObserver.supportedEntryTypes.includes(this.entryType)
    );
  }
}