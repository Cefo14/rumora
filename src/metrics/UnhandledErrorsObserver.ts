import { SimpleObserver } from "@/shared/SimpleObserver";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";
import { JavaScriptErrorReport } from "@/reports/JavaScriptErrorReport";

export class UnhandledErrorsObserver extends SimpleObserver<JavaScriptErrorReport> {
  private isListening = false;

  protected override onSubscribe(): void {
    if (!this.isListening) {
      this.start();
    }
  }

  public start(): void {
    if (this.isListening) return;

    window.addEventListener('error', this.handleErrorEvent, true);
    this.isListening = true;
  }

  public stop(): void {
    if (!this.isListening) return;
    window.removeEventListener('error', this.handleErrorEvent, true);
    this.isListening = false;
  }

  public dispose(): void {
    this.stop();
    this.clearSubscribers();
  }

  private handleErrorEvent = (errorEvent: ErrorEvent): void => {
    if (errorEvent.target !== window) return;

    const report = new JavaScriptErrorReport({
      id: generateId(),
      createdAt: PerformanceTime.now(),
      errorEvent: errorEvent,
    });

    this.notify(report);
  };
}
