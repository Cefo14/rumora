import { SimpleObserver } from "@/shared/SimpleObserver";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";
import { ResourceErrorReport } from "@/reports/ResourceErrorReport";

export class ResourceErrorObserver extends SimpleObserver<ResourceErrorReport> {
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
    if (!errorEvent.target || errorEvent.target === window) return;

    const report = new ResourceErrorReport({
      id: generateId(),
      createdAt: PerformanceTime.now(),
      errorEvent,
    });

    this.notify(report);
  };
}
