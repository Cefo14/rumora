import { PerformanceReport } from "@/shared/PerformanceReport";

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorReport extends PerformanceReport {
  readonly severity: SeverityLevel;
}
