import { generateId } from '@/shared/generateId';
import { CSPViolationErrorReport } from '@/reports/errors/CSPViolationErrorReport';
import { WindowEventObserver } from '@/shared/WindowEventObserver';

/**
 * Observer for capturing Content Security Policy (CSP) violation errors.
 * Listens for 'securitypolicyviolation' events on the document and generates reports
 * when such violations occur, providing insights into potential security issues.
 */
export class CSPViolationObserver extends WindowEventObserver<'securitypolicyviolation', CSPViolationErrorReport> {
  constructor() {
    super('securitypolicyviolation');
  }

  protected override onEvent(event: SecurityPolicyViolationEvent): void {
    const report = CSPViolationErrorReport.fromSecurityPolicyViolationEvent(
      generateId(),
      event
    );
    this.notifySuccess(report);
  };
}
