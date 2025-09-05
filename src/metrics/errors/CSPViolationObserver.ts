import { SimpleObserver } from "@/shared/SimpleObserver";
import { generateId } from "@/shared/generateId";
import { CSPViolationErrorReport } from "@/reports/errors/CSPViolationErrorReport";
export class CSPViolationObserver extends SimpleObserver<CSPViolationErrorReport> {
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

    document.addEventListener('securitypolicyviolation', this.handleCSPViolation);
    this.isListening = true;
  }

  private stop(): void {
    if (!this.isListening) return;

    document.removeEventListener('securitypolicyviolation', this.handleCSPViolation);
    this.isListening = false;
  }

  private handleCSPViolation = (event: SecurityPolicyViolationEvent): void => {
    const report = CSPViolationErrorReport.fromSecurityPolicyViolationEvent(
      generateId(),
      event
    );

    this.notify(report);
  };
}
