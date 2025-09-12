import { ResourceTimingCollection } from "@/reports/performance/ResourceTimingCollection";
import { ResourceTimingReport } from "@/reports/performance/ResourceTimingReport";
import { generateId } from "@/shared/generateId";
import { PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";
import { Serialized } from "@/types/Serialized";

/**
 * Observer for Resource Timing performance entries.
 * 
 * Monitors the loading performance of resources such as stylesheets, scripts,
 * images, and other assets. Provides detailed network timing information
 * including DNS lookup, TCP connection, request/response times, and transfer sizes.
 */
export class ResourceTiming extends PerformanceMetricObserver<Serialized<ResourceTimingCollection>> {
  private readonly resourceCollection: ResourceTimingCollection = new ResourceTimingCollection();

  /**
   * Resource prefixes to ignore - browser internal resources and extensions.
   */
  private readonly IGNORED_RESOURCES = [
    'data:',
    'blob:',
    'chrome-extension:',
    'moz-extension:'
  ] as const;

  constructor() {
    super("resource", {
      type: "resource",
      buffered: true
    });
  }

  /**
   * Processes resource timing entries and creates reports for valid resources.
   */
  protected onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as PerformanceResourceTiming[];

    for (const entry of entries) {
      if (this.isValidResource(entry)) {
        const report = ResourceTimingReport.fromPerformanceResourceTiming(generateId(), entry);
        this.resourceCollection.addResource(report);
      }
    }
    
    this.notifySuccess(this.resourceCollection.toJSON());
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
