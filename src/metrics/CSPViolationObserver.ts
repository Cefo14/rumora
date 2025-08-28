import { SimpleObserver } from "@/shared/SimpleObserver";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";
import { SecurityPolicyViolationErrorReport } from "@/reports/SecurityPolicyViolationErrorReport";
import { ResourceErrorObserver } from "./ResourceErrorObserver";

export class CSPViolationObserver extends SimpleObserver<SecurityPolicyViolationErrorReport> {
  private isListening = false;
  private resourceErrorObserver?: ResourceErrorObserver;

  protected override onSubscribe(): void {
    if (!this.isListening) {
      this.start();
    }
  }

  public start(): void {
    if (this.isListening) return;

    document.addEventListener('securitypolicyviolation', this.handleCSPViolation);
    this.isListening = true;
  }

  public stop(): void {
    if (!this.isListening) return;

    document.removeEventListener('securitypolicyviolation', this.handleCSPViolation);
    this.isListening = false;
  }

  public dispose(): void {
    this.stop();
    this.clearSubscribers();
    this.resourceErrorObserver = undefined;
  }

  private handleCSPViolation = (event: SecurityPolicyViolationEvent): void => {
    const report = new SecurityPolicyViolationErrorReport({
      id: generateId(),
      createdAt: PerformanceTime.now(),
      violationEvent: event,
    });

    this.notify(report);
  };
}
