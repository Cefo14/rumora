import { SimpleObserver } from "@/shared/SimpleObserver";
import { generateId } from "@/shared/generateId";
import { ResourceErrorReport } from "@/reports/errors/ResourceErrorReport";
import { PerformanceTimestamp } from "@/shared/PerformanceTimestamp";

export class ResourceErrorObserver extends SimpleObserver<ResourceErrorReport> {
  private isListening = false;

  protected override onSubscribe(): void {
    this.start();
  }

  public dispose(): void {
    this.stop();
    this.clearSubscribers();
  }

  private start(): void {
    if (this.isListening) return;
    window.addEventListener('error', this.handleErrorEvent, true);
    this.isListening = true;
  }

  private stop(): void {
    if (!this.isListening) return;
    window.removeEventListener('error', this.handleErrorEvent, true);
    this.isListening = false;
  }

  private handleErrorEvent = (errorEvent: ErrorEvent): void => {
    if (!errorEvent.target || errorEvent.target === window) return;

    console.log(errorEvent);
    const report = ResourceErrorReport.fromErrorEvent(
      generateId(),
      PerformanceTimestamp.now(),
      errorEvent
    );

    this.notify(report);
  };
}
