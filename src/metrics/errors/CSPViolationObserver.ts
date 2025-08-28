import { SimpleObserver } from "@/shared/SimpleObserver";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";
import { SecurityPolicyViolationErrorReport } from "@/reports/errors/SecurityPolicyViolationErrorReport";

export class CSPViolationObserver extends SimpleObserver<SecurityPolicyViolationErrorReport> {
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
    const report = SecurityPolicyViolationErrorReport.fromSecurityPolicyViolationEvent(
      generateId(),
      PerformanceTime.now(),
      event
    );

    this.notify(report);
  };
}
