import { SimpleObserver } from "@/shared/SimpleObserver";
import { generateId } from "@/shared/generateId";
import { UnhandledJavaScriptErrorReport } from "@/reports/errors/UnhandledJavaScriptErrorReport";

/**
 * Observer for capturing unhandled JavaScript errors.
 * Listens for 'error' events on the window and generates reports
 * when unhandled JavaScript errors occur, providing insights into
 * runtime issues that affect the user experience.
 */
export class UnhandledJavaScriptErrorObserver extends SimpleObserver<UnhandledJavaScriptErrorReport> {
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
    const report = UnhandledJavaScriptErrorReport.fromErrorEvent(
      generateId(),
      errorEvent
    );
    this.notify(report);
  };
}
