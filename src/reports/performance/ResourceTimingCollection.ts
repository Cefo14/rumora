import type { ResourceTimingReport } from '@/reports/performance/ResourceTimingReport';
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { type ReportCollectionData, ReportCollection } from '../ReportCollection';

type ResourceTimingCollectionData = ReportCollectionData<ResourceTimingReport>;

/**
 * Collection and aggregator for ResourceTimingReport instances.
 * 
 * This class maintains a collection of resource timing reports and provides
 * aggregated insights and statistics. It's designed to be used by the
 * ResourceTiming observer to maintain state and provide useful analytics
 * about resource loading performance.
 * 
 */
export class ResourceTimingCollection extends ReportCollection<ResourceTimingReport> {
  /**
   * Creates a new ResourceTimingCollection instance.
   */
  private constructor(data: ResourceTimingCollectionData) {
    super(data);
    Object.freeze(this);
  }

  public static create(data: ResourceTimingCollectionData): ResourceTimingCollection {
    return new ResourceTimingCollection(data);
  }

  public static fromResourceTimingReports(
    id: string,
    reports: ResourceTimingReport[]
  ): ResourceTimingCollection {
    return new ResourceTimingCollection({
      id,
      createdAt: PerformanceTime.now(),
      reports: reports,
    });
  }


  /**
   * Gets total transfer size of all resources (bytes over the wire)
   * 
   * @returns Total bytes transferred across all resources
   */
  public get totalTransferSize(): number {
    return this._reports
      .reduce((total, resource) => total + resource.transferSize, 0);
  }

  /**
   * Gets total decoded size of all resources (uncompressed)
   * 
   * @returns Total uncompressed bytes across all resources
   */
  public get totalDecodedSize(): number {
    return this._reports
      .reduce((total, resource) => total + resource.decodedSize, 0);
  }

  /**
   * Gets total encoded size of all resources (compressed)
   * 
   * @returns Total compressed bytes across all resources
   */
  public get totalEncodedSize(): number {
    return this._reports
      .reduce((total, resource) => total + resource.encodedSize, 0);
  }

  /**
   * Gets the slowest loading resource
   * 
   * @returns Slowest resource or null if collection is empty
   */
  public get slowestResource(): ResourceTimingReport | null {
    if (this.isEmpty) return null;

    return this._reports
      .reduce((slowest, current) =>
        current.duration > slowest.duration ? current : slowest
      );
  }

  /**
   * Gets all third-party resources in the collection
   * 
   * @returns Array of third-party ResourceTimingReport instances
   */
  public get thirdPartyResources(): ResourceTimingReport[] {
    return this._reports.filter(resource => resource.isThirdParty);
  }

  /**
   * Groups resources by their type (e.g., script, image, css).
   * 
   * @returns Record mapping resource types to arrays of ResourceTimingReport
   */
  public get resourcesByType (): Record<string, ResourceTimingReport[]> {
    const byType: Record<string, ResourceTimingReport[]> = {};
    this._reports.forEach(resource => {
      if (!byType[resource.type]) {
        byType[resource.type] = [];
      }
      byType[resource.type].push(resource);
    });
    return byType;
  }

  /**
   * Gets the average load time across all resources
   * 
   * @returns Average load time in milliseconds, or 0 if collection is empty
   */
  public get averageLoadTime(): number {
    return this.isEmpty ? 0 : 
      Math.round(this._reports.reduce((sum, r) => sum + r.duration, 0) / this.totalReports);
  }

  /**
   * Gets total compression savings across all resources
   * 
   * @returns Total bytes saved due to compression
   */
  public get compressionSavings(): number {
    return this.totalDecodedSize - this.totalEncodedSize;
  }

  /**
   * Groups resources by their domain.
   * 
   * @returns Record mapping domains to arrays of ResourceTimingReport
   */
  public get resourcesByDomain(): Record<string, ResourceTimingReport[]> {
    const byDomain: Record<string, ResourceTimingReport[]> = {};
    this._reports.forEach(resource => {
      const domain = resource.domain;
      if (!byDomain[domain]) {
        byDomain[domain] = [];
      }
      byDomain[domain].push(resource);
    });
    return byDomain;
  }

  /** Gets the last added resource in the collection
   * 
   * @returns Last ResourceTimingReport or null if collection is empty
   */
  public get lastResource(): ResourceTimingReport | null {
    return this._reports.at(-1) || null;
  }


  toString(): string {
    return `ResourceTimingCollection: ${this.totalReports} resources, ${Math.round(this.totalTransferSize / 1024)}KB total`;
  }

  toJSON() {
    return {
      /**
       * Total number of resources in the collection
       */
      totalReports: this.totalReports,
      /**
       * Total bytes transferred across all resources
       */
      totalTransferSize: this.totalTransferSize,
      /**
       * Total uncompressed bytes across all resources
       */
      totalDecodedSize: this.totalDecodedSize,
      /**
       * Total compressed bytes across all resources
       */
      totalEncodedSize: this.totalEncodedSize,
      /**
       * Total bytes saved due to compression
       */
      compressionSavings: this.compressionSavings,
      /**
       * Average load time across all resources
       */
      averageLoadTime: this.averageLoadTime,
      
      /**
       * Array of all ResourceTimingReport instances in the collection
       */
      reports: this.reports,
      /**
       * Map of resource types to arrays of ResourceTimingReport instances
       */
      resourcesByType: this.resourcesByType,
      /**
       * Map of resource domains to arrays of ResourceTimingReport instances
       */
      resourcesByDomain: this.resourcesByDomain,
      /**
       * Array of third-party ResourceTimingReport instances
       */
      thirdPartyResources: this.thirdPartyResources,
      /**
       * The slowest ResourceTimingReport instance
       */
      slowestResource: this.slowestResource ?? null,

      /**
       * The most recently added ResourceTimingReport instance
       */
      lastResource: this.lastResource ?? null,
    };
  }
}