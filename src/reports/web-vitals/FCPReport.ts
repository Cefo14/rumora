import { WebVitalReport } from "@/reports/web-vitals/WebVitalReport";

/**
 * First Contentful Paint (FCP) report for measuring loading performance.
 * 
 * FCP measures the time from when the page starts loading to when any part of the page's
 * content is rendered on the screen. This includes text, images, SVG elements, or canvas
 * elements with non-white background colors.
 * 
 * Thresholds:
 * - Good: < 1.8s
 * - Needs Improvement: 1.8s - 3.0s  
 * - Poor: >= 3.0s
 */
export class FCPReport extends WebVitalReport {
  readonly name = "FIRST_CONTENTFUL_PAINT";

  readonly goodThreshold = 1800;
  readonly poorThreshold = 3000;
}
