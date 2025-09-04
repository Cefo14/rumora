import { ResourceTimingReport, ResourceTimingReportJSON } from "@/reports/performance/ResourceTimingReport";
import { PerformanceTimestamp } from "@/shared/PerformanceTimestamp";

export interface ResourceTimingCollectionJSON {
  createdAt: number;
  lastUpdated: number;
  resources: ResourceTimingReportJSON[];
}

/**
 * Collection and aggregator for ResourceTimingReport instances.
 * 
 * This class maintains a collection of resource timing reports and provides
 * aggregated insights and statistics. It's designed to be used by the
 * ResourceTiming observer to maintain state and provide useful analytics
 * about resource loading performance.
 * 
 * @example
 * ```typescript
 * const collection = new ResourceTimingCollection();
 * 
 * // Add individual reports (typically from observer)
 * collection.addResource(resourceReport);
 * 
 * // Get aggregated insights
 * console.log(`Total resources: ${collection.totalResources}`);
 * console.log(`Scripts: ${collection.getResourceCountByType('script')}`);
 * console.log(`Slow resources: ${collection.getSlowResources().length}`);
 * 
 * // Get summary for reporting
 * const summary = collection.getSummary();
 * ```
 */
export class ResourceTimingCollection {
  /** Internal collection of resource timing reports */
  private readonly resources: Map<string, ResourceTimingReport> = new Map();

  public createdAt: PerformanceTimestamp;

  /** Timestamp of the last update to the collection */
  public lastUpdated: PerformanceTimestamp;

  /**
   * Creates a new ResourceTimingCollection instance.
   */
  constructor() {
    const now = PerformanceTimestamp.now();
    this.createdAt = now;
    this.lastUpdated = now;
  }

  /**
   * Gets the collection size.
   * 
   * @returns Number of resources in the collection
   */
  public get size(): number {
    return this.resources.size;
  }

  /**
   * Checks if the collection is empty.
   * 
   * @returns True if no resources are in the collection
   */
  public get isEmpty(): boolean {
    return this.resources.size === 0;
  }

  /**
   * Adds a resource timing report to the collection.
   * 
   * If a resource with the same ID already exists, it will be replaced.
   * This allows for updating existing entries while avoiding duplicates.
   * 
   * @param report - ResourceTimingReport to add
   */
  public addResource(report: ResourceTimingReport): void {
    this.resources.set(report.id, report);
    this.updateLastUpdatedTime();
  }

  toString(): string {
    return `ResourceTimingCollection: ${this.size} resources`;
  }

  toJSON(): ResourceTimingCollectionJSON {
    return {
      createdAt: this.createdAt.toJSON(),
      lastUpdated: this.lastUpdated.toJSON(),
      resources: Array.from(this.resources.values()).map(resource => resource.toJSON())
    };
  }

  private updateLastUpdatedTime(): void {
    this.lastUpdated = PerformanceTimestamp.now();
  }
}