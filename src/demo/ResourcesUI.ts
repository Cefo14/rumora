import { observeResourceTiming } from '@/metrics/performance';
import { ActivityLogger } from './ActivityLogger';
import { updateElement, toKB } from './helpers';
import type { ResourceTimingCollection, ResourceTimingReport } from '@/reports';

const logger = ActivityLogger.getInstance();

export function initResourceTiming(): void {
  observeResourceTiming()
    .onSuccess((collection) => {
      // Update summary stats
      updateElement('resource-count', collection.totalReports);
      updateElement('resource-size', `${toKB(collection.totalTransferSize)} KB`);
      updateElement('resource-time', `${collection.averageLoadTime.toFixed(0)}ms`);
      updateElement('resource-third-party', collection.thirdPartyResources.length);
      
      // Update insights
      updateInsights(collection);
      
      // Update resource table
      updateResourceTable(collection);
      
      logger.success(`Resource loaded: ${collection.lastReport?.name.split('/').pop() || 'unknown'}`);
    })
    .onError((error) => {
      logger.error(`Resource timing error: ${error.message}`);
    });
}

function updateInsights(collection: ResourceTimingCollection): void {
  const insightsEl = document.getElementById('resource-insights');
  if (!insightsEl) return;
  
  const insights: string[] = [];
  
  // Slowest resource
  const slowest = collection.slowestResource;
  if (slowest) {
    insights.push(`⚠️ Slowest: ${slowest.name.split('/').pop()} (${slowest.duration.toFixed(0)}ms)`);
  }
  
  // Compression savings
  const compressionSavings = collection.compressionSavings;
  if (compressionSavings > 0) {
    const savingsPercent = ((compressionSavings / collection.totalDecodedSize) * 100).toFixed(1);
    insights.push(`✓ Compression saved ${toKB(compressionSavings)} KB (${savingsPercent}%)`);
  }
  
  // Third party resources
  if (collection.thirdPartyResources.length > 0) {
    const thirdPartyPercent = ((collection.thirdPartyResources.length / collection.totalReports) * 100).toFixed(0);
    insights.push(`🌐 ${collection.thirdPartyResources.length} third-party resources (${thirdPartyPercent}%)`);
  }
  
  // Resources by type
  const byType = collection.resourcesByType;
  const typeCount = Object.entries(byType)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3)
    .map(([type, resources]: [string, ResourceTimingReport[]]) => `${type}: ${resources.length}`)
    .join(', ');
  if (typeCount) {
    insights.push(`📦 Types: ${typeCount}`);
  }
  
  insightsEl.innerHTML = insights.map(insight => 
    `<div>${insight}</div>`
  ).join('');
}

function updateResourceTable(collection: ResourceTimingCollection): void {
  const tableBody = document.getElementById('resource-table-body');
  if (!tableBody) return;
  
  // Clear previous rows
  tableBody.innerHTML = '';
  
  // Show last 15 resources
  const recentResources = collection.reports;
  
  recentResources.forEach((report) => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50 transition-colors';
    
    // Name column
    const nameCell = document.createElement('td');
    nameCell.className = 'px-3 py-2 max-w-xs truncate';
    const fileName = report.name.split('/').pop() || report.name;
    nameCell.textContent = fileName;
    nameCell.title = report.name; // Full path on hover
    if (report.isThirdParty) {
      nameCell.className += ' text-orange-700';
    }
    
    const domainCell = document.createElement('td');
    domainCell.className = 'px-3 py-2 max-w-xs truncate';
    domainCell.textContent = report.domain;
    domainCell.title = report.domain;

    // Type column
    const typeCell = document.createElement('td');
    typeCell.className = 'px-3 py-2';
    const typeSpan = document.createElement('span');
    typeSpan.className = getTypeColorClass(report.type);
    typeSpan.textContent = report.type || 'other';
    typeCell.appendChild(typeSpan);
    
    // Size column
    const sizeCell = document.createElement('td');
    sizeCell.className = 'px-3 py-2 text-right font-mono';
    sizeCell.textContent = toKB(report.transferSize) + ' KB';
    
    // Duration column
    const durationCell = document.createElement('td');
    durationCell.className = 'px-3 py-2 text-right font-mono';
    const duration = report.duration.toFixed(0);
    durationCell.textContent = duration + 'ms';
    if (report.duration > 1000) {
      durationCell.className += ' text-red-600 font-semibold';
    } else if (report.duration > 500) {
      durationCell.className += ' text-orange-600';
    }
    
    // Append all cells
    row.appendChild(nameCell);
    row.appendChild(domainCell);
    row.appendChild(typeCell);
    row.appendChild(sizeCell);
    row.appendChild(durationCell);
    
    tableBody.appendChild(row);
  });
}

function getTypeColorClass(type: string): string {
  const baseClass = 'px-2 py-0.5 rounded-full text-xs font-medium ';
  const colorMap: Record<string, string> = {
    'script': 'bg-blue-100 text-blue-700',
    'css': 'bg-purple-100 text-purple-700',
    'img': 'bg-green-100 text-green-700',
    'fetch': 'bg-yellow-100 text-yellow-700',
    'xmlhttprequest': 'bg-orange-100 text-orange-700',
    'link': 'bg-pink-100 text-pink-700',
  };
  return baseClass + (colorMap[type] || 'bg-gray-100 text-gray-700');
}
