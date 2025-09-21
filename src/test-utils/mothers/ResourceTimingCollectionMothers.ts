/* eslint-disable @typescript-eslint/no-extraneous-class */
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { ResourceTimingReport } from '@/reports/performance/ResourceTimingReport';
import { ResourceTimingReportMothers } from './ResourceTimingReportMothers';

/**
 * Object Mother for ResourceTimingCollection test scenarios
 */
export class ResourceTimingCollectionMothers {
  /**
   * Empty collection
   */
  static empty() {
    return {
      id: 'empty-collection-001',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      resources: []
    };
  }

  /**
   * Single resource collection
   */
  static singleResource() {
    return {
      id: 'single-collection-002',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin + 100),
      resources: [
        ResourceTimingReport.create(ResourceTimingReportMothers.fastScript())
      ]
    };
  }

  /**
   * Mixed resource types - typical page load
   */
  static mixedTypes() {
    return {
      id: 'mixed-collection-003',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin + 500),
      resources: [
        ResourceTimingReport.create(ResourceTimingReportMothers.fastScript()),           // script, 250ms
        ResourceTimingReport.create(ResourceTimingReportMothers.compressedCSS()),       // link, 180ms  
        ResourceTimingReport.create(ResourceTimingReportMothers.slowThirdPartyImage()), // img, 1200ms
        ResourceTimingReport.create(ResourceTimingReportMothers.httpFont())             // css, 400ms
      ]
    };
  }

  /**
   * All third-party resources
   */
  static allThirdParty() {
    return {
      id: 'third-party-collection-004',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      resources: [
        ResourceTimingReport.create(ResourceTimingReportMothers.slowThirdPartyImage()), // cdn.thirdparty.com
        ResourceTimingReport.create(ResourceTimingReportMothers.compressedCSS()),       // fonts.googleapis.com
        ResourceTimingReport.create(ResourceTimingReportMothers.httpFont())             // fonts.example.com
      ]
    };
  }

  /**
   * Same domain multiple resources - testing domain grouping
   */
  static sameDomain() {
    const baseScript = ResourceTimingReportMothers.fastScript();
    const baseCached = ResourceTimingReportMothers.cached();
    
    return {
      id: 'same-domain-collection-005',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      resources: [
        ResourceTimingReport.create(baseScript),
        ResourceTimingReport.create(baseCached),
        ResourceTimingReport.create({
          ...baseScript,
          id: 'script-2',
          name: 'https://example.com/js/analytics.js',
          duration: 180
        })
      ]
    };
  }

  /**
   * Heavy compression scenario
   */
  static heavyCompression() {
    return {
      id: 'compression-collection-006',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      resources: [
        ResourceTimingReport.create(ResourceTimingReportMothers.compressedCSS()),       // 50% compression
        ResourceTimingReport.create(ResourceTimingReportMothers.slowThirdPartyImage()), // 36% compression
        ResourceTimingReport.create({
          ...ResourceTimingReportMothers.fastScript(),
          id: 'heavy-compressed-script',
          encodedSize: 15000,
          decodedSize: 50000, // 70% compression
          transferSize: 16000
        })
      ]
    };
  }

  /**
   * Performance bottleneck scenario - one very slow resource
   */
  static withBottleneck() {
    return {
      id: 'bottleneck-collection-007',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      resources: [
        ResourceTimingReport.create(ResourceTimingReportMothers.fastScript()),     // 250ms
        ResourceTimingReport.create(ResourceTimingReportMothers.compressedCSS()),  // 180ms
        ResourceTimingReport.create(ResourceTimingReportMothers.dnsBottleneck()),  // 800ms - bottleneck!
        ResourceTimingReport.create(ResourceTimingReportMothers.cached())          // 5ms
      ]
    };
  }

  /**
   * Large collection for testing aggregation performance
   */
  static largeCollection() {
    const resources = [];
    
    // Add multiple instances of each type
    for (let i = 0; i < 3; i++) {
      resources.push(ResourceTimingReport.create({
        ...ResourceTimingReportMothers.fastScript(),
        id: `script-${i}`,
        name: `https://example.com/js/script-${i}.js`
      }));
    }
    
    for (let i = 0; i < 2; i++) {
      resources.push(ResourceTimingReport.create({
        ...ResourceTimingReportMothers.compressedCSS(),
        id: `css-${i}`,
        name: `https://fonts.googleapis.com/css/font-${i}.css`
      }));
    }
    
    for (let i = 0; i < 4; i++) {
      resources.push(ResourceTimingReport.create({
        ...ResourceTimingReportMothers.slowThirdPartyImage(),
        id: `image-${i}`,
        name: `https://cdn.thirdparty.com/images/image-${i}.jpg`
      }));
    }

    return {
      id: 'large-collection-008',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      resources
    };
  }
}