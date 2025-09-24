import type { ResourceTimingReport } from '@/reports/performance/ResourceTimingReport';
import { PerformanceTime } from '@/value-objects/PerformanceTime';

interface ResourceTimingCollectionData {
  id: string;
  createdAt: PerformanceTime;
  resources: ResourceTimingReport[];
}

/**
 * Collection and aggregator for ResourceTimingReport instances.
 * 
 * This class maintains a collection of resource timing reports and provides
 * aggregated insights and statistics. It's designed to be used by the
 * ResourceTiming observer to maintain state and provide useful analytics
 * about resource loading performance.
 * 
 */
export class ResourceTimingCollection {
  /** Internal collection of resource timing reports */
  private readonly resources: ResourceTimingReport[];

  public id: string;

  public createdAt: PerformanceTime;

  /**
   * Creates a new ResourceTimingCollection instance.
   */
  private constructor(data: ResourceTimingCollectionData) {
    this.id = data.id;
    this.resources = Array.from(data.resources);
    this.createdAt = data.createdAt;

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
      resources: reports,
    });
  }

  /**
   * Gets the collection size.
   * 
   * @returns Number of resources in the collection
   */
  public get totalResources(): number {
    return this.resources.length;
  }

  /**
   * Checks if the collection is empty.
   * 
   * @returns True if no resources are in the collection
   */
  public get isEmpty(): boolean {
    return this.resources.length === 0;
  }

  /**
   * Gets total transfer size of all resources (bytes over the wire)
   * 
   * @returns Total bytes transferred across all resources
   */
  public get totalTransferSize(): number {
    return this.resources
      .reduce((total, resource) => total + resource.transferSize, 0);
  }

  /**
   * Gets total decoded size of all resources (uncompressed)
   * 
   * @returns Total uncompressed bytes across all resources
   */
  public get totalDecodedSize(): number {
    return this.resources
      .reduce((total, resource) => total + resource.decodedSize, 0);
  }

  /**
   * Gets total encoded size of all resources (compressed)
   * 
   * @returns Total compressed bytes across all resources
   */
  public get totalEncodedSize(): number {
    return this.resources
      .reduce((total, resource) => total + resource.encodedSize, 0);
  }

  /**
   * Gets the slowest loading resource
   * 
   * @returns Slowest resource or null if collection is empty
   */
  public get slowestResource(): ResourceTimingReport | null {
    if (this.isEmpty) return null;

    return this.resources
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
    return this.resources.filter(resource => resource.isThirdParty);
  }

  /**
   * Groups resources by their type (e.g., script, image, css).
   * 
   * @returns Record mapping resource types to arrays of ResourceTimingReport
   */
  public get resourcesByType (): Record<string, ResourceTimingReport[]> {
    const byType: Record<string, ResourceTimingReport[]> = {};
    this.resources.forEach(resource => {
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
      Math.round(this.resources.reduce((sum, r) => sum + r.duration, 0) / this.totalResources);
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
    this.resources.forEach(resource => {
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
    return this.resources.at(-1) || null;
  }


  toString(): string {
    return `ResourceTimingCollection: ${this.totalResources} resources, ${Math.round(this.totalTransferSize / 1024)}KB total`;
  }

  toJSON() {
    return {
      /**
       * Total number of resources in the collection
       */
      totalResources: this.totalResources,
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
      resources: Array.from(this.resources),
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