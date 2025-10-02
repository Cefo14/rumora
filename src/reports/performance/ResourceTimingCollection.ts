import type { ResourceTimingReport } from '@/reports/performance/ResourceTimingReport';
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { type ReportCollectionData, ReportCollection } from '@/reports/ReportCollection';

type ResourceTimingCollectionData = ReportCollectionData<ResourceTimingReport>;

/**
 * Collection and aggregator for ResourceTimingReport instances.
 * 
 * This class maintains a collection of resource timing reports and provides
 * aggregated insights and statistics. It's designed to be used by the
 * ResourceTiming observer to maintain state and provide useful analytics
 * about resource loading performance.
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
   */
  public get totalTransferSize(): number {
    return this.reports
      .reduce((total, resource) => total + resource.transferSize, 0);
  }

  /**
   * Gets total decoded size of all resources (uncompressed)
   */
  public get totalDecodedSize(): number {
    return this.reports
      .reduce((total, resource) => total + resource.decodedSize, 0);
  }

  /**
   * Gets total encoded size of all resources (compressed)
   */
  public get totalEncodedSize(): number {
    return this.reports
      .reduce((total, resource) => total + resource.encodedSize, 0);
  }

  /**
   * Gets the slowest loading resource
   */
  public get slowestResource(): ResourceTimingReport | null {
    if (this.isEmpty) return null;

    return this.reports
      .reduce((slowest, current) =>
        current.duration > slowest.duration ? current : slowest
      );
  }

  /**
   * Gets all third-party resources in the collection
   */
  public get thirdPartyResources(): ResourceTimingReport[] {
    return this.reports.filter(resource => resource.isThirdParty);
  }

  /**
   * Groups resources by their type (e.g., script, image, css).
   */
  public get resourcesByType(): Record<string, ResourceTimingReport[]> {
    const byType: Record<string, ResourceTimingReport[]> = {};
    this.reports.forEach(resource => {
      if (!byType[resource.type]) {
        byType[resource.type] = [];
      }
      byType[resource.type].push(resource);
    });
    return byType;
  }

  /**
   * Gets the average load time across all resources
   */
  public get averageLoadTime(): number {
    return this.isEmpty ? 0 : 
      Math.round(this.reports.reduce((sum, r) => sum + r.duration, 0) / this.totalReports);
  }

  /**
   * Gets total compression savings across all resources
   */
  public get compressionSavings(): number {
    return this.totalDecodedSize - this.totalEncodedSize;
  }

  /**
   * Groups resources by their domain.
   */
  public get resourcesByDomain(): Record<string, ResourceTimingReport[]> {
    const byDomain: Record<string, ResourceTimingReport[]> = {};
    this.reports.forEach(resource => {
      const domain = resource.domain;
      if (!byDomain[domain]) {
        byDomain[domain] = [];
      }
      byDomain[domain].push(resource);
    });
    return byDomain;
  }

  /**
   * Gets the last added resource in the collection.
   * Alias for lastReport from base class for semantic clarity.
   */
  public get lastResource(): ResourceTimingReport | null {
    return this.lastReport;
  }

  toString(): string {
    return `ResourceTimingCollection: ${this.totalReports} resources, ${Math.round(this.totalTransferSize / 1024)}KB total`;
  }

  toJSON() {
    return {
      // Collection metadata
      id: this.id,
      createdAt: this.createdAt.absoluteTime,
      
      // Summary statistics
      totalReports: this.totalReports,
      totalTransferSize: this.totalTransferSize,
      totalDecodedSize: this.totalDecodedSize,
      totalEncodedSize: this.totalEncodedSize,
      compressionSavings: this.compressionSavings,
      averageLoadTime: this.averageLoadTime,
      
      // Detailed analysis
      reports: this.reports,
      resourcesByType: this.resourcesByType,
      resourcesByDomain: this.resourcesByDomain,
      thirdPartyResources: this.thirdPartyResources,
      slowestResource: this.slowestResource,
      lastResource: this.lastResource,
    };
  }
}