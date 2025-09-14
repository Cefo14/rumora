import { generateId } from '@/shared/generateId';
import { UnhandledPromiseRejectionReport } from '@/reports/errors/UnhandledPromiseRejectionReport';
import { WindowEventObserver } from '@/shared/WindowEventObserver';

/**
 * Observer for capturing unhandled promise rejections.
 * Listens for 'unhandledrejection' events on the window and generates reports
 * when unhandled promise rejections occur, providing insights into
 * asynchronous issues that affect the user experience.
 */
export class UnhandledPromiseRejectionObserver extends WindowEventObserver<'unhandledrejection', UnhandledPromiseRejectionReport> {
  constructor() {
    super('unhandledrejection');
  }

  protected override onEvent(event: PromiseRejectionEvent): void {
    const report = UnhandledPromiseRejectionReport.fromPromiseRejectionEvent(
      generateId(),
      event
    );

    this.notifySuccess(report);
  };
}