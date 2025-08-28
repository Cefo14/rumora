import { SimpleObserver } from "@/shared/SimpleObserver";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";
import { PromiseErrorReport } from "@/reports/PromiseErrorReport";

export class UnhandledPromiseErrorsObserver extends SimpleObserver<PromiseErrorReport> {
  private isListening = false;

  protected override onSubscribe(): void {
    if (!this.isListening) {
      this.start();
    }
  }

  public start(): void {
    if (this.isListening) return;

    window.addEventListener('unhandledrejection', this.handlePromiseRejection, true);
    this.isListening = true;
  }

  public stop(): void {
    if (!this.isListening) return;

    window.removeEventListener('unhandledrejection', this.handlePromiseRejection, true);
    this.isListening = false;
  }

  public dispose(): void {
    this.stop();
    this.clearSubscribers();
  }

  private handlePromiseRejection = (event: PromiseRejectionEvent): void => {
    const report = new PromiseErrorReport({
      id: generateId(),
      createdAt: PerformanceTime.now(),
      promiseError: event,
    });

    this.notify(report);
  };
}