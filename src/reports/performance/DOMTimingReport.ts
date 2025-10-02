import type { Report } from '@/reports/Report';
import { PerformanceTime } from '@/value-objects/PerformanceTime';

interface DOMTimingData {
  id: string;
  createdAt: PerformanceTime;
  occurredAt: PerformanceTime;
  
  // Core DOM milestones (time from navigation start)
  timeToInteractive: number;        // Until DOM interactive
  timeToContentLoaded: number;      // Until DOMContentLoaded fired
  timeToDOMComplete: number;        // Until DOM parsing complete
  timeToFullLoad: number;           // Until load event complete
  
  // Event execution durations
  domContentLoadedDuration: number; // Time spent in DOMContentLoaded handlers
  loadEventDuration: number;        // Time spent in load event handlers
}

/**
 * Report for measuring DOM processing and load timing performance.
 * 
 * Tracks key milestones in the DOM lifecycle from initial navigation to complete
 * page load, including time spent executing event listeners. This report helps
 * identify bottlenecks in DOM parsing, script execution, and resource loading.
 * 
 * Timeline:
 * Navigation → DOM Interactive → DOMContentLoaded → DOM Complete → Load Complete
 *              (DOM ready)       (Initial scripts)  (Parsing done) (All resources)
 */
export class DOMTimingReport implements Report {
  public readonly id: string;
  public readonly createdAt: PerformanceTime;
  public readonly occurredAt: PerformanceTime;
  
  /**
   * Time from navigation start to DOM interactive.
   * At this point, the DOM is ready and JavaScript can access it.
   */
  public readonly timeToInteractive: number;
  
  /**
   * Time from navigation start to DOMContentLoaded event completion.
   * Indicates when the initial HTML document has been loaded and parsed.
   */
  public readonly timeToContentLoaded: number;
  
  /**
   * Time from navigation start to DOM complete.
   * All DOM parsing is finished, including deferred scripts.
   */
  public readonly timeToDOMComplete: number;
  
  /**
   * Time from navigation start to load event completion.
   * All resources (images, stylesheets, scripts) have finished loading.
   */
  public readonly timeToFullLoad: number;
  
  /**
   * Duration of DOMContentLoaded event handlers execution.
   * Time spent running all DOMContentLoaded event listeners.
   */
  public readonly domContentLoadedDuration: number;
  
  /**
   * Duration of load event handlers execution.
   * Time spent running all load event listeners.
   */
  public readonly loadEventDuration: number;

  private constructor(data: DOMTimingData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.occurredAt = data.occurredAt;
    this.timeToInteractive = data.timeToInteractive;
    this.timeToContentLoaded = data.timeToContentLoaded;
    this.timeToDOMComplete = data.timeToDOMComplete;
    this.timeToFullLoad = data.timeToFullLoad;
    this.domContentLoadedDuration = data.domContentLoadedDuration;
    this.loadEventDuration = data.loadEventDuration;

    Object.freeze(this);
  }

  /**
   * Creates a DOMTimingReport from provided data.
   */
  public static create(data: DOMTimingData): DOMTimingReport {
    return new DOMTimingReport(data);
  }

  /**
   * Creates a DOMTimingReport from PerformanceNavigationTiming entry.
   */
  public static fromPerformanceEntry(
    id: string, 
    entry: PerformanceNavigationTiming
  ): DOMTimingReport {
    return new DOMTimingReport({
      id,
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(entry.startTime),
      
      // Milestones from navigation start
      timeToInteractive: Math.max(0, entry.domInteractive - entry.fetchStart),
      timeToContentLoaded: Math.max(0, entry.domContentLoadedEventEnd - entry.fetchStart),
      timeToDOMComplete: Math.max(0, entry.domComplete - entry.fetchStart),
      timeToFullLoad: Math.max(0, entry.loadEventEnd - entry.fetchStart),
      
      // Event execution durations
      domContentLoadedDuration: Math.max(0, 
        entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart
      ),
      loadEventDuration: Math.max(0, 
        entry.loadEventEnd - entry.loadEventStart
      ),
    });
  }

  /**
   * Time spent parsing the DOM after it becomes interactive.
   * Represents the duration from DOM interactive to DOM complete.
   */
  public get domParsingTime(): number {
    return Math.max(0, this.timeToDOMComplete - this.timeToInteractive);
  }

  /**
   * Time spent loading resources after DOM parsing is complete.
   * Represents the duration from DOM complete to full load.
   */
  public get resourceLoadTime(): number {
    return Math.max(0, this.timeToFullLoad - this.timeToDOMComplete);
  }

  /**
   * Total time spent executing event listeners.
   * Combined duration of DOMContentLoaded and load event handlers.
   */
  public get totalEventHandlerTime(): number {
    return this.domContentLoadedDuration + this.loadEventDuration;
  }

  /**
   * Checks if event handlers are executing too slowly.
   * Event handlers taking more than 50ms may impact user experience.
   */
  public get hasSlowEventHandlers(): boolean {
    return this.totalEventHandlerTime > 50;
  }

  /**
   * Identifies the slowest phase in the page load lifecycle.
   * Helps pinpoint optimization opportunities.
   */
  public get slowestPhase(): 'dom-parsing' | 'resource-loading' | 'event-handlers' | 'interactive' {
    const phases: Record<string, number> = {
      'interactive': this.timeToInteractive,
      'dom-parsing': this.domParsingTime,
      'resource-loading': this.resourceLoadTime,
      'event-handlers': this.totalEventHandlerTime,
    } as const;

    return Object.entries(phases).reduce((slowest, [phase, duration]) => duration > phases[slowest] ? phase : slowest,
      'interactive'
    ) as unknown as 'dom-parsing' | 'resource-loading' | 'event-handlers' | 'interactive';
  }

  /**
   * String representation of DOM timing metrics.
   */
  public toString(): string {
    return `DOMTiming: ${this.timeToFullLoad}ms total (Interactive: ${this.timeToInteractive}ms, DOMContentLoaded: ${this.timeToContentLoaded}ms)`;
  }

  /**
   * JSON representation for serialization and analysis.
   */
  public toJSON() {
    return {
      // Metadata
      id: this.id,
      createdAt: this.createdAt.absoluteTime,
      occurredAt: this.occurredAt.absoluteTime,
      
      // Core milestones
      timeToInteractive: this.timeToInteractive,
      timeToContentLoaded: this.timeToContentLoaded,
      timeToDOMComplete: this.timeToDOMComplete,
      timeToFullLoad: this.timeToFullLoad,
      
      // Event execution
      domContentLoadedDuration: this.domContentLoadedDuration,
      loadEventDuration: this.loadEventDuration,
      totalEventHandlerTime: this.totalEventHandlerTime,
      
      // Derived metrics
      domParsingTime: this.domParsingTime,
      resourceLoadTime: this.resourceLoadTime,
      hasSlowEventHandlers: this.hasSlowEventHandlers,
      slowestPhase: this.slowestPhase,
    };
  }
}
