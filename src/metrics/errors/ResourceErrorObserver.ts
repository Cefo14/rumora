import { generateId } from '@/shared/generateId';
import { ResourceErrorReport } from '@/reports/errors/ResourceErrorReport';
import { WindowEventObserver } from '@/shared/WindowEventObserver';

/**
 * Observer for capturing resource loading errors.
 * Listens for 'error' events on the window and generates reports
 * when resource loading errors occur, providing insights into issues
 * with loading external resources like scripts, stylesheets, or images.
 */
export class ResourceErrorObserver extends WindowEventObserver<'error', ResourceErrorReport> {
  constructor() {
    super('error');
  }

  protected override onEvent(event: ErrorEvent): void {
    // Only handle resource loading errors, not JS errors
    if (!event.target || event.target === window) return;
    const report = ResourceErrorReport.fromErrorEvent(
      generateId(),
      event
    );
    this.notifySuccess(report);
  }
}
