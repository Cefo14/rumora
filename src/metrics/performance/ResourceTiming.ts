import { ResourceTimingCollection, ResourceTimingCollectionJSON } from "@/reports/performance/ResourceTimingCollection";
import { ResourceTimingReport } from "@/reports/performance/ResourceTimingReport";
import { generateId } from "@/shared/generateId";
import { PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";

/**
 * Observer for Resource Timing performance entries.
 * 
 * Monitors the loading performance of resources such as stylesheets, scripts,
 * images, and other assets. Provides detailed network timing information
 * including DNS lookup, TCP connection, request/response times, and transfer sizes.
 * 
 * This helps identify resource loading bottlenecks and optimize web performance
 * by analyzing each resource's loading characteristics and identifying patterns
 * in slow-loading assets.
 * 
 * @example
 * ```typescript
 * const resourceTiming = new ResourceTiming();
 * 
 * resourceTiming.subscribe((error, report) => {
 *   if (error) {
 *     console.error('Resource Timing not supported:', error.message);
 *     return;
 *   }
 *   
 *   if (report.isProblematic) {
 *     console.warn(`Slow resource detected: ${report.name}`);
 *     console.warn(`Category: ${report.category}, Duration: ${report.duration}ms`);
 *     console.warn(`Primary bottleneck: ${report.primaryBottleneck}`);
 *   }
 * });
 * ```
 */
export class ResourceTiming extends PerformanceMetricObserver<ResourceTimingCollectionJSON> {
  private readonly resourceCollection: ResourceTimingCollection = new ResourceTimingCollection();

  /**
   * Resource prefixes to ignore when monitoring.
   * These typically represent internal browser resources or extensions
   * that are not relevant for web performance analysis.
   */
  private readonly IGNORED_RESOURCES = [
    'data:',
    'blob:',
    'about:',
    'chrome-extension:',
    'moz-extension:',
    'safari-extension:',
    'webkit-masked-url:'
  ] as const;

  /**
   * Minimum duration threshold for resource monitoring (in milliseconds).
   * Resources loading faster than this are typically cached or very small
   * and don't provide meaningful performance insights.
   */
  private readonly MIN_DURATION_MS = 1;

  /**
   * Creates a new ResourceTiming observer instance.
   * 
   * Configures the PerformanceObserver to monitor 'resource' entries
   * with buffered entries enabled to capture resources that may have loaded
   * before the observer was initialized.
   */
  constructor() {
    super("resource", {
      type: "resource",
      buffered: true
    });
  }

  /**
   * Processes performance observer entries for resource timing.
   * 
   * Filters and validates each resource entry, then creates detailed
   * ResourceTimingReport instances for resources that meet the monitoring
   * criteria. Each report contains comprehensive timing and size information
   * for performance analysis.
   * 
   * @param entryList - List of performance entries from the observer
   * @protected
   */
  protected onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as PerformanceResourceTiming[];

    for (const entry of entries) {
      if (!this.isValidResource(entry)) continue;
      const report = this.createResourceTimingReport(entry);
      this.resourceCollection.addResource(report);
    }
    this.notifySuccess(this.resourceCollection.toJSON());
  }

  /**
   * Validates if a resource entry should be monitored.
   * 
   * Applies filtering criteria to exclude resources that are not useful
   * for performance monitoring, such as browser extensions, data URLs,
   * very fast cached resources, and navigation entries.
   * 
   * @param entry - Performance resource timing entry
   * @returns True if the resource should be monitored
   * @private
   */
  private isValidResource(entry: PerformanceResourceTiming): boolean {
    // Filter out resources we don't want to monitor
    if (this.IGNORED_RESOURCES.some(prefix => entry.name.startsWith(prefix))) {
      return false;
    }

    // Verify it has meaningful timing data
    if (entry.duration < this.MIN_DURATION_MS) {
      return false;
    }
    
    // Skip navigation entries (main document)
    // These are handled by NavigationTiming observer
    if (entry.initiatorType === 'navigation') {
      return false;
    }

    // Skip entries without valid fetch start time
    if (entry.fetchStart <= 0) {
      return false;
    }

    return true;
  }

  /**
   * Creates a ResourceTimingReport from a performance entry.
   * 
   * Converts the raw PerformanceResourceTiming data into a structured
   * report with PerformanceTimestamp objects for consistent timing handling
   * and comprehensive resource analysis capabilities.
   * 
   * @param entry - Performance resource timing entry
   * @returns New ResourceTimingReport instance
   * @private
   */
  private createResourceTimingReport(entry: PerformanceResourceTiming): ResourceTimingReport {
    return ResourceTimingReport.fromPerformanceResourceTiming(
      generateId(),
      entry
    );
  }
}