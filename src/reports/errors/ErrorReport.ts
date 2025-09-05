import { Report } from "@/shared/Report";

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorReport extends Report {
  readonly severity: SeverityLevel;
}
