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
  private static instance: UnhandledPromiseRejectionObserver | null = null;

  private constructor() {
    super('unhandledrejection');
  }

  /**
   * Get the singleton instance of the Unhandled Promise Rejection observer.
   * If the instance does not exist, it creates a new one.
   * 
   * **Note:** Use observeUnhandledPromiseRejection() factory function instead.
   *
   * @returns Singleton instance of the Unhandled Promise Rejection observer.
   */
  public static getInstance(): UnhandledPromiseRejectionObserver {
    if (!UnhandledPromiseRejectionObserver.instance) {
      UnhandledPromiseRejectionObserver.instance = new UnhandledPromiseRejectionObserver();
    }
    return UnhandledPromiseRejectionObserver.instance;
  }

  /**
   * Reset the singleton instance of the Unhandled Promise Rejection observer.
   * This is useful for testing or re-initialization purposes.
   */
  public static resetInstance(): void {
    UnhandledPromiseRejectionObserver.getInstance()?.dispose();
    UnhandledPromiseRejectionObserver.instance = null;
  }

  protected override onEvent(event: PromiseRejectionEvent): void {
    const report = UnhandledPromiseRejectionReport.fromPromiseRejectionEvent(
      generateId(),
      event
    );

    this.notifySuccess(report);
  };
}

/**
 * Get the singleton instance of the Unhandled Promise Rejection observer.
 * @returns Singleton instance of the Unhandled Promise Rejection observer.
 */
export const observeUnhandledPromiseRejection = () => UnhandledPromiseRejectionObserver.getInstance();

/**
 * Reset the singleton instance of the Unhandled Promise Rejection observer.
 * This is useful for testing or re-initialization purposes.
 */
export const resetUnhandledPromiseRejection = () => UnhandledPromiseRejectionObserver.resetInstance();