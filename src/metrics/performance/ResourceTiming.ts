import { ResourceTimingCollection } from '@/reports/performance/ResourceTimingCollection';
import { ResourceTimingReport } from '@/reports/performance/ResourceTimingReport';
import { generateId } from '@/shared/generateId';
import { PerformanceMetricObserver } from '@/shared/PerformanceMetricObserver';

/**
 * Observer for Resource Timing performance entries.
 * 
 * Monitors the loading performance of resources such as stylesheets, scripts,
 * images, and other assets. Provides detailed network timing information
 * including DNS lookup, TCP connection, request/response times, and transfer sizes.
 * 
 * **Cumulative Pattern**: Each emission contains the complete state of all
 * resources loaded since observer initialization. Use dispose() to free memory
 * when monitoring is complete.
 */
export class ResourceTiming extends PerformanceMetricObserver<ResourceTimingCollection> {
  private static instance: ResourceTiming | null = null;
  private reports: ResourceTimingReport[] = [];

  /**
   * Resource prefixes to ignore - browser internal resources and extensions.
   */
  private readonly IGNORED_RESOURCES = [
    'data:',
    'blob:',
    'chrome-extension:',
    'moz-extension:'
  ] as const;

  private constructor() {
    super('resource', {
      type: 'resource',
      buffered: true
    });
  }

  /**
   * Get the singleton instance of the Resource Timing observer.
   * If the instance does not exist, it creates a new one.
   * 
   * **Note:** Use observeResourceTiming() factory function instead.
   *
   * @returns Singleton instance of the Resource Timing observer.
   */
  public static getInstance(): ResourceTiming {
    if (!ResourceTiming.instance) {
      ResourceTiming.instance = new ResourceTiming();
    }
    return ResourceTiming.instance;
  }

  /**
   * Reset the singleton instance of the Resource Timing observer.
   * This is useful for testing or re-initialization purposes.
   */
  public static resetInstance(): void {
    ResourceTiming.getInstance()?.dispose();
    ResourceTiming.instance = null;
  }

  public override dispose(): void {
    super.dispose();
    this.reports = [];
  }

  /**
   * Processes resource timing entries and creates reports for valid resources.
   */
  protected override onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as PerformanceResourceTiming[];

    for (const entry of entries) {
      if (this.isValidResource(entry)) {
        const report = ResourceTimingReport.fromPerformanceResourceTiming(
          generateId(),
          entry
        );
        this.reports.push(report);
      }
    }

    const resourceTimingCollection = ResourceTimingCollection.fromResourceTimingReports(
      generateId(),
      this.reports
    );
    this.notifySuccess(resourceTimingCollection);
  }

  /**
   * Validates if a resource entry should be monitored.
   * 
   * Filters out browser extensions, navigation entries, and invalid timing data.
   */
  private isValidResource(entry: PerformanceResourceTiming): boolean {
    // Skip browser extensions and data URLs
    if (this.IGNORED_RESOURCES.some(prefix => entry.name.startsWith(prefix))) {
      return false;
    }

    // Skip navigation entries (handled by NavigationTiming observer)
    if (entry.initiatorType === 'navigation') {
      return false;
    }

    // Skip entries without valid timing data
    if (entry.fetchStart <= 0) {
      return false;
    }

    return true;
  }
}

/**
 * Factory function to get the singleton instance of the Resource Timing observer.
 */
export const observeResourceTiming = () => ResourceTiming.getInstance();

/**
 * Reset the singleton instance of the Resource Timing observer.
 * This is useful for testing or re-initialization purposes.
 */
export const resetResourceTiming = () => ResourceTiming.resetInstance();
