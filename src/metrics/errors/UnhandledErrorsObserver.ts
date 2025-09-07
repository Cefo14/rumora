import { SimpleObserver } from "@/shared/SimpleObserver";
import { generateId } from "@/shared/generateId";
import { JavaScriptErrorReport } from "@/reports/errors/JavaScriptErrorReport";
import { Serialized } from "@/shared/Serialized";

export class UnhandledErrorsObserver extends SimpleObserver<Serialized<JavaScriptErrorReport>> {
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

    window.addEventListener('error', this.handleErrorEvent, true);
    this.isListening = true;
  }

  private stop(): void {
    if (!this.isListening) return;
    window.removeEventListener('error', this.handleErrorEvent, true);
    this.isListening = false;
  }

  private handleErrorEvent = (errorEvent: ErrorEvent): void => {
    if (errorEvent.target !== window) return;
    const report = JavaScriptErrorReport.fromErrorEvent(
      generateId(),
      errorEvent
    );
    this.notify(report.toJSON());
  };
}
