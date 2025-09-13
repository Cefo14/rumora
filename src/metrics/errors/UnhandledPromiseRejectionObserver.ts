import { SimpleObserver } from '@/shared/SimpleObserver';
import { generateId } from '@/shared/generateId';
import { UnhandledPromiseRejectionReport } from '@/reports/errors/UnhandledPromiseRejectionReport';

/**
 * Observer for capturing unhandled promise rejections.
 * Listens for 'unhandledrejection' events on the window and generates reports
 * when unhandled promise rejections occur, providing insights into
 * asynchronous issues that affect the user experience.
 */
export class UnhandledPromiseRejectionObserver extends SimpleObserver<UnhandledPromiseRejectionReport> {
  private isListening = false;

  protected override onSubscribe(): void {
    if (!this.isListening) this.start();
  }

  public dispose(): void {
    this.stop();
    this.clearSubscribers();
  }

  private start(): void {
    if (this.isListening) return;

    window.addEventListener('unhandledrejection', this.handlePromiseRejection, true);
    this.isListening = true;
  }

  private stop(): void {
    if (!this.isListening) return;

    window.removeEventListener('unhandledrejection', this.handlePromiseRejection, true);
    this.isListening = false;
  }

  private handlePromiseRejection = (event: PromiseRejectionEvent): void => {
    const report = UnhandledPromiseRejectionReport.fromPromiseRejectionEvent(
      generateId(),
      event
    );

    this.notify(report);
  };
}