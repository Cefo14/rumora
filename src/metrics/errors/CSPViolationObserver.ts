import { generateId } from '@/shared/generateId';
import { CSPViolationErrorReport } from '@/reports/errors/CSPViolationErrorReport';
import { WindowEventObserver } from '@/shared/WindowEventObserver';

/**
 * Observer for capturing Content Security Policy (CSP) violation errors.
 * Listens for 'securitypolicyviolation' events on the document and generates reports
 * when such violations occur, providing insights into potential security issues.
 */
export class CSPViolationObserver extends WindowEventObserver<'securitypolicyviolation', CSPViolationErrorReport> {
  private static instance: CSPViolationObserver | null = null;

  private constructor() {
    super('securitypolicyviolation');
  }

  /**
   * Get the singleton instance of the CSP Violation observer.
   * If the instance does not exist, it creates a new one.
   * 
   * **Note:** Use observeCSPViolation() factory function instead.
   *
   * @returns Singleton instance of the CSP Violation observer.
   */
  public static getInstance(): CSPViolationObserver {
    if (!CSPViolationObserver.instance) {
      CSPViolationObserver.instance = new CSPViolationObserver();
    }
    return CSPViolationObserver.instance;
  }

  /**
   * Reset the singleton instance of the CSP Violation observer.
   * This is useful for testing or re-initialization purposes.
   */
  public static resetInstance(): void {
    CSPViolationObserver.getInstance()?.dispose();
    CSPViolationObserver.instance = null;
  }

  protected override onEvent(event: SecurityPolicyViolationEvent): void {
    const report = CSPViolationErrorReport.fromSecurityPolicyViolationEvent(
      generateId(),
      event
    );
    this.notifySuccess(report);
  };
}

/**
 * Get the singleton instance of the CSP Violation observer.
 * @returns Singleton instance of the CSP Violation observer.
 */
export const observeCSPViolation = () => CSPViolationObserver.getInstance();

/**
 * Reset the singleton instance of the CSP Violation observer.
 * This is useful for testing or re-initialization purposes.
 */
export const resetCSPViolation = () => CSPViolationObserver.resetInstance();
