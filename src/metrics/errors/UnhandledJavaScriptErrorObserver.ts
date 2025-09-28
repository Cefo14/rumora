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
  private static instance: UnhandledJavaScriptErrorObserver | null = null;

  private constructor() {
    super('error');
  }

  /**
   * Get the singleton instance of the Unhandled JavaScript Error observer.
   * If the instance does not exist, it creates a new one.
   * 
   * **Note:** Use observeUnhandledJavaScriptError() factory function instead.
   *
   * @returns Singleton instance of the Unhandled JavaScript Error observer.
   */
  public static getInstance(): UnhandledJavaScriptErrorObserver {
    if (!UnhandledJavaScriptErrorObserver.instance) {
      UnhandledJavaScriptErrorObserver.instance = new UnhandledJavaScriptErrorObserver();
    }
    return UnhandledJavaScriptErrorObserver.instance;
  }

  /**
   * Reset the singleton instance of the Unhandled JavaScript Error observer.
   * This is useful for testing or re-initialization purposes.
   */
  public static resetInstance(): void {
    UnhandledJavaScriptErrorObserver.getInstance()?.dispose();
    UnhandledJavaScriptErrorObserver.instance = null;
  }

  protected onEvent(event: ErrorEvent): void {
    // Only handle unhandled JS errors, not resource loading errors
    if (event.target) return;
    const report = UnhandledJavaScriptErrorReport.fromErrorEvent(
      generateId(),
      event
    );
    this.notifySuccess(report);
  };
}

/**
 * Get the singleton instance of the Unhandled JavaScript Error observer.
 * @returns Singleton instance of the Unhandled JavaScript Error observer.
 */
export const observeUnhandledJavaScriptError = () => UnhandledJavaScriptErrorObserver.getInstance();

/**
 * Reset the singleton instance of the Unhandled JavaScript Error observer.
 * This is useful for testing or re-initialization purposes.
 */
export const resetUnhandledJavaScriptError = () => UnhandledJavaScriptErrorObserver.resetInstance();
