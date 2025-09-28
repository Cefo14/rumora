import { observeResourceTiming } from '@/metrics/performance';
import { ActivityLogger } from './ActivityLogger';

const logger = ActivityLogger.getInstance();

const toKB = (bytes: number) => (bytes / 1024).toFixed(2);

observeResourceTiming().onSuccess((report) => {
  const resourceCountElement = document.getElementById('resource-count');
  const resourceSizeElement = document.getElementById('resource-size');
  const resourceTimeElement = document.getElementById('resource-time');
  
  if (resourceCountElement) {
    resourceCountElement.textContent = `${report.totalResources}`;
  }
  
  if (resourceSizeElement) {
    resourceSizeElement.textContent = `${toKB(report.totalTransferSize)} KB`;
  }
  
  if (resourceTimeElement) {
    resourceTimeElement.textContent = `${report.averageLoadTime.toFixed(2)} ms`;
  }

  const resourceListElement = document.getElementById('resource-list');
  if (resourceListElement) {
    // empty previous list
    resourceListElement.innerHTML = '';

    // populate with new data
    report.resources.forEach((resource) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${resource.name} - ${toKB(resource.transferSize)} KB`;
      resourceListElement.appendChild(listItem);
    });
  }

  logger.success(`[Resource Timing] Total Resources: ${report.totalResources}, Total Size: ${toKB(report.totalTransferSize)} KB, Average Load Time: ${toKB(report.averageLoadTime)} KB`);
});