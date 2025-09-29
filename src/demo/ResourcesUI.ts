import { observeResourceTiming } from '@/metrics/performance';
import { ActivityLogger } from './ActivityLogger';


const logger = ActivityLogger.getInstance();

const toKB = (bytes: number) => (bytes / 1024).toFixed(2);

observeResourceTiming().onSuccess((collection) => {
  const resourceCountElement = document.getElementById('resource-count');
  const resourceSizeElement = document.getElementById('resource-size');
  const resourceTimeElement = document.getElementById('resource-time');
  
  if (resourceCountElement) {
    resourceCountElement.textContent = `${collection.totalReports}`;
  }
  
  if (resourceSizeElement) {
    resourceSizeElement.textContent = `${toKB(collection.totalTransferSize)} KB`;
  }
  
  if (resourceTimeElement) {
    resourceTimeElement.textContent = `${collection.averageLoadTime.toFixed(2)} ms`;
  }

  const resourceListElement = document.getElementById('resource-list');
  if (resourceListElement) {
    // empty previous list
    resourceListElement.innerHTML = '';

    // populate with new data
    collection.reports.forEach((report) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${report.name} - ${toKB(report.transferSize)} KB -`;
      resourceListElement.appendChild(listItem);
    });
  }

  logger.success(`[Resource Timing] Total Resources: ${collection.totalReports}, Total Size: ${toKB(collection.totalTransferSize)} KB, Average Load Time: ${toKB(collection.averageLoadTime)} KB`);
});