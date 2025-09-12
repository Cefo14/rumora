import { PerformanceTime } from "@/value-objects/PerformanceTime";
import { ErrorReport, SeverityLevel } from "./ErrorReport";

interface ResourceErrorData {
  id: string;
  createdAt: PerformanceTime;
  occurredAt: PerformanceTime;
  resourceUrl: string;
  resourceType: string;
}

/**
 * Extracts resource type from ErrorEvent target element.
 */
const getResourceType = (errorEvent: ErrorEvent): string => {
  const target = errorEvent.target as HTMLElement;
  const tagName = target.tagName.toLowerCase();

  if (tagName === 'link') {
    const rel = (target as HTMLLinkElement).rel;
    if (rel?.includes('stylesheet')) return 'stylesheet';
    return 'link';
  }

  return tagName;
};

/**
 * Extracts resource URL from ErrorEvent target element.
 */
const getResourceURL = (errorEvent: ErrorEvent): string => {
  const target = errorEvent.target as HTMLElement;
  if ('src' in target && target.src) return target.src as string;
  if ('href' in target && target.href) return target.href as string;
  if ('data' in target && target.data) return target.data as string;
  return 'Unknown resource';
};

/**
 * Report for capturing resource loading failures.
 * 
 * Provides structured error information for monitoring
 * and debugging failed resource loads.
 */
export class ResourceErrorReport implements ErrorReport {
  public readonly id: string;
  public readonly createdAt: PerformanceTime;
  public readonly occurredAt: PerformanceTime;
  public readonly resourceUrl: string;
  public readonly resourceType: string;

  private constructor(data: ResourceErrorData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.occurredAt = data.occurredAt;
    this.resourceType = data.resourceType;
    this.resourceUrl = data.resourceUrl;

    Object.freeze(this);
  }

  /**
   * Creates a ResourceErrorReport from provided data.
   */
  public static create(data: ResourceErrorData): ResourceErrorReport {
    return new ResourceErrorReport(data);
  }

  /**
   * Creates a ResourceErrorReport from an ErrorEvent.
   */
  public static fromErrorEvent(id: string, errorEvent: ErrorEvent): ResourceErrorReport {
    return new ResourceErrorReport({
      id,
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(errorEvent.timeStamp),
      resourceUrl: getResourceURL(errorEvent),
      resourceType: getResourceType(errorEvent),
    });
  }

  /**
   * Basic severity classification based on resource type.
   */
  public get severity(): SeverityLevel {
    // Critical: Scripts can break functionality
    if (this.resourceType === 'script') {
      return this.isThirdParty ? 'high' : 'critical';
    }

    // High: Stylesheets affect appearance significantly
    if (this.resourceType === 'stylesheet' || this.resourceType === 'link') {
      return 'high';
    }

    // Medium: Images and interactive content
    if (['img', 'image', 'iframe'].includes(this.resourceType)) {
      return 'medium';
    }

    // Low: Everything else (audio, video, etc.)
    return 'low';
  }

  /**
   * Checks if resource is from a different domain.
   */
  public get isThirdParty(): boolean {
    if (this.resourceUrl === 'Unknown resource') return false;

    try {
      const resourceHost = new URL(this.resourceUrl).hostname;
      const currentHost = window.location.hostname;
      return resourceHost !== currentHost;
    } catch {
      return false;
    }
  }

  /**
   * Gets the domain name from the resource URL.
   */
  public get resourceDomain(): string {
    try {
      return new URL(this.resourceUrl).hostname;
    } catch {
      return 'Unknown domain';
    }
  }

  /**
   * Checks if this is a critical resource type.
   */
  public get isCriticalResource(): boolean {
    return ['script', 'stylesheet'].includes(this.resourceType);
  }

  /**
   * String representation of the resource loading error.
   */
  public toString(): string {
    const thirdParty = this.isThirdParty ? ' [3rd-party]' : '';
    return `Resource Error [${this.severity.toUpperCase()}]: Failed to load ${this.resourceType} - ${this.resourceUrl}${thirdParty}`;
  }

  /**
   * JSON representation for serialization.
   */
  public toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt.absoluteTime,
      occurredAt: this.occurredAt.absoluteTime,
      resourceUrl: this.resourceUrl,
      resourceType: this.resourceType,
      resourceDomain: this.resourceDomain,
      severity: this.severity,
      isThirdParty: this.isThirdParty,
      isCriticalResource: this.isCriticalResource,
    };
  }
}
