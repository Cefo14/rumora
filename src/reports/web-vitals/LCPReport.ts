import { WebVitalReport } from "@/reports/web-vitals/WebVitalReport";

/**
 * Largest Contentful Paint (LCP) report for measuring loading performance.
 * 
 * LCP measures the time from when the page starts loading to when the largest text block
 * or image element is rendered on the screen. This metric provides insight into when the
 * main content of a page has finished loading and is ready for user interaction.
 * 
 * Thresholds:
 * - Good: < 2.5s
 * - Needs Improvement: 2.5s - 4.0s
 * - Poor: >= 4.0s
 */
export class LCPReport extends WebVitalReport {
  readonly name = "LARGEST_CONTENTFUL_PAINT";

  readonly goodThreshold = 2500;
  readonly poorThreshold = 4000;
}
