import { WebVitalReport } from "@/reports/web-vitals/WebVitalReport";

/**
 * Cumulative Layout Shift (CLS) report for measuring visual stability.
 * 
 * CLS measures the cumulative impact of unexpected layout shifts that occur
 * during the entire lifespan of a page. Lower values indicate better stability.
 * 
 * Thresholds:
 * - Good: < 0.1
 * - Needs Improvement: 0.1 - 0.25
 * - Poor: >= 0.25
 */
export class CLSReport extends WebVitalReport {
  readonly name = "CUMULATIVE_LAYOUT_SHIFT";
  readonly goodThreshold = 0.1;
  readonly poorThreshold = 0.25;

  public override toString(): string {
    return `${this.name}: ${this.value.toFixed(3)} (${this.rating})`;
  }
}
