import { SimpleObserver } from '@/shared/SimpleObserver';
import { generateId } from '@/shared/generateId';
import { ResourceErrorReport } from '@/reports/errors/ResourceErrorReport';

/**
 * Observer for capturing resource loading errors.
 * Listens for 'error' events on the window and generates reports
 * when resource loading errors occur, providing insights into issues
 * with loading external resources like scripts, stylesheets, or images.
 */
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

    const report = ResourceErrorReport.fromErrorEvent(
      generateId(),
      errorEvent
    );

    this.notify(report);
  };
}
