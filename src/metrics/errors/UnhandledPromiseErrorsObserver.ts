import { SimpleObserver } from "@/shared/SimpleObserver";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";
import { PromiseErrorReport } from "@/reports/errors/PromiseErrorReport";

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
    const report = PromiseErrorReport.fromPromiseRejectionEvent(
      generateId(),
      PerformanceTime.now(),
      event
    );

    this.notify(report);
  };
}