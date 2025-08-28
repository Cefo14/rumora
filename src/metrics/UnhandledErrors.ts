import { SimpleObserver } from "@/shared/SimpleObserver";
import { generateId } from "@/shared/generateId";
import { ErrorReport } from "@/reports/ErrorReport";
import { PerformanceTime } from "@/shared/PerformanceTime";
import { JavaScriptErrorReport } from "@/reports/JavaScriptErrorReport";
import { ResourceErrorReport } from "@/reports/ResourceErrorReport";
import { PromiseErrorReport } from "@/reports/PromiseErrorReport";
import { SecurityPolicyViolationErrorReport } from "@/reports/SecurityPolicyViolationErrorReport";

export class UnhandledErrors extends SimpleObserver<ErrorReport> {
  constructor() {
    super();
    window.addEventListener('error', this.handleErrorEvent.bind(this), true);
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this), true);
    document.addEventListener('securitypolicyviolation', this.handleCSPViolation.bind(this));
  }

  private handleErrorEvent(errorEvent: ErrorEvent): void {
    const target = errorEvent.target;
    if (target && target !== window) this.handleResourceError(errorEvent);
    else this.handleJavaScriptError(errorEvent);
  }

  private handleJavaScriptError(errorEvent: ErrorEvent): void {
    const report = new JavaScriptErrorReport({
      id: generateId(),
      createdAt: PerformanceTime.now(),
      errorEvent: errorEvent,
    });

    this.notify(report);
  }

  private handleResourceError(errorEvent: ErrorEvent): void {
    const report = new ResourceErrorReport({
      id: generateId(),
      createdAt: PerformanceTime.now(),
      errorEvent,
    });

    this.notify(report);
  }

  private handlePromiseRejection(event: PromiseRejectionEvent): void {
    console.log(event);

    const report = new PromiseErrorReport({
      id: generateId(),
      createdAt: PerformanceTime.now(),
      promiseError: event,
    });

    this.notify(report);
  }

  private handleCSPViolation(event: SecurityPolicyViolationEvent): void {
    console.log(event);
    const report = new SecurityPolicyViolationErrorReport({
      id: generateId(),
      createdAt: PerformanceTime.now(),
      violationEvent: event,
    });

    this.notify(report);
  }
}
