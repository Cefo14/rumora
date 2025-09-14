import { generateId } from '@/shared/generateId';
import { UnhandledJavaScriptErrorReport } from '@/reports/errors/UnhandledJavaScriptErrorReport';
import { WindowEventObserver } from '@/shared/WindowEventObserver';

/**
 * Observer for capturing unhandled JavaScript errors.
 * 
 * Listens for 'error' events on the window and generates reports
 * when unhandled JavaScript errors occur, providing insights into
 * runtime issues that affect the user experience.
 */
export class UnhandledJavaScriptErrorObserver extends WindowEventObserver<'error', UnhandledJavaScriptErrorReport> {
  constructor() {
    super('error');
  }

  protected onEvent(event: ErrorEvent): void {
    const report = UnhandledJavaScriptErrorReport.fromErrorEvent(
      generateId(),
      event
    );
    this.notifySuccess(report);
  };
}
