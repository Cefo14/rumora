import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ResourceTimingCollectionMothers } from '@/test/mothers/ResourceTimingCollectionMothers';
import { ResourceTimingReportMothers } from '@/test/mothers/ResourceTimingReportMothers';
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { ResourceTimingReport } from '@/reports/performance/ResourceTimingReport';
import { windowLocationHelper } from '@/test/helpers/WindowLocationHelper';

import { ResourceTimingCollection } from './ResourceTimingCollection';

describe('ResourceTimingCollection', () => {
  beforeEach(() => {
    windowLocationHelper.mock();
  });
  afterEach(() => {
    windowLocationHelper.unmock();
  });

  describe('create factory method', () => {
    it('should create ResourceTimingCollection with provided data', () => {
      // Given
      const data = ResourceTimingCollectionMothers.mixedTypes();

      // When
      const collection = ResourceTimingCollection.create(data);

      // Then
      expect(collection.id).toBe(data.id);
      expect(collection.createdAt).toBe(data.createdAt);
      expect(collection.totalReports).toBe(4);
    });

    it('should freeze the created collection instance', () => {
      // Given
      const data = ResourceTimingCollectionMothers.singleResource();

      // When
      const collection = ResourceTimingCollection.create(data);

      // Then
      expect(Object.isFrozen(collection)).toBe(true);
    });
  });

  describe('fromResourceTimingReports factory method', () => {
    it('should create ResourceTimingCollection from array of reports', () => {
      // Given
      const id = 'test-collection';
      const reports = [
        ResourceTimingReport.create(ResourceTimingReportMothers.fastScript()),
        ResourceTimingReport.create(ResourceTimingReportMothers.compressedCSS())
      ];
      vi.spyOn(PerformanceTime, 'now').mockReturnValue(
        PerformanceTime.fromAbsoluteTime(performance.timeOrigin)
      );

      // When
      const collection = ResourceTimingCollection.fromResourceTimingReports(id, reports);

      // Then
      expect(collection.id).toBe(id);
      expect(collection.totalReports).toBe(2);
    });

    it('should handle empty array correctly', () => {
      // Given
      const id = 'empty-test-collection';
      const reports: ResourceTimingReport[] = [];

      // When
      const collection = ResourceTimingCollection.fromResourceTimingReports(id, reports);

      // Then
      expect(collection.isEmpty).toBe(true);
      expect(collection.totalReports).toBe(0);
    });
  });

  describe('basic metrics', () => {
    it('should return correct total reports count', () => {
      // Given
      const data = ResourceTimingCollectionMothers.mixedTypes();
      const collection = ResourceTimingCollection.create(data);

      // When
      const total = collection.totalReports;

      // Then
      expect(total).toBe(4);
    });

    it('should detect empty collection correctly', () => {
      // Given
      const empty = ResourceTimingCollection.create(ResourceTimingCollectionMothers.empty());
      const nonEmpty = ResourceTimingCollection.create(ResourceTimingCollectionMothers.singleResource());

      // When & Then
      expect(empty.isEmpty).toBe(true);
      expect(nonEmpty.isEmpty).toBe(false);
    });
  });

  describe('reports property', () => {
    it('should be immutable - modifying returned array should not affect collection', () => {
      // Given
      const data = ResourceTimingCollectionMothers.mixedTypes();
      const collection = ResourceTimingCollection.create(data);

      // When
      const reports = collection.reports;

      // Then
      expect(Object.isFrozen(reports)).toBe(true);
        expect(() => {
          (reports as ResourceTimingReport[])
            .push(
              ResourceTimingReport.create(ResourceTimingReportMothers.fastScript())
            );
        }).toThrow();
    });
  });

  describe('size aggregation metrics', () => {
    it('should calculate total transfer size correctly', () => {
      // Given
      const data = ResourceTimingCollectionMothers.mixedTypes();
      const collection = ResourceTimingCollection.create(data);

      // When
      const totalTransferSize = collection.totalTransferSize;

      // Then
      // fastScript: 45000 + compressedCSS: 8000 + slowThirdPartyImage: 120000 + httpFont: 25000
      expect(totalTransferSize).toBe(198000);
    });

    it('should calculate total decoded size correctly', () => {
      // Given
      const data = ResourceTimingCollectionMothers.heavyCompression();
      const collection = ResourceTimingCollection.create(data);

      // When
      const totalDecodedSize = collection.totalDecodedSize;

      // Then
      // compressedCSS: 12000 + slowThirdPartyImage: 150000 + heavy-compressed: 50000
      expect(totalDecodedSize).toBe(212000);
    });

    it('should calculate total encoded size correctly', () => {
      // Given
      const data = ResourceTimingCollectionMothers.heavyCompression();
      const collection = ResourceTimingCollection.create(data);

      // When
      const totalEncodedSize = collection.totalEncodedSize;

      // Then
      // compressedCSS: 6000 + slowThirdPartyImage: 95000 + heavy-compressed: 15000
      expect(totalEncodedSize).toBe(116000);
    });

    it('should calculate compression savings correctly', () => {
      // Given
      const data = ResourceTimingCollectionMothers.heavyCompression();
      const collection = ResourceTimingCollection.create(data);

      // When
      const savings = collection.compressionSavings;

      // Then
      expect(savings).toBe(96000); // 212000 - 116000
    });
  });

  describe('performance analysis', () => {
    it('should identify slowest resource correctly', () => {
      // Given
      const data = ResourceTimingCollectionMothers.withBottleneck();
      const collection = ResourceTimingCollection.create(data);

      // When
      const slowest = collection.slowestResource;

      // Then
      expect(slowest).not.toBeNull();
      expect(slowest!.duration).toBe(800); // dnsBottleneck scenario
      expect(slowest!.name).toBe('https://slow-dns.example.com/api/data.json');
    });

    it('should return null for slowest resource when collection is empty', () => {
      // Given
      const data = ResourceTimingCollectionMothers.empty();
      const collection = ResourceTimingCollection.create(data);

      // When
      const slowest = collection.slowestResource;

      // Then
      expect(slowest).toBeNull();
    });

    it('should calculate average load time correctly', () => {
      // Given
      const data = ResourceTimingCollectionMothers.mixedTypes();
      const collection = ResourceTimingCollection.create(data);

      // When
      const averageTime = collection.averageLoadTime;

      // Then
      // (250 + 180 + 1200 + 400) / 4 = 507.5, rounded = 508
      expect(averageTime).toBe(508);
    });

    it('should return 0 average load time for empty collection', () => {
      // Given
      const data = ResourceTimingCollectionMothers.empty();
      const collection = ResourceTimingCollection.create(data);

      // When
      const averageTime = collection.averageLoadTime;

      // Then
      expect(averageTime).toBe(0);
    });
  });

  describe('filtering and grouping', () => {
    it('should filter third-party resources correctly', () => {
      // Given
      const data = ResourceTimingCollectionMothers.mixedTypes();
      const collection = ResourceTimingCollection.create(data);

      // When
      const thirdPartyResources = collection.thirdPartyResources;

      // Then
      expect(thirdPartyResources).toHaveLength(3); // compressedCSS, slowThirdPartyImage, httpFont
      expect(thirdPartyResources.every(r => r.isThirdParty)).toBe(true);
    });

    it('should group resources by type correctly', () => {
      // Given
      const data = ResourceTimingCollectionMothers.mixedTypes();
      const collection = ResourceTimingCollection.create(data);

      // When
      const byType = collection.resourcesByType;

      // Then
      expect(Object.keys(byType)).toEqual(['script', 'link', 'img', 'css']);
      expect(byType.script).toHaveLength(1);
      expect(byType.link).toHaveLength(1);
      expect(byType.img).toHaveLength(1);
      expect(byType.css).toHaveLength(1);
    });

    it('should group resources by domain correctly', () => {
      // Given
      const data = ResourceTimingCollectionMothers.sameDomain();
      const collection = ResourceTimingCollection.create(data);

      // When
      const byDomain = collection.resourcesByDomain;

      // Then
      expect(Object.keys(byDomain)).toEqual(['example.com']);
      expect(byDomain['example.com']).toHaveLength(3);
    });

    it('should handle multiple domains grouping', () => {
      // Given
      const data = ResourceTimingCollectionMothers.allThirdParty();
      const collection = ResourceTimingCollection.create(data);

      // When
      const byDomain = collection.resourcesByDomain;

      // Then
      expect(Object.keys(byDomain).sort()).toEqual([
        'cdn.thirdparty.com',
        'fonts.example.com', 
        'fonts.googleapis.com'
      ]);
      expect(byDomain['cdn.thirdparty.com']).toHaveLength(1);
      expect(byDomain['fonts.googleapis.com']).toHaveLength(1);
      expect(byDomain['fonts.example.com']).toHaveLength(1);
    });
  });

  describe('toString', () => {
    it('should return formatted string with resource count and total size', () => {
      // Given
      const data = ResourceTimingCollectionMothers.mixedTypes();
      const collection = ResourceTimingCollection.create(data);

      // When
      const stringRepresentation = collection.toString();

      // Then
      expect(stringRepresentation).toBe('ResourceTimingCollection: 4 resources, 193KB total');
    });

    it('should handle empty collection correctly', () => {
      // Given
      const data = ResourceTimingCollectionMothers.empty();
      const collection = ResourceTimingCollection.create(data);

      // When
      const stringRepresentation = collection.toString();

      // Then
      expect(stringRepresentation).toBe('ResourceTimingCollection: 0 resources, 0KB total');
    });
  });

  describe('toJSON', () => {
    it('should return complete object representation with all aggregated metrics', () => {
      // Given
      const data = ResourceTimingCollectionMothers.mixedTypes();
      const collection = ResourceTimingCollection.create(data);

      // When
      const jsonRepresentation = collection.toJSON();

      // Then
      expect(jsonRepresentation).toEqual({
        // Collection metadata
        id: data.id,
        createdAt: data.createdAt.absoluteTime,
        
        // Basic aggregation metrics
        totalReports: 4,
        totalTransferSize: 198000,
        totalDecodedSize: 219000, // 35000 + 12000 + 150000 + 22000
        totalEncodedSize: 158000,  // 35000 + 6000 + 95000 + 22000
        compressionSavings: 61000, // 219000 - 158000
        averageLoadTime: 508,

        // Collections and groupings  
        reports: data.reports,
        resourcesByType: collection.resourcesByType,
        resourcesByDomain: collection.resourcesByDomain,
        thirdPartyResources: collection.thirdPartyResources,
        slowestResource: collection.slowestResource,
        lastResource: collection.lastResource
      });
    });

    it('should handle empty collection correctly', () => {
      // Given
      const data = ResourceTimingCollectionMothers.empty();
      const collection = ResourceTimingCollection.create(data);

      // When
      const jsonRepresentation = collection.toJSON();

      // Then
      expect(jsonRepresentation.totalReports).toBe(0);
      expect(jsonRepresentation.totalTransferSize).toBe(0);
      expect(jsonRepresentation.averageLoadTime).toBe(0);
      expect(jsonRepresentation.slowestResource).toBeNull();
      expect(jsonRepresentation.lastResource).toBeNull();
      expect(jsonRepresentation.reports).toEqual([]);
      expect(jsonRepresentation.thirdPartyResources).toEqual([]);
    });

    it('should use reports property in toJSON output', () => {
      // Given
      const data = ResourceTimingCollectionMothers.mixedTypes();
      const collection = ResourceTimingCollection.create(data);

      // When
      const jsonRepresentation = collection.toJSON();

      // Then
      expect(jsonRepresentation.reports).toEqual(collection.reports);
      expect(jsonRepresentation.reports).toHaveLength(collection.totalReports);
    });
  });

  describe('lastResource', () => {
    it('should return the last resource in the collection', () => {
      // Given
      const data = ResourceTimingCollectionMothers.mixedTypes();
      const collection = ResourceTimingCollection.create(data);

      // When
      const lastResource = collection.lastResource;

      // Then
      expect(lastResource).not.toBeNull();
      expect(lastResource).toBe(data.reports[data.reports.length - 1]);
    });

    it('should return null for empty collection', () => {
      // Given
      const data = ResourceTimingCollectionMothers.empty();
      const collection = ResourceTimingCollection.create(data);

      // When
      const lastResource = collection.lastResource;

      // Then
      expect(lastResource).toBeNull();
    });

    it('should return the only resource when collection has single item', () => {
      // Given
      const data = ResourceTimingCollectionMothers.singleResource();
      const collection = ResourceTimingCollection.create(data);

      // When
      const lastResource = collection.lastResource;

      // Then
      expect(lastResource).not.toBeNull();
      expect(lastResource).toBe(data.reports[0]);
    });

    it('should be included in toJSON output correctly', () => {
      // Given
      const data = ResourceTimingCollectionMothers.mixedTypes();
      const collection = ResourceTimingCollection.create(data);

      // When
      const jsonRepresentation = collection.toJSON();

      // Then
      expect(jsonRepresentation.lastResource).toBe(collection.lastResource);
      expect(jsonRepresentation.lastResource).toBe(data.reports[data.reports.length - 1]);
    });
  });

  describe('edge cases', () => {
    it('should handle large collections efficiently', () => {
      // Given
      const data = ResourceTimingCollectionMothers.largeCollection();
      const collection = ResourceTimingCollection.create(data);

      // When & Then
      expect(collection.totalReports).toBe(9); // 3 scripts + 2 css + 4 images
      expect(collection.resourcesByType.script).toHaveLength(3);
      expect(collection.resourcesByType.link).toHaveLength(2);
      expect(collection.resourcesByType.img).toHaveLength(4);
      expect(collection.thirdPartyResources.length).toBeGreaterThan(0);
    });

    it('should maintain immutability when accessing computed properties', () => {
      // Given
      const data = ResourceTimingCollectionMothers.mixedTypes();
      const collection = ResourceTimingCollection.create(data);

      // When
      const total1 = collection.totalReports;
      const total2 = collection.totalReports;
      const byType1 = collection.resourcesByType;
      const byType2 = collection.resourcesByType;

      // Then
      expect(total1).toBe(total2);
      expect(byType1).toEqual(byType2);
      expect(Object.isFrozen(collection)).toBe(true);
    });

    it('should handle collections with only cached resources', () => {
      // Given
      const cachedResource = ResourceTimingReport.create(ResourceTimingReportMothers.cached());
      const data = {
        id: 'cached-only',
        createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
        reports: [cachedResource]
      };
      const collection = ResourceTimingCollection.create(data);

      // When & Then
      expect(collection.totalTransferSize).toBe(0);
      expect(collection.compressionSavings).toBe(8000); // 8000 - 0
      expect(collection.averageLoadTime).toBe(5);
    });
  });
});