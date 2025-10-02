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
  private static instance: ResourceErrorObserver | null = null;

  private constructor() {
    super('error');
  }

  /**
   * Get the singleton instance of the Resource Error observer.
   * If the instance does not exist, it creates a new one.
   * 
   * **Note:** Use observeResourceError() factory function instead.
   *
   * @returns Singleton instance of the Resource Error observer.
   */
  public static getInstance(): ResourceErrorObserver {
    if (!ResourceErrorObserver.instance) {
      ResourceErrorObserver.instance = new ResourceErrorObserver();
    }
    return ResourceErrorObserver.instance;
  }

  /**
   * Reset the singleton instance of the Resource Error observer.
   * This is useful for testing or re-initialization purposes.
   */
  public static resetInstance(): void {
    ResourceErrorObserver.getInstance()?.dispose();
    ResourceErrorObserver.instance = null;
  }

  protected override onEvent(event: ErrorEvent): void {
    // Only handle resource loading errors, not JS errors
    if (event.target === window) return;
    const report = ResourceErrorReport.fromErrorEvent(
      generateId(),
      event
    );
    this.notifySuccess(report);
  }
}

/**
 * Get the singleton instance of the Resource Error observer.
 * @returns Singleton instance of the Resource Error observer.
 */
export const observeResourceError = () => ResourceErrorObserver.getInstance();

/**
 * Reset the singleton instance of the Resource Error observer.
 * This is useful for testing or re-initialization purposes.
 */
export const resetResourceError = () => ResourceErrorObserver.resetInstance();
