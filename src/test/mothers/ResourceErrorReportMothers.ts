/* eslint-disable @typescript-eslint/no-extraneous-class */

import { ResourceErrorReport } from '@/reports/errors/ResourceErrorReport';
import { PerformanceTime } from '@/value-objects/PerformanceTime';

interface ResourceErrorData {
  id: string;
  createdAt: PerformanceTime;
  occurredAt: PerformanceTime;
  resourceUrl: string;
  resourceType: string;
}

export class ResourceErrorReportMothers {
  /**
   * Critical severity - First-party script error
   */
  static criticalScript(): ResourceErrorReport {
    const data: ResourceErrorData = {
      id: 'resource-critical-script',
      resourceUrl: 'https://example.com/app.js',
      resourceType: 'script',
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return ResourceErrorReport.create(data);
  }

  /**
   * High severity - Third-party script error
   */
  static highThirdPartyScript(): ResourceErrorReport {
    const data: ResourceErrorData = {
      id: 'resource-high-script',
      resourceUrl: 'https://cdn.analytics.com/tracker.js',
      resourceType: 'script',
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return ResourceErrorReport.create(data);
  }

  /**
   * High severity - Stylesheet error
   */
  static highStylesheet(): ResourceErrorReport {
    const data: ResourceErrorData = {
      id: 'resource-high-stylesheet',
      resourceUrl: 'https://example.com/styles.css',
      resourceType: 'stylesheet',
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return ResourceErrorReport.create(data);
  }

  /**
   * Medium severity - Image error
   */
  static mediumImage(): ResourceErrorReport {
    const data: ResourceErrorData = {
      id: 'resource-medium-image',
      resourceUrl: 'https://example.com/hero.jpg',
      resourceType: 'img',
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return ResourceErrorReport.create(data);
  }

  /**
   * Low severity - Video error
   */
  static lowVideo(): ResourceErrorReport {
    const data: ResourceErrorData = {
      id: 'resource-low-video',
      resourceUrl: 'https://example.com/video.mp4',
      resourceType: 'video',
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return ResourceErrorReport.create(data);
  }

  /**
   * Custom resource error with specific properties
   */
  static withCustom(overrides: Partial<ResourceErrorData>): ResourceErrorReport {
    const defaultData: ResourceErrorData = {
      id: 'resource-custom',
      resourceUrl: 'https://example.com/resource.js',
      resourceType: 'script',
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return ResourceErrorReport.create({ ...defaultData, ...overrides });
  }
}