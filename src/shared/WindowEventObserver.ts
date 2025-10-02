import { FallibleObserver } from '@/shared/FallibleObserver';
import { isSSR } from '@/shared/isSSR';
import { UnsupportedSSRException } from '@/exceptions/UnsupportedExceptions';
import type { Report } from '@/reports/Report';
import { EventObserverHandlerException } from '@/exceptions/EventObserverExceptions';

/**
  * Abstract observer for capturing window events.
  * Listens for specified events on the window and generates reports
  * when those events occur, providing insights into various issues
  * that affect the user experience.
  */
export abstract class WindowEventObserver<K extends keyof WindowEventMap, T extends Report> extends FallibleObserver<T> {
  private isListening = false;
  private readonly eventType: K;
  private readonly boundHandler: (event: WindowEventMap[K]) => void;

  constructor(eventType: K) {
    super();
    this.eventType = eventType;
    this.boundHandler = this.handleOnEvent.bind(this);
  }

  protected override onSubscribe(): void {
    if (!this.isListening) this.start();
  }

  public dispose(): void {
    this.stop();
    this.clearSubscribers();
  }

  private handleOnEvent(event: WindowEventMap[K]): void {
    try {
      this.onEvent(event);
    }
    catch (error) {
      const wrappedError = new EventObserverHandlerException(error);
      this.notifyError(wrappedError);
    }
  }

  private start(): void {
    if (this.isListening) return;

    if (isSSR()) {
      const error = new UnsupportedSSRException();
      this.notifyError(error);
      return;
    }

    window.addEventListener(this.eventType, this.boundHandler, true);
    this.isListening = true;
  }

  private stop(): void {
    if (!this.isListening) return;
    window.removeEventListener(this.eventType, this.boundHandler, true);
    this.isListening = false;
  }

  protected abstract onEvent(event: WindowEventMap[K]): void;
}