import { SimpleObserver } from "@/shared/SimpleObserver";
import { generateId } from "@/shared/generateId";
import { PromiseErrorReport } from "@/reports/errors/PromiseErrorReport";
import { PerformanceTimestamp } from "@/shared/PerformanceTimestamp";

export class UnhandledPromiseErrorsObserver extends SimpleObserver<PromiseErrorReport> {
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
    console.log(event);
    const report = PromiseErrorReport.fromPromiseRejectionEvent(
      generateId(),
      PerformanceTimestamp.now(),
      event
    );

    this.notify(report);
  };
}