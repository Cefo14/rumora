import { FallibleObserver } from '@/shared/FallibleObserver';
import type { PerformanceObserverConfig } from '@/types/PerformanceObserverTypes';
import { isSSR } from './isSSR';
import { UnsupportedMetricException, UnsupportedSSRException } from '@/exceptions/UnsupportedExceptions';
import { PerformanceHandlerException } from '@/exceptions/PerformanceObserverExceptions';

export abstract class PerformanceMetricObserver<T> extends FallibleObserver<T> {
  private performanceObserver: PerformanceObserver | null = null;
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
    this.stop();
    this.clearSubscribers();
    this.performanceObserver = null;
  }

  protected stop(): void {
    this.performanceObserver?.disconnect();
    this.isListening = false;
  }

  protected override onSubscribe(): void {
    if (this.isListening) return;
    this.start();
  }

  protected abstract onPerformanceObserver(entry: PerformanceObserverEntryList): void;

  private handleOnPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    try {
      this.onPerformanceObserver(entryList);
    }
    catch (error) {
      const wrappedError = new PerformanceHandlerException(error);
      this.notifyError(wrappedError);
    }
  }

  private start(): void {
    if (isSSR()) {
      const error = new UnsupportedSSRException();
      this.notifyError(error);
      return;
    }

    if (!this.isSupported()) {
      const error = new UnsupportedMetricException(this.entryType);
      this.notifyError(error);
      return;
    }

    this.performanceObserver = new PerformanceObserver(
      this.handleOnPerformanceObserver.bind(this)
    );
    this.performanceObserver.observe(this.performanceObserverConfig);
    this.isListening = true;
  }

  private isSupported(): boolean {
    return (
      'PerformanceObserver' in window &&
      PerformanceObserver.supportedEntryTypes.includes(this.entryType)
    );
  }
}